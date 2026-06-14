#!/usr/bin/env python3
"""Build a twice-weekly MP3 pack for swimming headphones.

The job downloads recent podcast episodes, creates MP3 digests from Gmail and
local text context when useful, and writes everything to a dated week folder in
Downloads.
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import email.utils
import fnmatch
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = ROOT / "config.json"
CACHE_PATH = ROOT / "feed_cache.json"
USER_AGENT = "swim-audio-pipeline/1.0"


STOPWORDS = {
    "about",
    "after",
    "again",
    "also",
    "been",
    "being",
    "because",
    "before",
    "between",
    "could",
    "from",
    "have",
    "into",
    "more",
    "other",
    "over",
    "than",
    "that",
    "their",
    "there",
    "these",
    "this",
    "through",
    "with",
    "would",
    "your",
}


@dataclass
class Candidate:
    source: str
    title: str
    url: str
    published: dt.datetime | None
    description: str
    score: int
    kind: str
    payload: dict[str, Any]
    guaranteed: bool = False


def log(message: str) -> None:
    stamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{stamp}] {message}", flush=True)


def expand(path: str) -> Path:
    return Path(os.path.expandvars(os.path.expanduser(path)))


def slugify(value: str, max_len: int = 90) -> str:
    value = html.unescape(value)
    value = re.sub(r"[\s/\\:]+", "_", value.strip())
    value = re.sub(r"[^A-Za-z0-9_.-]+", "", value)
    value = re.sub(r"_+", "_", value).strip("._-")
    return (value or "audio")[:max_len]


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")


def week_folder(config: dict[str, Any]) -> Path:
    today = dt.date.today()
    monday = today - dt.timedelta(days=today.weekday())
    iso_year, iso_week, _ = today.isocalendar()
    name = f"{config['folder_prefix']}_{iso_year}-W{iso_week:02d}_{monday.isoformat()}"
    out = expand(config["output_root"]) / name
    out.mkdir(parents=True, exist_ok=True)
    return out


def request_url(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.read()


def strip_html(text: str) -> str:
    text = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def clean_for_tts(text: str) -> str:
    """Strip markdown and email cruft so the narrator reads prose, not syntax.

    Removes header hashes, emphasis/code markers, tables, list bullets, links,
    URLs, and quoted reply chains that otherwise get read aloud literally
    (e.g. "hash hash hash" for ###).
    """
    # Drop fenced code blocks entirely (unreadable aloud).
    text = re.sub(r"(?s)```.*?```", " ", text)
    text = re.sub(r"(?s)~~~.*?~~~", " ", text)
    # Cut quoted reply chains and forwarded-message headers.
    text = re.split(r"(?im)^\s*On .+ wrote:\s*$", text)[0]
    text = re.split(r"(?im)^\s*-{2,}\s*forwarded message\s*-{2,}", text)[0]

    kept = []
    for line in text.splitlines():
        s = line.strip()
        if s.startswith(">"):  # quoted reply text
            continue
        if re.fullmatch(r"[-=*_|:\s]{3,}", s):  # horizontal rules / table separators
            continue
        if s.startswith("|") and s.endswith("|"):  # table rows
            continue
        if re.match(r"(?i)^(unsubscribe|view (this|in)|manage (your )?(email )?preferences|"
                    r"sent from my |you('| a)re receiving this|update your preferences|"
                    r"copyright|all rights reserved)", s):
            continue
        kept.append(line)
    text = "\n".join(kept)

    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)            # images
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)          # links -> link text
    text = re.sub(r"https?://\S+", " ", text)                     # bare URLs
    text = re.sub(r"\S+@\S+\.\S+", " ", text)                     # email addresses
    text = re.sub(r"(?m)^\s*#{1,6}\s*", "", text)                 # header hashes
    text = re.sub(r"(?m)^\s*[-*+]\s+", "", text)                  # bullet markers
    text = re.sub(r"(?m)^\s*\d+\.\s+", "", text)                  # numbered list markers
    text = re.sub(r"[*_`~]+", "", text)                           # emphasis/code/strikethrough
    text = text.replace("|", " ")                                # leftover table pipes
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_date(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo:
            parsed = parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return parsed
    except (TypeError, ValueError):
        return None


def recent_enough(published: dt.datetime | None, days: int) -> bool:
    if not published:
        return True
    return published >= dt.datetime.now(dt.UTC).replace(tzinfo=None) - dt.timedelta(days=days)


def score_text(text: str, keywords: list[str]) -> int:
    text_l = f" {text.lower()} "
    score = 0
    for keyword in keywords:
        keyword_l = keyword.lower().strip()
        if not keyword_l:
            continue
        if " " in keyword_l:
            score += 3 * text_l.count(keyword_l)
        else:
            score += len(re.findall(rf"\b{re.escape(keyword_l)}\b", text_l))
    return score


def derive_context_keywords(config: dict[str, Any]) -> list[str]:
    keywords = list(config.get("interest_keywords", []))
    local_cfg = config.get("local_text", {})
    if not local_cfg.get("enabled", True):
        return keywords

    counts: dict[str, int] = {}
    cutoff = dt.datetime.now().timestamp() - (config["run_days_recent"] * 86400)
    extensions = set(local_cfg.get("extensions", []))
    excludes = set(local_cfg.get("exclude_dirs", []))
    for raw_path in local_cfg.get("paths", []):
        root = expand(raw_path)
        if not root.exists():
            continue
        files = [root] if root.is_file() else root.rglob("*")
        for path in files:
            if not path.is_file() or path.suffix.lower() not in extensions:
                continue
            if any(part in excludes for part in path.parts):
                continue
            try:
                if path.stat().st_size > 300_000 or path.stat().st_mtime < cutoff:
                    continue
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for token in re.findall(r"[A-Za-z][A-Za-z-]{3,}", text.lower()):
                if token in STOPWORDS or len(token) > 28:
                    continue
                counts[token] = counts.get(token, 0) + 1

    derived = [word for word, _ in sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:30]]
    combined = []
    for item in keywords + derived:
        if item not in combined:
            combined.append(item)
    return combined


def discover_feed_urls(config: dict[str, Any]) -> list[str]:
    cache = load_json(CACHE_PATH, {})
    urls = list(config.get("feed_urls", []))
    for term in config.get("podcast_search_terms", []):
        cached = cache.get(term)
        if cached:
            urls.append(cached)
            continue
        query = urllib.parse.urlencode(
            {"media": "podcast", "entity": "podcast", "limit": "1", "term": term}
        )
        api_url = f"https://itunes.apple.com/search?{query}"
        try:
            data = json.loads(request_url(api_url, timeout=20).decode("utf-8"))
            feed_url = data.get("results", [{}])[0].get("feedUrl")
            if feed_url:
                cache[term] = feed_url
                urls.append(feed_url)
                log(f"Discovered feed for {term}: {feed_url}")
        except (IndexError, KeyError, json.JSONDecodeError, urllib.error.URLError) as exc:
            log(f"Feed discovery failed for {term}: {exc}")
    save_json(CACHE_PATH, cache)
    return sorted(set(urls))


def rss_text(item: ET.Element, tag: str) -> str:
    node = item.find(tag)
    if node is not None and node.text:
        return node.text.strip()
    for child in item:
        if child.tag.endswith(tag) and child.text:
            return child.text.strip()
    return ""


def favorite_feed_urls(config: dict[str, Any]) -> set[str]:
    """Resolve favorite_feeds (search-term names or URLs) to feed URLs via the cache."""
    cache = load_json(CACHE_PATH, {})
    favs: set[str] = set()
    for name in config.get("favorite_feeds", []):
        if name.startswith("http"):
            favs.add(name)
        elif cache.get(name):
            favs.add(cache[name])
    return favs


def podcast_candidates(config: dict[str, Any], keywords: list[str]) -> list[Candidate]:
    candidates: list[Candidate] = []
    fav_urls = favorite_feed_urls(config)
    for feed_url in discover_feed_urls(config):
        try:
            xml = request_url(feed_url, timeout=35)
            root = ET.fromstring(xml)
        except (ET.ParseError, urllib.error.URLError, TimeoutError) as exc:
            log(f"Could not read feed {feed_url}: {exc}")
            continue
        channel = root.find("channel")
        source_title = rss_text(channel, "title") if channel is not None else feed_url
        items = root.findall("./channel/item") or root.findall(".//item")
        is_fav = feed_url in fav_urls
        fav_pick_taken = False
        for item in items[:15]:
            title = rss_text(item, "title")
            desc = strip_html(rss_text(item, "description") or rss_text(item, "summary"))
            published = parse_date(rss_text(item, "pubDate") or rss_text(item, "published"))
            if not recent_enough(published, config["run_days_recent"]):
                continue
            enclosure = item.find("enclosure")
            media_url = enclosure.get("url") if enclosure is not None else ""
            media_type = enclosure.get("type", "") if enclosure is not None else ""
            if not media_url or ("audio" not in media_type and not re.search(r"\.(mp3|m4a|aac)(\?|$)", media_url)):
                continue
            score = score_text(f"{title} {desc}", keywords)
            # Favorite feeds always contribute their newest recent episode, regardless of score.
            guaranteed = is_fav and not fav_pick_taken
            if score < config["min_interest_score"] and not guaranteed:
                continue
            if guaranteed:
                fav_pick_taken = True
            candidates.append(
                Candidate(
                    source=source_title,
                    title=title,
                    url=media_url,
                    published=published,
                    description=desc,
                    score=score,
                    kind="podcast",
                    payload={"feed_url": feed_url},
                    guaranteed=guaranteed,
                )
            )
    return candidates


def gmail_service(credentials_path: str):
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    path = expand(credentials_path)
    if not path.exists():
        raise FileNotFoundError(path)
    data = json.loads(path.read_text(encoding="utf-8"))
    if not data.get("client_id") or not data.get("client_secret"):
        client_path = path.with_name("gcp-oauth.keys.json")
        if client_path.exists():
            client_data = json.loads(client_path.read_text(encoding="utf-8"))
            client_info = client_data.get("installed") or client_data.get("web") or {}
            data["client_id"] = data.get("client_id") or client_info.get("client_id")
            data["client_secret"] = data.get("client_secret") or client_info.get("client_secret")
    scopes = data.get("scope", "").split() or data.get("scopes", [])
    creds = Credentials(
        token=data.get("access_token") or data.get("token"),
        refresh_token=data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        scopes=scopes,
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def gmail_headers(payload: dict[str, Any]) -> dict[str, str]:
    headers = {}
    for item in payload.get("headers", []):
        headers[item.get("name", "").lower()] = item.get("value", "")
    return headers


def gmail_body(part: dict[str, Any]) -> str:
    chunks = []
    mime = part.get("mimeType", "")
    body = part.get("body", {}).get("data")
    if body and mime in {"text/plain", "text/html"}:
        decoded = base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)).decode("utf-8", errors="ignore")
        chunks.append(strip_html(decoded) if mime == "text/html" else decoded)
    for child in part.get("parts", []) or []:
        chunks.append(gmail_body(child))
    return "\n".join(chunk for chunk in chunks if chunk)


def email_candidates(config: dict[str, Any], keywords: list[str]) -> list[Candidate]:
    gmail_cfg = config.get("gmail", {})
    if not gmail_cfg.get("enabled", True):
        return []
    try:
        service = gmail_service(gmail_cfg["credentials_path"])
        response = (
            service.users()
            .messages()
            .list(userId="me", q=gmail_cfg["query"], maxResults=50)
            .execute()
        )
    except Exception as exc:
        log(f"Gmail scan skipped: {exc}")
        return []

    out = []
    for message in response.get("messages", []):
        try:
            full = (
                service.users()
                .messages()
                .get(userId="me", id=message["id"], format="full")
                .execute()
            )
        except Exception as exc:
            log(f"Could not read Gmail message {message.get('id')}: {exc}")
            continue
        payload = full.get("payload", {})
        headers = gmail_headers(payload)
        subject = headers.get("subject", "(no subject)")
        sender = headers.get("from", "")
        date = parse_date(headers.get("date"))
        body = gmail_body(payload) if gmail_cfg.get("include_bodies", True) else full.get("snippet", "")
        body = re.sub(r"\s+", " ", body).strip()
        combined = f"{subject} {sender} {full.get('snippet', '')} {body[:8000]}"
        score = score_text(combined, keywords)
        if score < config["min_interest_score"]:
            continue
        thread_id = full.get("threadId") or message["id"]
        out.append(
            Candidate(
                source=sender,
                title=subject,
                url=f"gmail:{message['id']}",
                published=date,
                description=body[:1000] or full.get("snippet", ""),
                score=score,
                kind="email",
                payload={
                    "body": body[:7000],
                    "sender": sender,
                    "date": headers.get("date", ""),
                    "thread_id": thread_id,
                },
            )
        )
    deduped = []
    seen_threads = set()
    seen_subjects = set()
    for candidate in sorted(out, key=lambda c: (c.score, c.published or dt.datetime.min), reverse=True):
        subject_key = re.sub(r"^(re|fw|fwd):\s*", "", candidate.title.lower()).strip()
        thread_key = candidate.payload.get("thread_id")
        if thread_key in seen_threads or subject_key in seen_subjects:
            continue
        seen_threads.add(thread_key)
        seen_subjects.add(subject_key)
        deduped.append(candidate)
    return deduped


def local_text_candidates(config: dict[str, Any], keywords: list[str]) -> list[Candidate]:
    local_cfg = config.get("local_text", {})
    if not local_cfg.get("enabled", True):
        return []
    cutoff = dt.datetime.now().timestamp() - (config["run_days_recent"] * 86400)
    extensions = set(local_cfg.get("extensions", []))
    excludes = set(local_cfg.get("exclude_dirs", []))
    exclude_files = local_cfg.get("exclude_files", [])
    out = []
    for raw_path in local_cfg.get("paths", []):
        root = expand(raw_path)
        if not root.exists():
            continue
        files = [root] if root.is_file() else root.rglob("*")
        for path in files:
            if not path.is_file() or path.suffix.lower() not in extensions:
                continue
            if any(part in excludes for part in path.parts):
                continue
            # Skip config/instruction files that are keyword-dense but poor listening.
            if any(fnmatch.fnmatch(path.name, pat) for pat in exclude_files):
                continue
            try:
                stat = path.stat()
                if stat.st_mtime < cutoff or stat.st_size > 300_000:
                    continue
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            score = score_text(f"{path.name} {text[:10000]}", keywords)
            if score < config["min_interest_score"]:
                continue
            published = dt.datetime.fromtimestamp(stat.st_mtime)
            out.append(
                Candidate(
                    source=str(path),
                    title=path.name,
                    url=path.as_uri(),
                    published=published,
                    description=text[:1200],
                    score=score,
                    kind="local_text",
                    payload={"text": text[:9000], "path": str(path)},
                )
            )
    return out


def run_ffmpeg(source: Path, dest: Path, bitrate: str) -> None:
    tmp = dest.with_suffix(".tmp.mp3")
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source),
            "-vn",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            bitrate,
            "-ar",
            "44100",
            "-ac",
            "2",
            str(tmp),
        ],
        check=True,
    )
    tmp.replace(dest)


def download_podcast(candidate: Candidate, dest: Path, config: dict[str, Any]) -> Path | None:
    name = slugify(f"{candidate.source}_{candidate.title}")
    output = dest / f"{name}.mp3"
    if output.exists() and output.stat().st_size > 0:
        return output
    with tempfile.TemporaryDirectory(prefix="swim-audio-") as tmp_dir:
        tmp = Path(tmp_dir) / "downloaded_audio"
        try:
            req = urllib.request.Request(candidate.url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=90) as response, tmp.open("wb") as handle:
                shutil.copyfileobj(response, handle, length=1024 * 1024)
            run_ffmpeg(tmp, output, config["audio_bitrate"])
            return output
        except Exception as exc:
            log(f"Download/conversion failed for {candidate.title}: {exc}")
            return None


def tts_text_to_mp3(text: str, output: Path, config: dict[str, Any]) -> Path | None:
    if output.exists() and output.stat().st_size > 0:
        return output
    clean = textwrap.shorten(clean_for_tts(text), width=12000, placeholder="...")
    if len(clean) < 80:
        return None
    with tempfile.TemporaryDirectory(prefix="swim-tts-") as tmp_dir:
        source = Path(tmp_dir) / "input.txt"
        source.write_text(clean, encoding="utf-8")
        tmp_mp3 = output.with_suffix(".tmp.mp3")
        try:
            subprocess.run(
                [
                    "edge-tts",
                    "--voice",
                    config["tts_voice"],
                    f"--rate={config['tts_rate']}",
                    "--file",
                    str(source),
                    "--write-media",
                    str(tmp_mp3),
                ],
                check=True,
            )
            tmp_mp3.replace(output)
            return output
        except Exception as exc:
            log(f"TTS failed for {output.name}: {exc}")
            if tmp_mp3.exists():
                tmp_mp3.unlink()
            return None


def generate_digest(text_candidates: list[Candidate], config: dict[str, Any]) -> str | None:
    """Summarize selected emails/notes into one conversational spoken briefing via Claude.

    Returns plain spoken prose (no markdown) suitable for TTS, or None if disabled,
    empty, or the call fails (in which case the caller can fall back to raw rendering).
    """
    cfg = config.get("digest", {})
    if not cfg.get("enabled", True) or not text_candidates:
        return None
    claude_bin = cfg.get("claude_bin") or shutil.which("claude") or "claude"

    sections = []
    for candidate in text_candidates:
        if candidate.kind == "email":
            body = clean_for_tts(candidate.payload.get("body") or candidate.description)
            sections.append(
                f"EMAIL\nFrom: {candidate.payload.get('sender', candidate.source)}\n"
                f"Subject: {candidate.title}\nDate: {candidate.payload.get('date', '')}\n{body[:3500]}"
            )
        else:
            body = clean_for_tts(candidate.payload.get("text") or candidate.description)
            sections.append(f"NOTE: {candidate.title}\n{body[:3000]}")
    source = "\n\n---\n\n".join(sections)

    max_words = cfg.get("max_words", 1200)
    prompt = (
        "You are producing a short spoken-word audio briefing that David will listen to on "
        "headphones while swimming. Summarize the emails and notes below into a natural, "
        "conversational briefing he can follow by ear.\n\n"
        "Rules:\n"
        "- Plain spoken prose only. No markdown, no headings, no bullet symbols, no URLs, no emoji.\n"
        "- Open with one sentence saying how many items there are.\n"
        "- Group related threads. Lead with anything that needs his attention or a reply.\n"
        "- Skip greetings, signatures, scheduling boilerplate, and legal footers.\n"
        "- Use short sentences and natural transitions (First, Next, Also, Finally).\n"
        "- Name people where it is clear, and be concrete about what each item asks or says.\n"
        f"- Keep it under about {max_words} words.\n"
        "- Output only the briefing text, nothing else.\n\n"
        "Source material:\n\n" + source
    )

    try:
        result = subprocess.run(
            [claude_bin, "-p", prompt],
            capture_output=True,
            text=True,
            timeout=cfg.get("timeout_seconds", 300),
        )
    except Exception as exc:
        log(f"Digest generation failed: {exc}")
        return None
    if result.returncode != 0:
        log(f"Digest claude call returned {result.returncode}: {result.stderr[:300]}")
        return None
    out = clean_for_tts(result.stdout.strip())
    return out or None


def render_text_candidate(candidate: Candidate, dest: Path, config: dict[str, Any], index: int) -> Path | None:
    if candidate.kind == "email":
        text = "\n\n".join(
            [
                f"Email from {candidate.payload.get('sender', candidate.source)}.",
                f"Subject: {candidate.title}.",
                candidate.payload.get("body") or candidate.description,
            ]
        )
        prefix = "email"
    else:
        text = "\n\n".join(
            [
                f"Local context note from {candidate.title}.",
                candidate.payload.get("text") or candidate.description,
            ]
        )
        prefix = "context"
    output = dest / f"{index:02d}_{prefix}_{slugify(candidate.title, 70)}.mp3"
    return tts_text_to_mp3(text, output, config)


def write_manifest(dest: Path, chosen: list[Candidate], files: list[Path]) -> None:
    lines = [
        f"Swim audio pack generated: {dt.datetime.now().isoformat(timespec='seconds')}",
        f"Folder: {dest}",
        "",
        "Tracks:",
    ]
    for idx, (candidate, path) in enumerate(zip(chosen, files), start=1):
        date = candidate.published.date().isoformat() if candidate.published else "unknown date"
        lines.append(
            f"{idx:02d}. {path.name} | {candidate.kind} | score={candidate.score} | {date} | {candidate.title} | {candidate.url}"
        )
    (dest / "00_manifest.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


def select_candidates(config: dict[str, Any], keywords: list[str]) -> list[Candidate]:
    podcasts = podcast_candidates(config, keywords)
    emails = email_candidates(config, keywords)
    local_text = local_text_candidates(config, keywords)

    # Guaranteed favorites: newest episode per favorite feed, immune to scoring.
    guaranteed = [c for c in podcasts if c.guaranteed]
    guaranteed = sorted(guaranteed, key=lambda c: (c.published or dt.datetime.min), reverse=True)[
        : config.get("max_favorite_tracks", 6)
    ]
    guaranteed_urls = {c.url for c in guaranteed}

    # Scored podcasts fill the remaining podcast budget after guaranteed favorites.
    other_pods = [c for c in podcasts if not c.guaranteed and c.url not in guaranteed_urls]
    other_pods = sorted(
        other_pods,
        key=lambda c: (c.score, c.published or dt.datetime.min),
        reverse=True,
    )
    pod_budget = max(0, config["max_total_tracks"] - len(guaranteed))
    other_pods = other_pods[: min(config["max_podcast_tracks"], pod_budget)]
    podcasts_final = guaranteed + other_pods

    # Emails/notes are selected on their own caps; they collapse into a single
    # digest track later, so they do not compete for podcast slots.
    emails = sorted(emails, key=lambda c: (c.score, c.published or dt.datetime.min), reverse=True)[
        : config["max_email_items"]
    ]
    local_text = sorted(
        local_text,
        key=lambda c: (c.score, c.published or dt.datetime.min),
        reverse=True,
    )[: config["max_local_text_items"]]
    texts = sorted(
        emails + local_text,
        key=lambda c: (c.score, c.published or dt.datetime.min),
        reverse=True,
    )

    return podcasts_final + texts


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a dated MP3 pack for swimming headphones.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Path to JSON config.")
    parser.add_argument("--dry-run", action="store_true", help="List selections without downloading or TTS.")
    args = parser.parse_args()

    config = load_json(expand(args.config), {})
    if not config:
        raise SystemExit(f"Config not found or empty: {args.config}")

    keywords = derive_context_keywords(config)
    log(f"Using {len(keywords)} interest keywords/context terms")
    chosen = select_candidates(config, keywords)
    if not chosen:
        log("No candidates matched the current filters.")
        return 0

    if args.dry_run:
        log("Dry run selections:")
        for candidate in chosen:
            date = candidate.published.date().isoformat() if candidate.published else "unknown date"
            log(f"- {candidate.kind} | score={candidate.score} | {date} | {candidate.title}")
        return 0

    dest = week_folder(config)
    log(f"Writing MP3 pack to {dest}")
    files: list[Path] = []
    materialized: list[Candidate] = []

    podcasts = [c for c in chosen if c.kind == "podcast"]
    texts = [c for c in chosen if c.kind != "podcast"]

    # Text content (emails + notes) becomes one conversational digest track.
    if texts and config.get("digest", {}).get("enabled", True):
        titles = ", ".join(c.title for c in texts[:6])
        log(f"Building digest from {len(texts)} text items: {titles}")
        digest_text = generate_digest(texts, config)
        if digest_text:
            today = dt.date.today().isoformat()
            (dest / f"01_digest_{today}.txt").write_text(digest_text + "\n", encoding="utf-8")
            digest_path = tts_text_to_mp3(digest_text, dest / f"01_digest_{today}.mp3", config)
            if digest_path:
                files.append(digest_path)
                materialized.append(
                    Candidate(
                        source="claude digest",
                        title=f"Inbox & notes digest ({len(texts)} items)",
                        url="digest",
                        published=dt.datetime.now(),
                        description=digest_text[:1000],
                        score=sum(c.score for c in texts),
                        kind="digest",
                        payload={},
                    )
                )
        else:
            log("Digest unavailable; falling back to per-item narration.")
            for index, candidate in enumerate(texts, start=1):
                path = render_text_candidate(candidate, dest, config, index)
                if path:
                    files.append(path)
                    materialized.append(candidate)
    elif texts:
        for index, candidate in enumerate(texts, start=1):
            path = render_text_candidate(candidate, dest, config, index)
            if path:
                files.append(path)
                materialized.append(candidate)

    for candidate in podcasts:
        log(f"Selected {candidate.kind}: {candidate.title} (score={candidate.score})")
        path = download_podcast(candidate, dest, config)
        if path:
            files.append(path)
            materialized.append(candidate)

    write_manifest(dest, materialized, files)
    log(f"Finished {len(files)} MP3 files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
