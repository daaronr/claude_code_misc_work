#!/usr/bin/env python3
"""
Update Claude Code Sessions Outline
Merges rich project metadata with live session statistics.
Generates both markdown and styled HTML outputs with expandable cards.
"""

import argparse
import os
import json
import re
import subprocess
import yaml
import shutil
from datetime import datetime
from pathlib import Path
from collections import defaultdict
from typing import Optional, Dict, List, Any

SCRIPT_DIR = Path(__file__).parent
CLAUDE_PROJECTS_DIR = Path.home() / ".claude" / "projects"
CODEX_SESSIONS_DIR = Path.home() / ".codex" / "sessions"
METADATA_FILE = SCRIPT_DIR / "sessions_metadata.yaml"
OUTPUT_MD = Path.home() / "githubs" / "CLAUDE_CODE_SESSIONS_OUTLINE.md"
OUTPUT_HTML = Path.home() / "githubs" / "CLAUDE_CODE_SESSIONS_OUTLINE.html"
DROPBOX_COPY = Path.home() / "Dropbox" / "unjournal private backups" / "claude_code_sessions_dashboard.html"
REPO_HTML = SCRIPT_DIR / "sessions_dashboard.html"

LINODE_JOBS = [
    {
        "job": "forum_bot",
        "schedule": "Sun 9am UTC",
        "description": "EA Forum bot — find posts about Unjournal papers, post comments",
        "log": "/root/.cron_logs/forum_bot.log",
    },
    {
        "job": "forum_bot_notify",
        "schedule": "Sun 10am UTC",
        "description": "Slack digest after bot run: posted comments + Type B suggestions",
        "log": "/root/.cron_logs/forum_bot_notify.log",
    },
    {
        "job": "uj_prioritization_pull",
        "schedule": "daily 8:55am UTC",
        "description": "git pull origin main → /opt/uj-prioritization",
        "log": "/root/.cron_logs/uj_prioritization_pull.log",
    },
    {
        "job": "pubpub_feed_proxy",
        "schedule": "daily 7:00am UTC",
        "description": "Fetch PubPub RSS via headless browser → info.unjournal.org/pubpub-rss.xml",
        "log": "/root/.cron_logs/pubpub_feed_proxy.log",
    },
    {
        "job": "hypothesis_slack",
        "schedule": "every 2 hours",
        "description": "Push new CM workshop Hypothesis annotations to Slack",
        "log": "/root/.cron_logs/hypothesis_slack.log",
    },
]

STATUS_COLORS = {
    "active": "#10b981",      # green
    "development": "#6366f1", # indigo
    "deployed": "#06b6d4",    # cyan
    "maintenance": "#8b5cf6", # purple
    "paused": "#f59e0b",      # amber
    "transition": "#f97316",  # orange
    "archived": "#6b7280",    # gray
    "completed": "#14b8a6",   # teal
    "hobby": "#ec4899",       # pink
}


def normalize_key(name: str) -> str:
    """Normalize project name for matching."""
    return re.sub(r'[-_/]', '', name.lower())


def decode_project_path(encoded_path: str) -> str:
    """Convert encoded project path to readable format."""
    path = encoded_path.replace("-", "/")
    path = re.sub(r"^/Users/yosemite", "~", path)
    return path


def get_repo_name(encoded_path: str) -> str:
    """Extract repo/folder name from encoded path."""
    parts = encoded_path.split("-")
    skip = {"Users", "yosemite", "githubs", "Dropbox"}
    relevant = [p for p in parts if p and p not in skip]
    return "/".join(relevant[-2:]) if len(relevant) > 1 else (relevant[-1] if relevant else encoded_path)


def parse_session_file(filepath: Path) -> dict:
    """Extract metadata from a session jsonl file."""
    messages = 0
    first_timestamp = None
    last_timestamp = None

    try:
        with open(filepath, 'r', errors='ignore') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if data.get("type") == "user" or (data.get("message", {}).get("role") == "user"):
                        messages += 1
                    ts = data.get("timestamp")
                    if ts:
                        if first_timestamp is None or ts < first_timestamp:
                            first_timestamp = ts
                        if last_timestamp is None or ts > last_timestamp:
                            last_timestamp = ts
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass

    return {
        "messages": messages,
        "first_date": first_timestamp[:10] if first_timestamp else None,
        "last_date": last_timestamp[:10] if last_timestamp else None,
    }


def cwd_to_repo_name(cwd: str) -> str:
    """Convert an absolute filesystem cwd into a repo_name matching Claude's encoding.

    Claude Code's project directories encode `/` and `_` as `-`. We mimic that
    so a Codex session in the same directory matches the same repo bucket.
    """
    if not cwd:
        return ""
    encoded = cwd.replace("_", "-").replace("/", "-")
    if not encoded.startswith("-"):
        encoded = "-" + encoded
    return get_repo_name(encoded)


def cwd_to_decoded_path(cwd: str) -> str:
    """Pretty-print a cwd as ~/... for display."""
    return re.sub(r"^/Users/yosemite", "~", cwd or "")


def parse_codex_session_file(filepath: Path) -> dict:
    """Extract metadata from a Codex rollout jsonl file.

    Codex stores its session files at ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl.
    The first line is a `session_meta` event whose payload includes `cwd`.
    User turns appear as response items with role=="user".
    """
    cwd = None
    session_id = None
    messages = 0
    first_timestamp = None
    last_timestamp = None
    is_subagent = False

    try:
        with open(filepath, 'r', errors='ignore') as f:
            for line in f:
                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue

                ts = data.get("timestamp")
                if ts:
                    if first_timestamp is None or ts < first_timestamp:
                        first_timestamp = ts
                    if last_timestamp is None or ts > last_timestamp:
                        last_timestamp = ts

                if data.get("type") == "session_meta":
                    payload = data.get("payload") or {}
                    cwd = payload.get("cwd") or cwd
                    session_id = payload.get("id") or session_id
                    src = payload.get("source") or {}
                    if isinstance(src, dict) and "subagent" in src:
                        is_subagent = True
                    continue

                payload = data.get("payload") or {}
                # Codex response items: payload.role == "user"
                if isinstance(payload, dict) and payload.get("role") == "user":
                    # Skip synthetic environment_context user messages
                    content = payload.get("content")
                    text_blob = ""
                    if isinstance(content, list):
                        for c in content:
                            if isinstance(c, dict):
                                text_blob += str(c.get("text", ""))
                    elif isinstance(content, str):
                        text_blob = content
                    if "<environment_context>" in text_blob or "<user_instructions>" in text_blob:
                        continue
                    messages += 1
    except Exception:
        pass

    return {
        "cwd": cwd,
        "session_id": session_id,
        "messages": messages,
        "first_date": first_timestamp[:10] if first_timestamp else None,
        "last_date": last_timestamp[:10] if last_timestamp else None,
        "is_subagent": is_subagent,
    }


def scan_codex_projects() -> dict:
    """Scan Codex sessions and aggregate stats keyed by repo_name."""
    projects = defaultdict(lambda: {
        "codex_messages": 0,
        "codex_first_date": None,
        "codex_last_date": None,
        "codex_sessions": [],
        "codex_path": None,
    })

    if not CODEX_SESSIONS_DIR.exists():
        return projects

    for session_file in CODEX_SESSIONS_DIR.rglob("rollout-*.jsonl"):
        stats = parse_codex_session_file(session_file)
        if stats["is_subagent"]:
            continue
        if stats["messages"] <= 0 or not stats["cwd"]:
            continue

        repo_name = cwd_to_repo_name(stats["cwd"])
        if not repo_name:
            continue

        bucket = projects[repo_name]
        bucket["codex_messages"] += stats["messages"]
        bucket["codex_path"] = cwd_to_decoded_path(stats["cwd"])
        if stats["session_id"]:
            bucket["codex_sessions"].append(stats["session_id"])

        if stats["first_date"]:
            if bucket["codex_first_date"] is None or stats["first_date"] < bucket["codex_first_date"]:
                bucket["codex_first_date"] = stats["first_date"]
        if stats["last_date"]:
            if bucket["codex_last_date"] is None or stats["last_date"] > bucket["codex_last_date"]:
                bucket["codex_last_date"] = stats["last_date"]

    return projects


def scan_projects() -> dict:
    """Scan Claude Code projects and aggregate stats."""
    projects = defaultdict(lambda: {
        "messages": 0, "first_date": None, "last_date": None,
        "sessions": [], "path": None,
        "codex_messages": 0, "codex_first_date": None, "codex_last_date": None,
        "codex_sessions": [], "codex_path": None,
    })

    if not CLAUDE_PROJECTS_DIR.exists():
        return projects

    for project_dir in CLAUDE_PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue

        project_name = project_dir.name
        repo_name = get_repo_name(project_name)
        decoded_path = decode_project_path(project_name)

        for session_file in project_dir.glob("*.jsonl"):
            if "subagent" in str(session_file) or session_file.name.startswith("agent-"):
                continue

            stats = parse_session_file(session_file)
            if stats["messages"] > 0:
                projects[repo_name]["messages"] += stats["messages"]
                projects[repo_name]["path"] = decoded_path
                projects[repo_name]["sessions"].append(session_file.stem)

                if stats["first_date"]:
                    if projects[repo_name]["first_date"] is None or stats["first_date"] < projects[repo_name]["first_date"]:
                        projects[repo_name]["first_date"] = stats["first_date"]
                if stats["last_date"]:
                    if projects[repo_name]["last_date"] is None or stats["last_date"] > projects[repo_name]["last_date"]:
                        projects[repo_name]["last_date"] = stats["last_date"]

    return projects


def load_metadata() -> dict:
    """Load project metadata from YAML file."""
    if not METADATA_FILE.exists():
        return {"projects": {}, "categories": []}

    with open(METADATA_FILE, 'r') as f:
        return yaml.safe_load(f) or {"projects": {}, "categories": []}


def match_metadata(repo_name: str, metadata: dict) -> Optional[dict]:
    """Find matching metadata for a repo name."""
    normalized = normalize_key(repo_name)

    for key, data in metadata.get("projects", {}).items():
        if normalize_key(key) == normalized:
            return data
        if data.get("display_name") and normalize_key(data["display_name"]) == normalized:
            return data

    for key, data in metadata.get("projects", {}).items():
        if normalized in normalize_key(key) or normalize_key(key) in normalized:
            return data

    return None


def _max_date(*dates):
    vals = [d for d in dates if d]
    return max(vals) if vals else None


def merge_data(live_stats: dict, metadata: dict) -> list:
    """Merge live stats with metadata, organized by category."""
    merged = []

    for repo_name, stats in live_stats.items():
        meta = match_metadata(repo_name, metadata) or {}

        combined_last = _max_date(stats.get("last_date"), stats.get("codex_last_date"))
        combined_first_candidates = [stats.get("first_date"), stats.get("codex_first_date")]
        combined_first = min([d for d in combined_first_candidates if d], default=None)
        total_messages = (stats.get("messages") or 0) + (stats.get("codex_messages") or 0)

        merged.append({
            "repo_name": repo_name,
            "display_name": meta.get("display_name", repo_name),
            "category": meta.get("category", "Other"),
            "description": meta.get("description", "").strip(),
            "goals": meta.get("goals", []),
            "key_sessions": meta.get("key_sessions", []),
            "subprojects": meta.get("subprojects", []),
            "github": meta.get("github"),
            "hosted": meta.get("hosted"),
            "status": meta.get("status", "unknown"),
            "status_note": meta.get("status_note", ""),
            "next_steps": meta.get("next_steps", []),
            "combined_last_date": combined_last,
            "combined_first_date": combined_first,
            "total_messages": total_messages,
            **stats
        })

    # Sort by category priority then by recency (most recent first)
    category_priority = {c["name"]: c["priority"] for c in metadata.get("categories", [])}
    merged.sort(key=lambda x: (
        category_priority.get(x["category"], 99),
        x["combined_last_date"] or "0000-00-00"  # Sort by combined last_date descending
    ), reverse=False)

    # Re-sort within each category by recency (descending)
    by_category = defaultdict(list)
    for p in merged:
        by_category[p["category"]].append(p)

    for cat in by_category:
        by_category[cat].sort(key=lambda x: x["combined_last_date"] or "0000-00-00", reverse=True)

    # Rebuild merged list with correct ordering
    result = []
    for cat in sorted(metadata.get("categories", []), key=lambda x: x.get("priority", 99)):
        result.extend(by_category.get(cat["name"], []))
    result.extend(by_category.get("Other", []))

    return result


def generate_cron_status_section() -> str:
    """Read ~/.cron_status/*.json and return an HTML <details> block for the dashboard."""
    import glob as _glob
    from pathlib import Path as _Path
    from datetime import datetime as _dt, timezone as _tz

    status_dir = _Path.home() / ".cron_status"
    jobs = []
    for path in sorted(status_dir.glob("*.json")):
        try:
            with open(path) as f:
                jobs.append(json.load(f))
        except Exception:
            pass

    if not jobs:
        return ""

    now = _dt.now(_tz.utc)

    def rel_time(iso):
        if not iso:
            return "never"
        try:
            t = _dt.fromisoformat(iso)
            if t.tzinfo is None:
                t = t.replace(tzinfo=_tz.utc)
            delta = int((now - t).total_seconds())
            if delta < 3600:
                return f"{delta // 60}m ago"
            if delta < 86400:
                return f"{delta // 3600}h ago"
            return f"{delta // 86400}d ago"
        except Exception:
            return iso[:16]

    rows = []
    for j in sorted(jobs, key=lambda x: x.get("last_run", ""), reverse=True):
        status = j.get("status", "?")
        color = "#10b981" if status == "ok" else "#ef4444"
        badge = f'<span style="color:{color};font-weight:700">{status.upper()}</span>'
        dur = j.get("duration_s")
        dur_str = f"{dur}s" if dur is not None else ""
        tail = j.get("output_tail", [])
        tail_text = "\n".join(tail[-5:]) if tail else ""
        rows.append(f"""<tr>
          <td style="padding:4px 10px 4px 0;white-space:nowrap;font-weight:600">{j.get("job","?")}</td>
          <td style="padding:4px 8px;color:#555">{j.get("schedule","")}</td>
          <td style="padding:4px 8px">{badge}</td>
          <td style="padding:4px 8px;color:#555;white-space:nowrap">{rel_time(j.get("last_run"))}</td>
          <td style="padding:4px 8px;color:#888">{dur_str}</td>
          <td style="padding:4px 8px;font-family:monospace;font-size:0.78rem;color:#555;max-width:340px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis" title="{tail_text}">{tail_text.splitlines()[-1] if tail_text else ""}</td>
        </tr>""")

    rows_html = "\n".join(rows)

    linode_rows = []
    for lj in LINODE_JOBS:
        linode_rows.append(f"""<tr>
          <td style="padding:4px 10px 4px 0;white-space:nowrap;font-weight:600">{lj['job']}</td>
          <td style="padding:4px 8px;color:#555">{lj['schedule']}</td>
          <td style="padding:4px 8px;color:#888;font-style:italic">no live status</td>
          <td style="padding:4px 8px;font-family:monospace;font-size:0.78rem;color:#666">{lj['description']}</td>
        </tr>""")
    linode_rows_html = "\n".join(linode_rows)

    return f"""
        <details style="background:#f0fff4;border:1.5px solid #10b981;border-radius:8px;padding:8px 14px;margin:10px 0 18px 0;font-size:0.85rem;">
            <summary style="cursor:pointer;font-weight:600;color:#065f46;list-style:none;display:flex;align-items:center;gap:8px;">
                &#9656; Cron Job Status &mdash; {len(jobs)} local + {len(LINODE_JOBS)} Linode
            </summary>
            <div style="margin-top:10px;overflow-x:auto;">
                <p style="font-weight:600;color:#065f46;margin-bottom:4px">Local (Mac) &mdash; {len(jobs)} tracked</p>
                <table style="border-collapse:collapse;width:100%;font-size:0.83rem;">
                  <thead><tr style="border-bottom:1px solid #ccc;color:#555">
                    <th style="text-align:left;padding:3px 10px 3px 0">Job</th>
                    <th style="text-align:left;padding:3px 8px">Schedule</th>
                    <th style="text-align:left;padding:3px 8px">Status</th>
                    <th style="text-align:left;padding:3px 8px">Last Run</th>
                    <th style="text-align:left;padding:3px 8px">Duration</th>
                    <th style="text-align:left;padding:3px 8px">Last output</th>
                  </tr></thead>
                  <tbody>{rows_html}</tbody>
                </table>
                <p style="margin-top:8px;color:#666">Status files: <code>~/.cron_status/*.json</code> &bull; Logs: <code>~/Library/Logs/cron/</code></p>

                <p style="font-weight:600;color:#065f46;margin:14px 0 4px">Linode (45.79.160.157) &mdash; {len(LINODE_JOBS)} jobs, no live status</p>
                <table style="border-collapse:collapse;width:100%;font-size:0.83rem;">
                  <thead><tr style="border-bottom:1px solid #ccc;color:#555">
                    <th style="text-align:left;padding:3px 10px 3px 0">Job</th>
                    <th style="text-align:left;padding:3px 8px">Schedule</th>
                    <th style="text-align:left;padding:3px 8px">Status</th>
                    <th style="text-align:left;padding:3px 8px">Description</th>
                  </tr></thead>
                  <tbody>{linode_rows_html}</tbody>
                </table>
                <p style="margin-top:8px;color:#666">Logs: <code>root@45.79.160.157:/var/log/</code></p>
            </div>
        </details>
"""


def generate_html(merged_data: list, metadata: dict) -> str:
    """Generate rich HTML output with expandable cards."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    total_claude_messages = sum(p.get("messages", 0) for p in merged_data)
    total_codex_messages = sum(p.get("codex_messages", 0) for p in merged_data)
    total_messages = total_claude_messages + total_codex_messages
    total_projects = len(merged_data)
    codex_projects = sum(1 for p in merged_data if p.get("codex_messages", 0) > 0)

    # Group by category (already sorted by recency within)
    by_category = defaultdict(list)
    for p in merged_data:
        by_category[p["category"]].append(p)

    # Count active this month (based on combined last_date)
    current_month = datetime.now().strftime('%Y-%m')
    active_this_month = len([
        p for p in merged_data
        if p.get('combined_last_date') and p['combined_last_date'][:7] >= current_month
    ])

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Sessions Dashboard</title>
    <style>
        :root {{
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --success: #10b981;
        }}

        * {{ box-sizing: border-box; margin: 0; padding: 0; }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 20px;
        }}

        .container {{ max-width: 1200px; margin: 0 auto; }}

        header {{
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 40px;
            border-radius: 16px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }}

        header h1 {{ font-size: 2rem; margin-bottom: 10px; }}
        header .subtitle {{ opacity: 0.9; font-size: 0.95rem; }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}

        .stat-card {{
            background: var(--card-bg);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }}

        .stat-card .number {{
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary);
        }}

        .stat-card .label {{
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 5px;
        }}

        .category-section {{ margin-bottom: 40px; }}

        .category-header {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--primary);
        }}

        .category-header h2 {{ font-size: 1.5rem; color: var(--text); }}

        .category-header .count {{
            background: var(--primary);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
        }}

        .project-list {{ display: flex; flex-direction: column; gap: 12px; }}

        /* Expandable card using details/summary */
        .project-card {{
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid var(--primary);
            overflow: hidden;
        }}

        .project-card summary {{
            padding: 16px 20px;
            cursor: pointer;
            list-style: none;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }}

        .project-card summary::-webkit-details-marker {{ display: none; }}

        .project-card summary::before {{
            content: "▶";
            font-size: 0.7rem;
            color: var(--text-muted);
            transition: transform 0.2s;
        }}

        .project-card[open] summary::before {{ transform: rotate(90deg); }}

        .project-card summary:hover {{ background: #f8fafc; }}

        .project-card .title {{
            font-weight: 600;
            font-size: 1rem;
            color: var(--text);
            flex: 1;
            min-width: 200px;
        }}

        .project-card .summary-meta {{
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            font-size: 0.8rem;
            color: var(--text-muted);
        }}

        .project-card .status-badge {{
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            color: white;
        }}

        .project-card .last-active {{
            font-weight: 500;
        }}

        .project-card .content {{
            padding: 0 20px 20px 20px;
            border-top: 1px solid var(--border);
            margin-top: 0;
        }}

        .project-card .description {{
            color: var(--text-muted);
            font-size: 0.9rem;
            margin: 16px 0;
        }}

        .project-card .links {{
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }}

        .project-card .links a {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--bg);
            color: var(--primary);
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.85rem;
            transition: background 0.2s;
        }}

        .project-card .links a:hover {{
            background: var(--primary);
            color: white;
        }}

        .project-card .section-title {{
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 16px 0 8px 0;
            font-weight: 600;
        }}

        .project-card .goals ul,
        .project-card .next-steps ul {{
            list-style: none;
            padding-left: 0;
        }}

        .project-card .goals li,
        .project-card .next-steps li {{
            font-size: 0.85rem;
            padding: 4px 0;
            padding-left: 20px;
            position: relative;
        }}

        .project-card .goals li::before {{
            content: "•";
            position: absolute;
            left: 6px;
            color: var(--primary);
        }}

        .project-card .next-steps li::before {{
            content: "→";
            position: absolute;
            left: 0;
            color: var(--success);
        }}

        .project-card .meta-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
        }}

        .project-card .meta-item {{
            font-size: 0.8rem;
        }}

        .project-card .meta-item .label {{
            color: var(--text-muted);
        }}

        .project-card .meta-item .value {{
            font-weight: 500;
            color: var(--text);
        }}

        .project-card .sessions-list {{
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.75rem;
            color: var(--text-muted);
            background: var(--bg);
            padding: 12px;
            border-radius: 6px;
            margin-top: 12px;
            max-height: 100px;
            overflow-y: auto;
        }}

        .project-card .sessions-list .session {{
            margin: 4px 0;
        }}

        .project-card .sessions-list .session-desc {{
            color: var(--text);
            font-family: inherit;
            margin-left: 8px;
        }}

        .quick-nav {{
            background: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}

        .quick-nav h3 {{ font-size: 1rem; margin-bottom: 12px; color: var(--text-muted); }}

        .quick-nav .links {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }}

        .quick-nav a {{
            padding: 8px 16px;
            background: var(--bg);
            color: var(--primary);
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: background 0.2s;
        }}

        .quick-nav a:hover {{ background: var(--primary); color: white; }}

        .controls {{
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }}

        .controls button {{
            padding: 8px 16px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--text);
            transition: all 0.2s;
        }}

        .controls button:hover {{
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }}

        footer {{
            text-align: center;
            padding: 30px;
            color: var(--text-muted);
            font-size: 0.85rem;
        }}

        footer code {{
            background: var(--bg);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
        }}

        @media (max-width: 768px) {{
            header {{ padding: 24px; }}
            header h1 {{ font-size: 1.5rem; }}
            .project-card summary {{ flex-direction: column; align-items: flex-start; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Claude Code &amp; Codex Sessions Dashboard</h1>
            <div class="subtitle">Auto-generated: {now} • Combines Claude Code (~/.claude) and Codex (~/.codex) sessions, sorted by recency within each category</div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="number">{total_projects}</div>
                <div class="label">Total Projects</div>
            </div>
            <div class="stat-card">
                <div class="number">{total_messages:,}</div>
                <div class="label">Total Messages</div>
                <div class="label" style="font-size:0.75rem;margin-top:4px;">Claude {total_claude_messages:,} · Codex {total_codex_messages:,}</div>
            </div>
            <div class="stat-card">
                <div class="number">{codex_projects}</div>
                <div class="label">Projects w/ Codex Activity</div>
            </div>
            <div class="stat-card">
                <div class="number">{active_this_month}</div>
                <div class="label">Active This Month</div>
            </div>
        </div>

        <div class="quick-nav">
            <h3>Quick Navigation</h3>
            <div class="links">
"""

    for cat in metadata.get("categories", []):
        cat_name = cat["name"]
        if cat_name in by_category:
            html += f'                <a href="#{cat_name.lower().replace(" ", "-")}">{cat_name}</a>\n'
    if "Other" in by_category:
        html += '                <a href="#other">Other</a>\n'

    html += """            </div>
        </div>

        <div class="controls">
            <button onclick="document.querySelectorAll('.project-card').forEach(d => d.open = true)">Expand All</button>
            <button onclick="document.querySelectorAll('.project-card').forEach(d => d.open = false)">Collapse All</button>
        </div>

        <details style="background:#f0f4ff;border:1.5px solid #4a6cf7;border-radius:8px;padding:8px 14px;margin:10px 0 18px 0;font-size:0.85rem;">
            <summary style="cursor:pointer;font-weight:600;color:#1a237e;list-style:none;display:flex;align-items:center;gap:8px;">
                &#9656; Unjournal AI Conversation Archive &mdash; 488 conversations, ask Claude Code to query
            </summary>
            <div style="margin-top:10px;color:#333;line-height:1.7;">
                <b>Location:</b> <code>~/Dropbox/obsidian_in_dropbox/chatgpt_team_organized/</code><br>
                <b>Query:</b> Ask Claude Code in any terminal session — reads files directly, no upload needed.<br>
                <b>Topics:</b> evaluations (847KB) &bull; data_work (1MB) &bull; web_tech (611KB) &bull; unjournal_ops (256KB) &bull; research_papers (363KB) &bull; funding_grants (284KB) &bull; writing_editing (184KB) &bull; meetings_comms (178KB) &bull; ea_related (259KB) &bull; social_media (100KB)<br>
                <b>Grep:</b> <code>grep -r "term" ~/Dropbox/obsidian_in_dropbox/chatgpt_scraped_conversations/</code><br>
                <b>Obsidian:</b> <code>obsidian://open?path=/Users/yosemite/Dropbox/obsidian_in_dropbox/chatgpt_team_organized</code>
            </div>
        </details>
"""

    html += generate_cron_status_section()

    # Generate category sections
    for cat in sorted(metadata.get("categories", []), key=lambda x: x.get("priority", 99)):
        cat_name = cat["name"]
        if cat_name not in by_category:
            continue

        projects = by_category[cat_name]
        cat_id = cat_name.lower().replace(" ", "-")

        html += f"""
        <section class="category-section" id="{cat_id}">
            <div class="category-header">
                <h2>{cat_name}</h2>
                <span class="count">{len(projects)} projects</span>
            </div>
            <div class="project-list">
"""

        for p in projects:
            status_color = STATUS_COLORS.get(p["status"], "#6b7280")
            last_date_display = p["combined_last_date"] or "Unknown"
            codex_msgs = p.get("codex_messages", 0)
            claude_msgs = p.get("messages", 0)
            codex_badge = ""
            if codex_msgs > 0 and claude_msgs > 0:
                codex_badge = '<span class="status-badge" style="background:#000000">Claude+Codex</span>'
            elif codex_msgs > 0:
                codex_badge = '<span class="status-badge" style="background:#000000">Codex</span>'

            # Links section
            links_html = ""
            if p["github"] or p["hosted"]:
                links_html = '<div class="links">'
                if p["github"]:
                    links_html += f'<a href="{p["github"]}" target="_blank">📁 GitHub</a>'
                if p["hosted"]:
                    links_html += f'<a href="{p["hosted"]}" target="_blank">🌐 Live Site</a>'
                links_html += '</div>'

            # Goals section
            goals_html = ""
            if p["goals"]:
                goals_html = '<div class="goals"><div class="section-title">Goals & Topics</div><ul>'
                for goal in p["goals"][:5]:
                    goals_html += f'<li>{goal}</li>'
                goals_html += '</ul></div>'

            # Next steps section
            next_steps_html = ""
            if p["next_steps"]:
                next_steps_html = '<div class="next-steps"><div class="section-title">Next Steps</div><ul>'
                for step in p["next_steps"]:
                    next_steps_html += f'<li>{step}</li>'
                next_steps_html += '</ul></div>'

            # Key sessions section
            sessions_html = ""
            if p["key_sessions"]:
                sessions_html = '<div class="sessions-list"><div class="section-title" style="margin-top:0">Key Sessions</div>'
                for sess in p["key_sessions"][:3]:
                    sessions_html += f'<div class="session"><code>{sess["id"]}</code><span class="session-desc">— {sess.get("description", "")}</span></div>'
                sessions_html += '</div>'

            codex_meta_html = ""
            if codex_msgs > 0:
                codex_meta_html = f"""
                            <div class="meta-item">
                                <span class="label">Codex msgs:</span>
                                <span class="value">{codex_msgs}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Codex sessions:</span>
                                <span class="value">{len(p.get("codex_sessions", []))}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Codex period:</span>
                                <span class="value">{p.get("codex_first_date") or "?"} → {p.get("codex_last_date") or "?"}</span>
                            </div>"""

            html += f"""
                <details class="project-card">
                    <summary>
                        <span class="title">{p["display_name"]}</span>
                        <div class="summary-meta">
                            <span class="status-badge" style="background: {status_color}">{p["status"]}</span>
                            {codex_badge}
                            <span class="last-active">📅 {last_date_display}</span>
                            <span>💬 {p["total_messages"]} msgs</span>
                        </div>
                    </summary>
                    <div class="content">
                        {links_html}
                        <div class="description">{p["description"]}</div>
                        {goals_html}
                        {next_steps_html}
                        <div class="meta-grid">
                            <div class="meta-item">
                                <span class="label">Status:</span>
                                <span class="value">{p["status_note"] or p["status"]}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Period (combined):</span>
                                <span class="value">{p["combined_first_date"] or "?"} → {p["combined_last_date"] or "?"}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Claude msgs:</span>
                                <span class="value">{claude_msgs}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Claude sessions:</span>
                                <span class="value">{len(p["sessions"])}</span>
                            </div>{codex_meta_html}
                            <div class="meta-item">
                                <span class="label">Repo:</span>
                                <span class="value"><code>{p["repo_name"]}</code></span>
                            </div>
                        </div>
                        {sessions_html}
                    </div>
                </details>
"""

        html += """            </div>
        </section>
"""

    # Other category
    other_projects = by_category.get("Other", [])
    if other_projects:
        html += """
        <section class="category-section" id="other">
            <div class="category-header">
                <h2>Other Projects</h2>
                <span class="count">""" + str(len(other_projects)) + """ projects</span>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">Projects not yet categorized in metadata</p>
            <div class="project-list">
"""
        for p in sorted(other_projects, key=lambda x: x["combined_last_date"] or "0000-00-00", reverse=True):
            codex_msgs = p.get("codex_messages", 0)
            claude_msgs = p.get("messages", 0)
            other_codex_badge = ""
            if codex_msgs > 0 and claude_msgs > 0:
                other_codex_badge = '<span class="status-badge" style="background:#000000">Claude+Codex</span>'
            elif codex_msgs > 0:
                other_codex_badge = '<span class="status-badge" style="background:#000000">Codex</span>'
            html += f"""
                <details class="project-card">
                    <summary>
                        <span class="title">{p["repo_name"]}</span>
                        <div class="summary-meta">
                            {other_codex_badge}
                            <span class="last-active">📅 {p["combined_last_date"] or "Unknown"}</span>
                            <span>💬 {p["total_messages"]} msgs</span>
                        </div>
                    </summary>
                    <div class="content">
                        <div class="meta-grid">
                            <div class="meta-item">
                                <span class="label">Period (combined):</span>
                                <span class="value">{p["combined_first_date"] or "?"} → {p["combined_last_date"] or "?"}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Claude msgs / sessions:</span>
                                <span class="value">{claude_msgs} / {len(p["sessions"])}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Codex msgs / sessions:</span>
                                <span class="value">{codex_msgs} / {len(p.get("codex_sessions", []))}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Path:</span>
                                <span class="value"><code>{p.get("path") or p.get("codex_path") or "?"}</code></span>
                            </div>
                        </div>
                        <p style="margin-top: 12px; font-size: 0.85rem; color: var(--text-muted);">
                            Add this project to <code>sessions_metadata.yaml</code> to include description, goals, and links.
                        </p>
                    </div>
                </details>
"""
        html += """            </div>
        </section>
"""

    html += f"""
        <footer>
            <p>Auto-updated every 48 hours via cron • Sorted by most recent activity • Includes Claude Code (~/.claude) and Codex (~/.codex) sessions</p>
            <p>Source: <code>~/githubs/claude_code_misc_work/update_sessions_outline.py</code></p>
            <p>Metadata: <code>~/githubs/claude_code_misc_work/sessions_metadata.yaml</code></p>
        </footer>
    </div>
</body>
</html>
"""

    return html


def generate_markdown(merged_data: list, metadata: dict) -> str:
    """Generate markdown output."""
    now = datetime.now().strftime("%Y-%m-%d")

    total_claude = sum(p.get("messages", 0) for p in merged_data)
    total_codex = sum(p.get("codex_messages", 0) for p in merged_data)
    total_messages = total_claude + total_codex
    total_projects = len(merged_data)
    codex_projects = sum(1 for p in merged_data if p.get("codex_messages", 0) > 0)

    by_category = defaultdict(list)
    for p in merged_data:
        by_category[p["category"]].append(p)

    md = f"""# Claude Code & Codex Sessions Outline

*Auto-generated: {now}*

## Summary Statistics
- **Total projects:** {total_projects}
- **Total messages:** ~{total_messages:,}+ (Claude {total_claude:,} · Codex {total_codex:,})
- **Projects with Codex activity:** {codex_projects}

---

"""

    for cat in sorted(metadata.get("categories", []), key=lambda x: x.get("priority", 99)):
        cat_name = cat["name"]
        if cat_name not in by_category:
            continue

        md += f"## {cat_name}\n\n"

        for p in by_category[cat_name]:
            md += f"### {p['display_name']}\n"
            md += f"**Repo:** `{p['repo_name']}`\n"

            links = []
            if p.get("github"):
                links.append(f"[GitHub]({p['github']})")
            if p.get("hosted"):
                links.append(f"[Live]({p['hosted']})")
            if links:
                md += f"**Links:** {' | '.join(links)}\n"

            cx = p.get("codex_messages", 0)
            cx_frag = f" | **Codex msgs:** {cx}" if cx else ""
            md += f"**Messages:** {p.get('total_messages', p['messages'])} (Claude {p['messages']}{cx_frag}) | **Last Active:** {p.get('combined_last_date') or p['last_date']} | **Status:** {p['status']}\n\n"

            if p["description"]:
                md += f"{p['description']}\n\n"

            if p["next_steps"]:
                md += "**Next Steps:**\n"
                for step in p["next_steps"]:
                    md += f"- {step}\n"
                md += "\n"

            md += "---\n\n"

    return md


def main(args=None):
    if args is None:
        args = argparse.Namespace(push=False)
    print(f"Loading metadata from {METADATA_FILE}...")
    metadata = load_metadata()

    print(f"Scanning Claude Code projects in {CLAUDE_PROJECTS_DIR}...")
    live_stats = scan_projects()
    print(f"  Found {len(live_stats)} Claude Code projects with sessions")

    print(f"Scanning Codex sessions in {CODEX_SESSIONS_DIR}...")
    codex_stats = scan_codex_projects()
    print(f"  Found {len(codex_stats)} Codex projects with sessions")

    # Merge Codex data into the same repo buckets. Projects only seen by Codex
    # get a new entry with zeroed Claude fields.
    for repo_name, cstats in codex_stats.items():
        bucket = live_stats[repo_name]
        bucket["codex_messages"] = cstats["codex_messages"]
        bucket["codex_first_date"] = cstats["codex_first_date"]
        bucket["codex_last_date"] = cstats["codex_last_date"]
        bucket["codex_sessions"] = cstats["codex_sessions"]
        bucket["codex_path"] = cstats["codex_path"]
        if not bucket.get("path"):
            bucket["path"] = cstats["codex_path"]

    print(f"Total unique projects (Claude ∪ Codex): {len(live_stats)}")

    print("Merging metadata with live stats (sorted by recency)...")
    merged = merge_data(live_stats, metadata)

    md_content = generate_markdown(merged, metadata)
    OUTPUT_MD.write_text(md_content)
    print(f"Wrote markdown to {OUTPUT_MD}")

    html_content = generate_html(merged, metadata)
    OUTPUT_HTML.write_text(html_content)
    print(f"Wrote HTML to {OUTPUT_HTML}")

    # Copy to Dropbox for sharing
    if DROPBOX_COPY.parent.exists():
        shutil.copy(OUTPUT_HTML, DROPBOX_COPY)
        print(f"Copied to Dropbox: {DROPBOX_COPY}")

    # Copy into the git repo so it can be published via GitHub Pages
    shutil.copy(OUTPUT_HTML, REPO_HTML)
    print(f"Copied to repo: {REPO_HTML}")

    if args.push:
        _git_push(SCRIPT_DIR)

    print(f"\nDone! Open in browser:")
    print(f"   file://{OUTPUT_HTML}")
    if args.push:
        print(f"\nPublished to GitHub Pages:")
        print(f"   https://daaronr.github.io/claude_code_misc_work/sessions_dashboard.html")
    print(f"\nShare with collaborators via Dropbox link to:")
    print(f"   {DROPBOX_COPY}")


def _git_push(repo_dir: Path) -> None:
    """Commit sessions_dashboard.html and push to origin."""
    try:
        subprocess.run(
            ["git", "-C", str(repo_dir), "add", "sessions_dashboard.html"],
            check=True,
        )
        result = subprocess.run(
            ["git", "-C", str(repo_dir), "diff", "--cached", "--quiet"],
        )
        if result.returncode == 0:
            print("No changes to sessions_dashboard.html, skipping commit.")
            return
        subprocess.run(
            ["git", "-C", str(repo_dir), "commit", "-m", "Update sessions dashboard (automated)"],
            check=True,
        )
        subprocess.run(
            ["git", "-C", str(repo_dir), "push"],
            check=True,
        )
        print("Pushed sessions_dashboard.html to GitHub.")
    except subprocess.CalledProcessError as e:
        print(f"Git push failed: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update Claude Code Sessions Dashboard")
    parser.add_argument(
        "--push",
        action="store_true",
        help="Commit and push sessions_dashboard.html to GitHub after generating",
    )
    args = parser.parse_args()
    main(args)
