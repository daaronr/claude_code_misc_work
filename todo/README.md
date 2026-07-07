# Master To-Do List (`todo`)

One cross-agent to-do list for David, usable identically from **Claude Code**, **Codex**, and a plain terminal. Source of truth is a **Coda table**; a daily job mirrors it to **Slack**, **Gmail**, and **Google Calendar**.

## Why
Claude and Codex don't share memory. The only thing both can reach reliably is an external service + a common CLI. So: Coda holds the data, and the `todo` CLI is the single interface both agents call — behaviour is identical no matter who runs it.

## Source of truth
- Coda doc: **David — Master To-Do / Tasks** — https://coda.io/d/_dcCZiJUlIuZ
- Personal workspace (`ws-_Hdrl-aUEn`), owned by David — deliberately **not** in the shared Unjournal workspace, so personal items stay private.
- Table `Tasks` (`grid-L2rZP8RdeC`). Columns: Task, Status (Todo/Doing/Blocked/Done), Priority (High/Medium/Low), Category (Unjournal/Personal/Admin/Research/Comms/Finance/Other), Deadline, Notes, Created, Source, CalEventId.
- All IDs live in `config.json`.

## CLI
`todo` is symlinked into `/opt/homebrew/bin`. Equivalent: `python3 todo.py`.

```
todo add "Draft grant report" --cat Unjournal --pri High --due 2026-07-20 --notes "..." --source cli
todo list                 # open items, sorted by deadline then priority
todo list --overdue
todo list --due-soon 7
todo list --cat Unjournal
todo list --all           # include Done
todo done <n>             # n = number from the last `todo list`
todo start <n> / block <n>
todo update <n> --due 2026-07-25 --pri Medium
todo rm <n>
todo digest               # overdue / due today / due soon
todo config
```
Task references accept: a number from the last `todo list` (cached in `.last_list.json`), a Coda row id (`i-...`), or a unique substring of the task text.
`--due` accepts `YYYY-MM-DD`, `today`, `tomorrow`, `3d`, or `Jul 20`.

Note: Coda writes are asynchronous — a change can take a few seconds to show on the next `list`.

## Natural language
The `todo` usage is documented in `~/.claude/CLAUDE.md` (Claude) and `~/.codex/AGENTS.md` (Codex), so "add to my todos", "what's due", "mark X done" map onto the CLI in either agent.

## Mirrors (`todo_mirror.py`)
Runs daily 8am via **launchd** (`~/Library/LaunchAgents/com.todomirror.daily.plist`; catches up after wake if the Mac was asleep). Still wrapped by `cron_wrapper` so the sessions dashboard tracks it; log `~/Library/Logs/cron/todo_mirror.log`. Manual run: `launchctl kickstart gui/503/com.todomirror.daily`. Each channel is independently guarded and skipped with a log line if not configured.

- **Slack** — DMs the digest to `config.mirror.slack_dm_user_id` via `SLACK_BOT_TOKEN` (in `claude_code_misc_work/scripts/.env`, bot `hypothesis_bot`). Configured (`U03ENAHJ96Z`).
- **Gmail** — emails the digest to `config.mirror.email_to` using the local gmail-mcp OAuth creds (`~/.gmail-mcp/`, `gmail.modify` scope covers send). Dependency-free (urllib token refresh).
- **Calendar** — one all-day event per task-with-deadline; event ids are written back to the `CalEventId` column so re-runs update/delete instead of duplicating. Done/undated tasks have their event removed. Needs a one-time consent (below).

Manual runs:
```
python3 todo_mirror.py --dry-run     # show what each channel would do
python3 todo_mirror.py --digest      # Slack + email only
python3 todo_mirror.py --calendar    # calendar sync only
```

## One-time setup still needed
1. ~~**Slack DM**~~ — done; member ID `U03ENAHJ96Z` is in `config.json`.
2. **Calendar** — run once in a terminal (opens a browser). Now stdlib-only, so any `python3` works:
   ```
   python3 ~/githubs/claude_code_misc_work/todo/setup_calendar_oauth.py
   ```
   Writes `~/.config/google/todo_calendar_token.json`. If the mirror later logs "Calendar API has not been used in project …", enable the Google Calendar API for that GCP project once (the error prints the URL).

## Files
- `todo.py` — CLI + `build_digest()`
- `todo_mirror.py` — daily Slack/Gmail/Calendar push
- `google_oauth.py` — urllib token refresh (no google client libs at runtime)
- `setup_calendar_oauth.py` — one-time calendar consent
- `config.json` — doc/table/column IDs + mirror config
