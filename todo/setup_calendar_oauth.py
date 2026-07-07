#!/usr/bin/env python3
"""
setup_calendar_oauth.py — ONE-TIME interactive Google Calendar consent.

Dependency-free: uses only the Python standard library, so it runs under ANY
python3 (no google client libs required). Run it once in a normal terminal —
it opens a browser:

    python3 ~/githubs/claude_code_misc_work/todo/setup_calendar_oauth.py

It requests calendar scope via a localhost loopback flow, then writes a
refresh-token file to ~/.config/google/todo_calendar_token.json which
todo_mirror.py uses headlessly from cron. After this succeeds, the daily mirror
creates/updates Google Calendar events for every task that has a deadline.

Reuses the desktop OAuth client already on this machine (the gmail-mcp client).
If the mirror later logs "Calendar API has not been used in project ...", enable
the Google Calendar API for that GCP project once in the console (the URL is
printed in that error).
"""
import json
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

KEYS = Path.home() / ".gmail-mcp" / "gcp-oauth.keys.json"
OUT = Path.home() / ".config" / "google" / "todo_calendar_token.json"
SCOPE = "https://www.googleapis.com/auth/calendar.events"
AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"

_captured = {}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        _captured["code"] = params.get("code", [None])[0]
        _captured["error"] = params.get("error", [None])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        msg = ("Calendar access granted. You can close this tab and return to the terminal."
               if _captured["code"] else
               f"Authorization failed: {_captured.get('error')}")
        self.wfile.write(f"<html><body><h3>{msg}</h3></body></html>".encode())

    def log_message(self, *a):  # silence request logging
        pass


def main():
    if not KEYS.exists():
        raise SystemExit(f"OAuth client keys not found at {KEYS}")
    client = json.load(open(KEYS))["installed"]
    client_id = client["client_id"]
    client_secret = client["client_secret"]

    server = HTTPServer(("localhost", 0), Handler)
    port = server.server_address[1]
    redirect_uri = f"http://localhost:{port}/"

    auth_url = AUTH_URI + "?" + urllib.parse.urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
    })

    print("Opening browser for Google consent...")
    print(f"If it doesn't open, visit:\n{auth_url}\n")
    webbrowser.open(auth_url)
    server.handle_request()  # blocks until the redirect hits our loopback
    server.server_close()

    if _captured.get("error") or not _captured.get("code"):
        raise SystemExit(f"Authorization failed: {_captured.get('error')}")

    data = urllib.parse.urlencode({
        "code": _captured["code"],
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }).encode()
    with urllib.request.urlopen(urllib.request.Request(TOKEN_URI, data=data)) as resp:
        tok = json.load(resp)

    if not tok.get("refresh_token"):
        raise SystemExit("No refresh token returned — re-run (must grant offline access).")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "refresh_token": tok["refresh_token"],
        "client_id": client_id,
        "client_secret": client_secret,
        "token_uri": TOKEN_URI,
        "scopes": [SCOPE],
    }, indent=2))
    OUT.chmod(0o600)
    print(f"\nSaved calendar token to {OUT}")
    print("Verify with:  python3 ~/githubs/claude_code_misc_work/todo/todo_mirror.py --calendar --dry-run")


if __name__ == "__main__":
    main()
