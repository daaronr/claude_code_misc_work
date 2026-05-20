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

| Schedule | Script | Log |
|----------|--------|-----|
| Even days, noon | `update_sessions_outline.py` | `/tmp/sessions_outline.log` |
| Odd days, 2:30 PM | `impact_products_services_directory/impact-directory/scripts/hypothesis_monitor.py` | `/tmp/hypothesis_impact.log` |
