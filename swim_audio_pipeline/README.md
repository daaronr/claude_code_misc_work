# Swim Audio Pipeline README

This automation builds a twice-weekly MP3 pack for swimming headphones.

Creates a dated weekly MP3 folder under `~/Downloads` for transfer to swimming headphones.

## What It Does

On each run, the script:

- Searches recent podcast feeds that match your interests.
- Uses your local project/context files to derive extra interest terms.
- Searches Gmail using the existing `~/.gmail-mcp/credentials.json` OAuth setup.
- Converts useful text-only items, such as selected emails and local notes, into MP3s with `edge-tts`.
- Downloads matching podcast episodes and converts/normalizes them to MP3 with `ffmpeg`.
- Writes everything into a dated weekly folder in `~/Downloads`.
- Creates `00_manifest.txt` so you can see exactly where each track came from.

The output folder format is:

```text
~/Downloads/swim_audio_YYYY-Www_YYYY-MM-DD/
```

The current generated folder is:

```text
~/Downloads/swim_audio_2026-W22_2026-05-25/
```

## Installed Cron Job

This is already installed as a cron job and will run twice per week:

```cron
0 6 * * 1,4 ... swim_audio ...  # Monday and Thursday at 06:00
```

In the current crontab it is routed through the shared cron wrapper:

```cron
0 6 * * 1,4 $PYMIN $WRAP swim_audio "Mon+Thu 6am" --cwd /Users/yosemite/githubs/claude_code_misc_work -- /usr/local/bin/python3 /Users/yosemite/githubs/claude_code_misc_work/swim_audio_pipeline/swim_audio.py >> /dev/null 2>&1
```

That means it should keep producing fresh weekly folders without manual action, assuming the Mac is awake and has network access.

## Manual Run

```bash
/usr/local/bin/python3 /Users/yosemite/githubs/claude_code_misc_work/swim_audio_pipeline/swim_audio.py
```

Preview selections without downloads or TTS:

```bash
/usr/local/bin/python3 /Users/yosemite/githubs/claude_code_misc_work/swim_audio_pipeline/swim_audio.py --dry-run
```

## Schedule

The installer adds a cron entry for 06:00 every Monday and Thursday:

```bash
bash /Users/yosemite/githubs/claude_code_misc_work/scripts/install_swim_audio_cron.sh
```

Logs are written to:

```text
~/Library/Logs/swim_audio_pipeline.log
```

If the cron wrapper is active, status/logging may also be handled by:

```text
/Users/yosemite/githubs/claude_code_misc_work/cron_wrapper.py
```

## Tuning

Edit `config.json` to change:

- `interest_keywords`
- `podcast_search_terms`
- `gmail.query`
- `max_total_tracks`
- `output_root`
- `tts_voice` and `tts_rate`

## Next Steps

1. Listen to a few generated tracks and delete or keep based on what is useful for swimming.
2. Tighten `interest_keywords` in `config.json` if the selection is too broad.
3. Add/remove podcast names in `podcast_search_terms`.
4. Adjust `gmail.query` to exclude noisy senders or subjects.
5. Lower `max_total_tracks` if the pack is too large for the headphones.
6. Check the manifest after the next cron run to confirm the automated selection is still sensible.

Useful commands:

```bash
# Preview what would be selected
/usr/local/bin/python3 /Users/yosemite/githubs/claude_code_misc_work/swim_audio_pipeline/swim_audio.py --dry-run

# Run immediately
/usr/local/bin/python3 /Users/yosemite/githubs/claude_code_misc_work/swim_audio_pipeline/swim_audio.py

# Verify cron entry
crontab -l | grep swim_audio
```
