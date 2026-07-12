#!/usr/bin/env python3
"""
todo.py — a single cross-agent master to-do list backed by a Coda table.

Source of truth: the "Tasks" table in David's personal Coda doc
(https://coda.io/d/_dcCZiJUlIuZ). This CLI is the uniform interface that both
Claude Code and Codex (and a human at a terminal) use, so behaviour is identical
regardless of which agent runs it.

Usage:
  todo add "Draft grant report" --cat Unjournal --pri High --due 2026-07-20 --notes "..."
  todo list                         # open tasks, sorted by deadline then priority
  todo list --all                   # include Done
  todo list --overdue               # past-deadline, not done
  todo list --due-soon 7            # due within 7 days (default 7 if no N)
  todo list --cat Unjournal
  todo done 3                       # complete item #3 from the last `list`
  todo start 3                      # mark Doing
  todo update 3 --due 2026-07-25 --pri Medium
  todo rm 3
  todo config                       # show doc link + column map

Task references (`done`/`start`/`update`/`rm`) accept:
  - a number from the most recent `list` output (cached in .last_list.json), or
  - a Coda row id (i-...), or
  - a unique substring of the task text.

CODA_API_KEY is read from the environment, then from these .env files in order:
  ~/githubs/claude_code_misc_work/todo/.env
  ~/githubs/coda_org_unjournal/.env
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, date, timedelta
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
CONFIG_PATH = HERE / "config.json"
LAST_LIST_PATH = HERE / ".last_list.json"
API = "https://coda.io/apis/v1"

PRIORITY_ORDER = {"High": 0, "Medium": 1, "Low": 2, "": 3, None: 3}


# --------------------------------------------------------------------------- #
# setup
# --------------------------------------------------------------------------- #
def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def load_api_key():
    key = os.environ.get("CODA_API_KEY")
    if key:
        return key.strip()
    candidates = [
        HERE / ".env",
        Path.home() / "githubs" / "coda_org_unjournal" / ".env",
    ]
    for env_path in candidates:
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line.startswith("CODA_API_KEY"):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    sys.exit("ERROR: CODA_API_KEY not found in env or known .env files.")


class Coda:
    def __init__(self, cfg):
        self.cfg = cfg
        self.doc = cfg["doc_id"]
        self.table = cfg["table_id"]
        self.cols = cfg["columns"]
        self.s = requests.Session()
        self.s.headers.update({
            "Authorization": f"Bearer {load_api_key()}",
            "Content-Type": "application/json",
        })

    def col(self, name):
        return self.cols[name]

    def _mutate(self, method, url, **kwargs):
        """Coda mutation (POST/PUT/DELETE) with retry+backoff on 429 rate-limits.

        Coda throttles writes aggressively; a burst of per-row updates (e.g. the
        calendar mirror writing back event ids) otherwise 429s and crashes mid-run,
        leaving orphaned state. Retries honor Retry-After, then exponential backoff.
        """
        delay = 2.0
        for attempt in range(5):
            r = getattr(self.s, method)(url, **kwargs)
            if r.status_code == 429 and attempt < 4:
                wait = float(r.headers.get("Retry-After") or delay)
                time.sleep(wait)
                delay = min(delay * 2, 30)
                continue
            r.raise_for_status()
            return r.json()

    def rows(self):
        """Return all rows as list of dicts: {id, index, values{colName:val}}."""
        out = []
        token = None
        while True:
            params = {"useColumnNames": "true", "limit": 200}
            if token:
                params["pageToken"] = token
            r = self.s.get(f"{API}/docs/{self.doc}/tables/{self.table}/rows", params=params)
            r.raise_for_status()
            data = r.json()
            for it in data.get("items", []):
                out.append({
                    "id": it["id"],
                    "index": it.get("index", 0),
                    "values": it.get("values", {}),
                })
            token = data.get("nextPageToken")
            if not token:
                break
        return out

    def add_row(self, cells: dict):
        payload = {"rows": [{"cells": [{"column": c, "value": v} for c, v in cells.items()]}]}
        return self._mutate("post", f"{API}/docs/{self.doc}/tables/{self.table}/rows", json=payload)

    def update_row(self, row_id: str, cells: dict):
        payload = {"row": {"cells": [{"column": c, "value": v} for c, v in cells.items()]}}
        return self._mutate("put", f"{API}/docs/{self.doc}/tables/{self.table}/rows/{row_id}", json=payload)

    def delete_row(self, row_id: str):
        return self._mutate("delete", f"{API}/docs/{self.doc}/tables/{self.table}/rows/{row_id}")


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def parse_date(s):
    """Return ISO YYYY-MM-DD from a variety of inputs, or None."""
    if not s:
        return None
    s = s.strip()
    low = s.lower()
    today = date.today()
    if low in ("today", "tod"):
        return today.isoformat()
    if low in ("tomorrow", "tmr", "tom"):
        return (today + timedelta(days=1)).isoformat()
    if low.endswith("d") and low[:-1].isdigit():  # "3d" => in 3 days
        return (today + timedelta(days=int(low[:-1]))).isoformat()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y", "%m/%d", "%b %d %Y", "%b %d", "%d %b %Y", "%d %b"):
        try:
            d = datetime.strptime(s, fmt).date()
            if "%Y" not in fmt:
                d = d.replace(year=today.year)
                if d < today:
                    d = d.replace(year=today.year + 1)
            return d.isoformat()
        except ValueError:
            continue
    return s  # let Coda try to interpret it


def norm_date(val):
    """Coda date cells come back as ISO strings (or empty)."""
    if not val:
        return ""
    s = str(val)
    return s[:10] if len(s) >= 10 else s


def match_choice(value, choices, label):
    if not value:
        return None
    for c in choices:
        if c.lower() == value.lower():
            return c
    # prefix match
    hits = [c for c in choices if c.lower().startswith(value.lower())]
    if len(hits) == 1:
        return hits[0]
    sys.exit(f"ERROR: '{value}' is not a valid {label}. Choose from: {', '.join(choices)}")


def resolve_ref(ref, coda):
    """Resolve a task reference to a row id."""
    ref = str(ref).strip()
    # 1) number from last list
    if ref.isdigit() and LAST_LIST_PATH.exists():
        mapping = json.loads(LAST_LIST_PATH.read_text())
        rid = mapping.get(ref)
        if rid:
            return rid
    # 2) explicit coda row id
    if ref.startswith("i-"):
        return ref
    # 3) substring of task text
    rows = coda.rows()
    task_col = "Task"
    hits = [r for r in rows if ref.lower() in str(r["values"].get(task_col, "")).lower()]
    if len(hits) == 1:
        return hits[0]["id"]
    if len(hits) > 1:
        sys.exit(f"ERROR: '{ref}' matches {len(hits)} tasks; be more specific or run `todo list` and use its number.")
    sys.exit(f"ERROR: could not resolve task '{ref}'. Run `todo list` first, then use its number.")


# --------------------------------------------------------------------------- #
# commands
# --------------------------------------------------------------------------- #
def cmd_add(args, coda):
    cfg = coda.cfg
    cells = {coda.col("Task"): args.task}
    cells[coda.col("Status")] = "Todo"
    cells[coda.col("Created")] = date.today().isoformat()
    cells[coda.col("Source")] = args.source or "cli"
    cat = match_choice(args.cat, cfg["categories"], "category")
    if cat:
        cells[coda.col("Category")] = cat
    pri = match_choice(args.pri, cfg["priorities"], "priority")
    if pri:
        cells[coda.col("Priority")] = pri
    if args.due:
        cells[coda.col("Deadline")] = parse_date(args.due)
    if args.notes:
        cells[coda.col("Notes")] = args.notes
    coda.add_row(cells)
    due = f" (due {parse_date(args.due)})" if args.due else ""
    print(f"Added: {args.task}{due}")


def _sort_key(r):
    vals = r["values"]
    dl = norm_date(vals.get("Deadline"))
    has_dl = 0 if dl else 1
    return (has_dl, dl or "9999-12-31", PRIORITY_ORDER.get(vals.get("Priority"), 3))


def cmd_list(args, coda):
    rows = coda.rows()
    today = date.today()

    def keep(r):
        vals = r["values"]
        status = vals.get("Status", "")
        if not args.all and status == "Done":
            return False
        if args.status and str(status).lower() != args.status.lower():
            return False
        if args.cat and str(vals.get("Category", "")).lower() != args.cat.lower():
            return False
        dl = norm_date(vals.get("Deadline"))
        if args.overdue:
            if not dl or dl >= today.isoformat() or status == "Done":
                return False
        if args.due_soon is not None:
            horizon = (today + timedelta(days=args.due_soon)).isoformat()
            if not dl or dl > horizon:
                return False
        return True

    rows = [r for r in rows if keep(r)]
    rows.sort(key=_sort_key)

    if args.json:
        print(json.dumps([{"id": r["id"], **r["values"]} for r in rows], indent=2, default=str))
        return

    if not rows:
        print("No matching tasks.")
        LAST_LIST_PATH.write_text("{}")
        return

    mapping = {}
    print()
    for i, r in enumerate(rows, 1):
        vals = r["values"]
        mapping[str(i)] = r["id"]
        task = str(vals.get("Task", "")).strip()
        status = str(vals.get("Status", "") or "")
        pri = str(vals.get("Priority", "") or "")
        cat = str(vals.get("Category", "") or "")
        dl = norm_date(vals.get("Deadline"))
        # deadline flag
        flag = ""
        if dl:
            if dl < today.isoformat() and status != "Done":
                flag = "OVERDUE"
            elif dl <= (today + timedelta(days=2)).isoformat():
                flag = "soon"
        badges = " ".join(x for x in [
            f"[{status}]" if status else "",
            f"({pri})" if pri else "",
            cat,
        ] if x)
        due_str = f"  due {dl}" + (f" {flag}" if flag else "") if dl else ""
        print(f"{i:>3}. {task}")
        meta = "     " + "  ".join(x for x in [badges, due_str.strip()] if x)
        if meta.strip():
            print(meta)
        notes = str(vals.get("Notes", "") or "").strip()
        if notes and args.verbose:
            print(f"       note: {notes}")
    print()
    LAST_LIST_PATH.write_text(json.dumps(mapping))


def cmd_status_change(args, coda, new_status, verb):
    rid = resolve_ref(args.ref, coda)
    coda.update_row(rid, {coda.col("Status"): new_status})
    print(f"{verb}: {rid}")


def cmd_update(args, coda):
    cfg = coda.cfg
    rid = resolve_ref(args.ref, coda)
    cells = {}
    if args.cat:
        cells[coda.col("Category")] = match_choice(args.cat, cfg["categories"], "category")
    if args.pri:
        cells[coda.col("Priority")] = match_choice(args.pri, cfg["priorities"], "priority")
    if args.status:
        cells[coda.col("Status")] = match_choice(args.status, cfg["statuses"], "status")
    if args.due:
        cells[coda.col("Deadline")] = parse_date(args.due)
    if args.notes is not None:
        cells[coda.col("Notes")] = args.notes
    if args.task:
        cells[coda.col("Task")] = args.task
    if not cells:
        sys.exit("Nothing to update. Pass --due/--pri/--cat/--status/--notes/--task.")
    coda.update_row(rid, cells)
    print(f"Updated: {rid}")


def cmd_rm(args, coda):
    rid = resolve_ref(args.ref, coda)
    coda.delete_row(rid)
    print(f"Deleted: {rid}")


def build_digest(coda):
    """Return (plain_text, groups_dict) summarising open tasks for a daily digest."""
    rows = [r for r in coda.rows() if str(r["values"].get("Status", "")) != "Done"]
    today = date.today()
    soon_h = (today + timedelta(days=3)).isoformat()

    overdue, due_today, due_soon, no_date = [], [], [], []
    for r in rows:
        vals = r["values"]
        dl = norm_date(vals.get("Deadline"))
        entry = {
            "task": str(vals.get("Task", "")).strip(),
            "pri": str(vals.get("Priority", "") or ""),
            "cat": str(vals.get("Category", "") or ""),
            "deadline": dl,
            "status": str(vals.get("Status", "") or ""),
        }
        if not dl:
            no_date.append(entry)
        elif dl < today.isoformat():
            overdue.append(entry)
        elif dl == today.isoformat():
            due_today.append(entry)
        elif dl <= soon_h:
            due_soon.append(entry)

    for g in (overdue, due_today, due_soon, no_date):
        g.sort(key=lambda e: (PRIORITY_ORDER.get(e["pri"], 3), e["deadline"] or ""))

    groups = {"overdue": overdue, "due_today": due_today, "due_soon": due_soon}

    lines = [f"Tasks digest — {today.strftime('%a %b %d, %Y')}"]

    def section(title, items, show_date=True):
        if not items:
            return
        lines.append("")
        lines.append(f"{title} ({len(items)}):")
        for e in items:
            bits = [f"• {e['task']}"]
            tags = " ".join(x for x in [f"[{e['pri']}]" if e["pri"] else "", e["cat"]] if x)
            if tags:
                bits.append(tags)
            if show_date and e["deadline"]:
                bits.append(f"— {e['deadline']}")
            lines.append("  " + "  ".join(bits))

    section("OVERDUE", overdue)
    section("Due today", due_today)
    section("Due within 3 days", due_soon)

    if not (overdue or due_today or due_soon):
        lines.append("")
        lines.append("Nothing overdue or due in the next 3 days.")
    lines.append("")
    lines.append(f"Full list: {coda.cfg['browser_link']}")
    return "\n".join(lines), groups


def cmd_digest(args, coda):
    text, _ = build_digest(coda)
    print(text)


def cmd_config(args, coda):
    cfg = coda.cfg
    print(f"Doc:   {cfg['browser_link']}")
    print(f"Table: {cfg['table_id']}")
    print(f"Categories: {', '.join(cfg['categories'])}")
    print(f"Priorities: {', '.join(cfg['priorities'])}")
    print(f"Statuses:   {', '.join(cfg['statuses'])}")


# --------------------------------------------------------------------------- #
# argparse
# --------------------------------------------------------------------------- #
def build_parser():
    p = argparse.ArgumentParser(prog="todo", description="Cross-agent master to-do list (Coda-backed).")
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("add", help="add a task")
    a.add_argument("task")
    a.add_argument("--cat", "--category", dest="cat")
    a.add_argument("--pri", "--priority", dest="pri")
    a.add_argument("--due", "--deadline", dest="due")
    a.add_argument("--notes", dest="notes")
    a.add_argument("--source", dest="source", help="who added it (claude/codex/cli)")

    l = sub.add_parser("list", help="list tasks")
    l.add_argument("--all", action="store_true", help="include Done")
    l.add_argument("--status")
    l.add_argument("--cat", "--category", dest="cat")
    l.add_argument("--overdue", action="store_true")
    l.add_argument("--due-soon", dest="due_soon", nargs="?", type=int, const=7, default=None,
                   help="due within N days (default 7)")
    l.add_argument("--json", action="store_true")
    l.add_argument("-v", "--verbose", action="store_true", help="show notes")

    d = sub.add_parser("done", help="mark a task Done")
    d.add_argument("ref")

    st = sub.add_parser("start", help="mark a task Doing")
    st.add_argument("ref")

    bl = sub.add_parser("block", help="mark a task Blocked")
    bl.add_argument("ref")

    u = sub.add_parser("update", help="update a task")
    u.add_argument("ref")
    u.add_argument("--task", help="rename the task text")
    u.add_argument("--cat", "--category", dest="cat")
    u.add_argument("--pri", "--priority", dest="pri")
    u.add_argument("--status")
    u.add_argument("--due", "--deadline", dest="due")
    u.add_argument("--notes")

    r = sub.add_parser("rm", help="delete a task")
    r.add_argument("ref")

    sub.add_parser("digest", help="print a daily digest (overdue / due today / due soon)")
    sub.add_parser("config", help="show doc link + config")
    return p


def main():
    args = build_parser().parse_args()
    coda = Coda(load_config())
    if args.cmd == "add":
        cmd_add(args, coda)
    elif args.cmd == "list":
        cmd_list(args, coda)
    elif args.cmd == "done":
        cmd_status_change(args, coda, "Done", "Completed")
    elif args.cmd == "start":
        cmd_status_change(args, coda, "Doing", "Started")
    elif args.cmd == "block":
        cmd_status_change(args, coda, "Blocked", "Blocked")
    elif args.cmd == "update":
        cmd_update(args, coda)
    elif args.cmd == "rm":
        cmd_rm(args, coda)
    elif args.cmd == "digest":
        cmd_digest(args, coda)
    elif args.cmd == "config":
        cmd_config(args, coda)


if __name__ == "__main__":
    main()
