#!/usr/bin/env python3
"""
Universal cron job wrapper.

Usage:
    cron_wrapper.py <job_name> <schedule> [--cwd /path] -- <cmd> [args...]

Runs <cmd> and:
  - Adds the latest NVM node/bin to PATH (fixes cron PATH stripping for netlify etc.)
  - Logs full output to ~/Library/Logs/cron/<job_name>.log (stable across reboots)
  - Writes a status JSON to ~/.cron_status/<job_name>.json (read by sessions dashboard)
  - Exits with the same exit code as the wrapped command

Crontab example:
  0 8 * * * /opt/homebrew/Caskroom/miniforge/base/bin/python3 \\
      /Users/yosemite/githubs/claude_code_misc_work/cron_wrapper.py \\
      cm_review "daily 8am" -- \\
      /opt/homebrew/Caskroom/miniforge/base/bin/python3 \\
      /Users/yosemite/githubs/audio_visual_processing/scripts/refresh_cm_review.py
"""
import argparse
import glob
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

STATUS_DIR = Path.home() / ".cron_status"
LOG_DIR = Path.home() / "Library" / "Logs" / "cron"
TAIL_LINES = 40


def inject_nvm_path():
    # Always prepend standard macOS tool paths that cron strips
    extra = ["/opt/homebrew/bin", "/usr/local/bin"]
    nvm_candidates = sorted(
        glob.glob(str(Path.home() / ".nvm/versions/node/*/bin")), reverse=True
    )
    if nvm_candidates:
        extra.append(nvm_candidates[0])
    current = os.environ.get("PATH", "")
    new_paths = [p for p in extra if p not in current.split(":")]
    if new_paths:
        os.environ["PATH"] = ":".join(new_paths) + ":" + current


def parse_args():
    # Split on '--' manually before argparse to allow arbitrary cmd after it
    argv = sys.argv[1:]
    if "--" not in argv:
        print("Usage: cron_wrapper.py <job> <schedule> [--cwd PATH] -- <cmd> [args...]")
        sys.exit(1)
    sep = argv.index("--")
    meta_argv = argv[:sep]
    cmd = argv[sep + 1:]

    p = argparse.ArgumentParser(add_help=False)
    p.add_argument("job_name")
    p.add_argument("schedule")
    p.add_argument("--cwd", default=None)
    meta = p.parse_args(meta_argv)
    return meta.job_name, meta.schedule, meta.cwd, cmd


def main():
    job_name, schedule, cwd, cmd = parse_args()

    STATUS_DIR.mkdir(exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    log_path = LOG_DIR / f"{job_name}.log"
    status_path = STATUS_DIR / f"{job_name}.json"

    inject_nvm_path()

    start = datetime.now(timezone.utc)
    start_str = start.isoformat()

    # Run the wrapped command, capturing all output
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=cwd,
        )
        exit_code = result.returncode
        combined = result.stdout + (("\n--- stderr ---\n" + result.stderr) if result.stderr.strip() else "")
    except Exception as e:
        exit_code = 127
        combined = f"cron_wrapper: failed to launch command: {e}\ncmd: {cmd}"

    end = datetime.now(timezone.utc)
    duration_s = round((end - start).total_seconds(), 1)
    status_str = "ok" if exit_code == 0 else "error"

    # Append to rolling log file
    with open(log_path, "a") as f:
        f.write(f"\n=== {start_str} ({schedule}) ===\n")
        f.write(combined)
        f.write(f"\n--- exit {exit_code} in {duration_s}s ---\n")

    # Trim log to last 2000 lines to prevent unbounded growth
    try:
        lines = log_path.read_text().splitlines()
        if len(lines) > 2000:
            log_path.write_text("\n".join(lines[-2000:]) + "\n")
    except Exception:
        pass

    # Capture tail for status JSON (most recent output, most useful)
    tail = combined.strip().splitlines()[-TAIL_LINES:]

    status = {
        "job": job_name,
        "schedule": schedule,
        "last_run": start_str,
        "last_run_end": end.isoformat(),
        "exit_code": exit_code,
        "status": status_str,
        "duration_s": duration_s,
        "output_tail": tail,
        "cmd": cmd,
        "log": str(log_path),
    }
    with open(status_path, "w") as f:
        json.dump(status, f, indent=2)

    # Also echo to stdout (captured by any remaining cron >> redirect)
    print(combined, end="")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
