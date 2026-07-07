"""Minimal, dependency-free Google OAuth access-token refresh (urllib only).

Used by todo_mirror.py so the daily cron never depends on google client libs.
"""
import json
import urllib.parse
import urllib.request


def refresh_access_token(refresh_token, client_id, client_secret,
                         token_uri="https://oauth2.googleapis.com/token"):
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(token_uri, data=data)
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)["access_token"]


def load_gmail_token(token_path, keys_path):
    """Return access token for the gmail-mcp credential format."""
    cred = json.load(open(token_path))
    keys = json.load(open(keys_path))
    client = keys.get("installed") or keys.get("web")
    return refresh_access_token(
        cred["refresh_token"], client["client_id"], client["client_secret"],
        client.get("token_uri", "https://oauth2.googleapis.com/token"),
    )


def load_generic_token(token_path):
    """Return access token for a token file that already carries client info.

    Expected keys: refresh_token, client_id, client_secret, token_uri (optional).
    Written by setup_calendar_oauth.py.
    """
    t = json.load(open(token_path))
    return refresh_access_token(
        t["refresh_token"], t["client_id"], t["client_secret"],
        t.get("token_uri", "https://oauth2.googleapis.com/token"),
    )
