#!/usr/bin/env python3
"""
todo_mirror.py — push the Coda task list out to Slack, Gmail, and Google Calendar.

Run daily from cron (see CLAUDE.md "Scheduled jobs"). Each channel is guarded
independently and skipped (with a log line) if its credentials/config are absent,
so a missing Slack ID or un-consented Calendar never breaks the others.

  python3 todo_mirror.py                 # all available channels
  python3 todo_mirror.py --digest        # Slack + Gmail digest only
  python3 todo_mirror.py --calendar      # calendar sync only
  python3 todo_mirror.py --dry-run       # print what would happen, change nothing

Channels:
  Slack    : DMs the digest to config.mirror.slack_dm_user_id via SLACK_BOT_TOKEN.
  Gmail    : emails the digest to config.mirror.email_to via ~/.gmail-mcp creds.
  Calendar : one all-day event per task-with-deadline; event ids stored back in
             the CalEventId column so re-runs update/delete rather than duplicate.
"""
import argparse
import base64
import json
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from email.mime.text import MIMEText
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from todo import Coda, load_config, build_digest, norm_date  # noqa: E402
from google_oauth import load_gmail_token, load_generic_token  # noqa: E402


def log(msg):
    print(f"[todo_mirror] {msg}")


def http_json(url, method="GET", token=None, body=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else {}


# --------------------------------------------------------------------------- #
# Slack
# --------------------------------------------------------------------------- #
def read_env_value(env_path, key):
    p = Path(env_path)
    if not p.exists():
        return None
    for line in p.read_text().splitlines():
        line = line.strip()
        if line.startswith(key) and "=" in line and not line.startswith("#"):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def mirror_slack(cfg, text, dry_run):
    m = cfg["mirror"]
    user_id = m.get("slack_dm_user_id", "").strip()
    token = read_env_value(m["slack_env"], "SLACK_BOT_TOKEN")
    if not token:
        log("Slack: no SLACK_BOT_TOKEN — skipped.")
        return
    if not user_id:
        log("Slack: config.mirror.slack_dm_user_id is empty — skipped "
            "(set your Slack member ID to enable DMs).")
        return
    if dry_run:
        log(f"Slack: would DM user {user_id} ({len(text)} chars).")
        return
    body = {"channel": user_id, "text": text, "unfurl_links": False}
    req = urllib.request.Request(
        "https://slack.com/api/chat.postMessage",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        r = json.load(resp)
    if r.get("ok"):
        log(f"Slack: DM sent to {user_id}.")
    else:
        log(f"Slack: FAILED — {r.get('error')}")


# --------------------------------------------------------------------------- #
# Gmail
# --------------------------------------------------------------------------- #
def mirror_gmail(cfg, text, dry_run):
    m = cfg["mirror"]
    tok_path, keys_path = m.get("gmail_token"), m.get("gmail_keys")
    if not (tok_path and Path(tok_path).exists() and keys_path and Path(keys_path).exists()):
        log("Gmail: credentials not found — skipped.")
        return
    to = m.get("email_to")
    if not to:
        log("Gmail: config.mirror.email_to empty — skipped.")
        return
    subject = f"Tasks digest — {date.today().strftime('%a %b %d')}"
    if dry_run:
        log(f"Gmail: would email '{subject}' to {to}.")
        return
    try:
        access = load_gmail_token(tok_path, keys_path)
    except Exception as e:
        log(f"Gmail: token refresh FAILED — {e}")
        return
    msg = MIMEText(text)
    msg["to"] = to
    msg["from"] = m.get("email_from", to)
    msg["subject"] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    try:
        http_json("https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                  method="POST", token=access, body={"raw": raw})
        log(f"Gmail: digest emailed to {to}.")
    except Exception as e:
        log(f"Gmail: send FAILED — {e}")


# --------------------------------------------------------------------------- #
# Calendar
# --------------------------------------------------------------------------- #
def cal_event_body(task, cat, pri, notes, deadline, doc_link):
    desc = []
    if pri:
        desc.append(f"Priority: {pri}")
    if cat:
        desc.append(f"Category: {cat}")
    if notes:
        desc.append(f"Notes: {notes}")
    desc.append(f"\nFrom your Coda to-do: {doc_link}")
    end = (datetime.strptime(deadline, "%Y-%m-%d").date() + timedelta(days=1)).isoformat()
    return {
        "summary": f"[TODO] {task}",
        "description": "\n".join(desc),
        "start": {"date": deadline},
        "end": {"date": end},
        # confirmed so a PATCH revives an event that was manually deleted (cancelled)
        # into a *visible* one, instead of leaving a zombie Coda still references.
        "status": "confirmed",
        "transparency": "transparent",
        "reminders": {"useDefault": False,
                      "overrides": [{"method": "popup", "minutes": 9 * 60}]},
    }


def mirror_calendar(cfg, coda, dry_run):
    m = cfg["mirror"]
    tok_path = m.get("calendar_token")
    if not (tok_path and Path(tok_path).exists()):
        log("Calendar: no consented token — skipped. "
            "Run setup_calendar_oauth.py once to enable.")
        return
    try:
        access = load_generic_token(tok_path)
    except Exception as e:
        log(f"Calendar: token refresh FAILED — {e}")
        return
    cal_id = m.get("calendar_id", "primary")
    base = f"https://www.googleapis.com/calendar/v3/calendars/{urllib.parse.quote(cal_id)}/events"
    doc_link = cfg["browser_link"]
    col = coda.cols

    created = updated = deleted = 0
    for r in coda.rows():
        vals = r["values"]
        task = str(vals.get("Task", "")).strip()
        status = str(vals.get("Status", "") or "")
        deadline = norm_date(vals.get("Deadline"))
        ev_id = str(vals.get("CalEventId", "") or "").strip()
        want_event = bool(deadline) and status != "Done"

        if want_event:
            body = cal_event_body(task, vals.get("Category"), vals.get("Priority"),
                                  vals.get("Notes"), deadline, doc_link)
            if ev_id:
                if dry_run:
                    log(f"Calendar: would UPDATE '{task}' -> {deadline}")
                    continue
                try:
                    http_json(f"{base}/{ev_id}", method="PATCH", token=access, body=body)
                    updated += 1
                except Exception as e:
                    # event may have been deleted in Calendar; recreate
                    log(f"Calendar: patch failed for '{task}' ({e}); recreating.")
                    ev_id = ""
            if not ev_id:
                if dry_run:
                    log(f"Calendar: would CREATE '{task}' -> {deadline}")
                    continue
                res = http_json(base, method="POST", token=access, body=body)
                new_id = res.get("id", "")
                coda.update_row(r["id"], {col["CalEventId"]: new_id})
                created += 1
        else:
            if ev_id:
                if dry_run:
                    log(f"Calendar: would DELETE event for '{task}' (done/undated)")
                    continue
                try:
                    http_json(f"{base}/{ev_id}", method="DELETE", token=access)
                except Exception as e:
                    log(f"Calendar: delete failed for '{task}' ({e})")
                coda.update_row(r["id"], {col["CalEventId"]: ""})
                deleted += 1
    log(f"Calendar: {created} created, {updated} updated, {deleted} removed.")


# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser(description="Mirror Coda tasks to Slack/Gmail/Calendar.")
    ap.add_argument("--digest", action="store_true", help="only Slack + Gmail digest")
    ap.add_argument("--calendar", action="store_true", help="only Calendar sync")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    do_digest = args.digest or not args.calendar
    do_cal = args.calendar or not args.digest

    cfg = load_config()
    coda = Coda(cfg)
    text, _ = build_digest(coda)

    if do_digest:
        mirror_slack(cfg, text, args.dry_run)
        mirror_gmail(cfg, text, args.dry_run)
    if do_cal:
        mirror_calendar(cfg, coda, args.dry_run)


if __name__ == "__main__":
    main()
