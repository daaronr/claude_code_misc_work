# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a general-purpose repository for miscellaneous tasks and experiments using Claude Code. It contains various standalone files and projects without a unified build system or architecture.

## Current Contents

- **SF Apartment Search**: Tracker for San Francisco loft-style apartments (`sf_apartment_search.md` and `index.html`) with search criteria, listings, and resources

- **Claude Code Sessions Dashboard**: Auto-generated overview of all Claude Code projects and sessions

## Claude Code Sessions Dashboard

A system for tracking and visualizing all Claude Code sessions across projects.

### Files

| File | Purpose |
|------|---------|
| `update_sessions_outline.py` | Main script - scans sessions, merges with metadata, generates HTML |
| `sessions_metadata.yaml` | Rich project descriptions, GitHub URLs, status, next steps |
| `sessions_dashboard.html` | Published copy (auto-committed to repo, served via GitHub Pages) |
| `~/githubs/CLAUDE_CODE_SESSIONS_OUTLINE.html` | Primary generated HTML dashboard (local) |
| `~/githubs/CLAUDE_CODE_SESSIONS_OUTLINE.md` | Generated markdown version (local) |

### Running

```bash
# Generate only (local):
/opt/homebrew/Caskroom/miniforge/base/bin/python update_sessions_outline.py

# Generate + commit + push to GitHub Pages:
/opt/homebrew/Caskroom/miniforge/base/bin/python update_sessions_outline.py --push
```

### Public URL

Live at: https://daaronr.github.io/claude_code_misc_work/sessions_dashboard.html

GitHub Pages is enabled on the `main` branch root. The `--push` flag commits `sessions_dashboard.html` and pushes automatically.

### Cron Job

Runs every 48 hours (even days of the month at noon), auto-publishes to GitHub Pages:
```
0 12 */2 * * /opt/homebrew/Caskroom/miniforge/base/bin/python /Users/yosemite/githubs/claude_code_misc_work/update_sessions_outline.py --push >> /tmp/sessions_outline.log 2>&1
```

### Data Sources

The script aggregates sessions from BOTH:
- **Claude Code**: `~/.claude/projects/<encoded-path>/*.jsonl`
- **Codex** (OpenAI Codex CLI): `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`

Codex `cwd` paths are normalized to the same repo-name encoding Claude uses, so a project edited with both CLIs is shown as a single merged entry with combined recency and per-CLI message/session counts.

### Sharing

**Public URL (GitHub Pages):** https://daaronr.github.io/claude_code_misc_work/sessions_dashboard.html
Updated automatically by the cron job every 48 hours.

**Dropbox (private fallback):** Auto-copies to `~/Dropbox/unjournal private backups/claude_code_sessions_dashboard.html`.
Right-click in Dropbox → "Copy Dropbox link" to share with collaborators who need access.

### Features

- **Expandable cards** - Click to expand/collapse project details
- **Sorted by recency** - Most recently active projects first within each category
- **GitHub/hosted links** - Direct links to repos and live sites
- **Status badges** - Color-coded (active, development, paused, archived, etc.)
- **Next steps** - Pending tasks for each project
- **Key sessions** - Important session IDs for resuming

### Adding New Projects

Edit `sessions_metadata.yaml` to add rich descriptions:

```yaml
new-project-name:
  display_name: "Human Readable Name"
  category: "Unjournal Core"  # or Research, Personal Projects, Admin & Ops
  github: "https://github.com/org/repo"
  hosted: "https://example.com"  # optional
  description: |
    What this project does...
  goals:
    - Goal 1
    - Goal 2
  status: "active"  # active, development, deployed, maintenance, paused, archived
  status_note: "Brief status update"
  next_steps:
    - Next task 1
    - Next task 2
  key_sessions:
    - id: "session-uuid"
      description: "What this session covers"
```

Projects without metadata entries appear in "Other Projects" with just live stats.

### Categories

1. **Unjournal Core** - Main Unjournal repositories, tools, and workshops
2. **Research** - Academic research projects
3. **Personal Projects** - Side projects
4. **Admin & Ops** - Administrative and operational tools

## Scheduled Jobs

All local jobs use `cron_wrapper.py`. Logs: `~/Library/Logs/cron/<job>.log`. Status: `~/.cron_status/<job>.json`.

| Job name | Schedule | Script | Purpose |
|----------|----------|--------|---------|
| `uj_prioritization` | Mon+Thu 10am | `uj-prioritization/pipeline/run_weekly.py` | Prioritization pipeline |
| `sessions_outline` | Every 48h noon | `update_sessions_outline.py --push` | Sessions dashboard → GitHub Pages |
| `hypothesis_monitor` | Every 48h 14:30 | `impact-directory/scripts/hypothesis_monitor.py` | Hypothes.is monitor |
| `synthesis` | Daily 9:17am | `pba-workshop/scripts/generate_synthesis.py --deploy` | AI safety discussion synthesis |
| `beliefs_dashboard` | Tue+Fri 9:30am | `cm-workshop/scripts/update_beliefs_dashboard.sh` | CM beliefs dashboard |
| `cm_review` | Daily 8am | `audio_visual_processing/scripts/refresh_cm_review.py` | CM video review (temporary) |
| `gdrive_notion_sync` | Daily 7am | `UJ_PQ_data_beliefs_project/scripts/gdrive_notion_sync.py` | Google Drive → Notion sync |
| `swim_audio` | Mon+Thu 6am | `swim_audio_pipeline/swim_audio.py` | Swim audio pipeline |

### Linode jobs (`root@45.79.160.157`) — via `cron_wrapper.py`. Logs: `~/.cron_logs/`. Status: `~/.cron_status/`.

| Job | Schedule | Script | Purpose |
|-----|----------|--------|---------|
| `forum_bot` | Sun 9am UTC | `ops-internal/forum-bot` | EA Forum bot — runs reliably on server, not Mac-sleep-dependent |
| `forum_bot_notify` | Sun 10am UTC | `/root/forum_bot_notify.py` | Slack digest after bot run: posted comments + Type B suggestions |
| `uj_prioritization_pull` | Daily 8:55am UTC | `git -C /opt/uj-prioritization pull origin main` | Pull latest code before Mac pipeline runs |
| `pubpub_feed_proxy` | Daily 7:00am UTC | `/root/pubpub-feed-proxy.py` | PubPub RSS via headless browser → `info.unjournal.org/pubpub-rss.xml` |
| `hypothesis_slack` | Every 2 hours | `/root/hypothesis-slack/hypothesis_to_slack.py` | CM workshop Hypothesis annotations → Slack |

To check/edit Linode crontab: `ssh root@45.79.160.157 "crontab -l"`

CSV for forum_bot: `/root/ops-internal/forum-bot/data/paper_abstracts_and_metadata.csv`
When new evaluations are published: `scp ~/githubs/llm-uj-research-eval/data/paper_abstracts_meta_data/paper_abstracts_and_metadata.csv root@45.79.160.157:/root/ops-internal/forum-bot/data/paper_abstracts_and_metadata.csv`

Notes:
- forum_bot posts to `forum-bots.effectivealtruism.org` (EA Forum's bot subdomain, not main forum) — verify this is the intended destination
- Type B suggestions (related but not auto-posted) appear in the Sunday Slack digest for manual review
