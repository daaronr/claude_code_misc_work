# Text-to-Voice Generation Guide

Neural text-to-speech using Microsoft Edge TTS for high-quality audio generation.

## Quick Start

```bash
# Install
pip install edge-tts

# Generate audio
edge-tts --voice en-GB-RyanNeural --rate=-15% --file input.txt --write-media output.mp3
```

## Voice Presets by Content Type

### Academic & Intellectual Content

**Oxford Seminar** — Measured, deliberate, intellectually serious
```bash
edge-tts --voice en-GB-RyanNeural --rate=-15% --pitch=-2Hz --file lecture.txt --write-media lecture.mp3
```
Best for: Philosophy, theory, research presentations, intellectual discourse

**Oxford Soft** — Same gravitas, softer delivery
```bash
edge-tts --voice en-GB-SoniaNeural --rate=-15% --pitch=-2Hz --file lecture.txt --write-media lecture.mp3
```
Best for: Humanities, literary analysis, reflective content

### Professional & Business

**Newscaster** — Authoritative, clear, broadcast-ready
```bash
edge-tts --voice en-US-GuyNeural --file news.txt --write-media news.mp3
```

**Presentation** — Professional, polished
```bash
edge-tts --voice en-US-AriaNeural --file slides.txt --write-media presentation.mp3
```

### Conversational & Creative

**Friendly Tutorial** — Warm, approachable
```bash
edge-tts --voice en-US-JennyNeural --rate=+5% --file tutorial.txt --write-media tutorial.mp3
```

**Storyteller** — Expressive, engaging
```bash
edge-tts --voice en-GB-LibbyNeural --rate=-10% --file story.txt --write-media story.mp3
```

**Podcast** — Natural, conversational
```bash
edge-tts --voice en-US-ChristopherNeural --file episode.txt --write-media podcast.mp3
```

### Technical Content

**Technical Explainer** — Clear, measured, precise
```bash
edge-tts --voice en-US-DavisNeural --rate=-5% --file docs.txt --write-media docs.mp3
```

## All Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `--voice` | Voice ID | TTS voice (see list below) |
| `--rate` | -50% to +100% | Speech speed |
| `--pitch` | -50Hz to +50Hz | Voice pitch |
| `--volume` | -50% to +100% | Audio volume |
| `--file` | path | Input text file |
| `--write-media` | path | Output audio file |
| `--write-subtitles` | path | Output SRT subtitles |

## Recommended Voices

### British English
| Voice ID | Gender | Character |
|----------|--------|-----------|
| en-GB-RyanNeural | Male | Authoritative, warm |
| en-GB-SoniaNeural | Female | Professional, clear |
| en-GB-LibbyNeural | Female | Expressive, youthful |
| en-GB-ThomasNeural | Male | Mature, measured |

### American English
| Voice ID | Gender | Character |
|----------|--------|-----------|
| en-US-GuyNeural | Male | Broadcast, authoritative |
| en-US-JennyNeural | Female | Friendly, versatile |
| en-US-AriaNeural | Female | Professional, polished |
| en-US-DavisNeural | Male | Clear, technical |
| en-US-ChristopherNeural | Male | Natural, conversational |

### Other Languages
```bash
# List all available voices
edge-tts --list-voices

# Filter by language
edge-tts --list-voices | grep "de-DE"  # German
edge-tts --list-voices | grep "fr-FR"  # French
edge-tts --list-voices | grep "es-ES"  # Spanish
```

## Text Preparation Best Practices

### For Natural Pacing
- Use blank lines between paragraphs (creates pauses)
- Em dashes (—) create brief pauses
- Numbered sections help with structure
- End sentences with proper punctuation

### For Accurate Pronunciation
- Spell out abbreviations: "AI" → "A I" or "artificial intelligence"
- Use phonetic spellings for unusual terms if needed
- Avoid special characters that may cause issues

### For Academic/Lecture Style
- Short paragraphs (2-4 sentences)
- Explicit structural transitions ("First.", "Second.", "Now consider...")
- Rhetorical pauses indicated by line breaks
- Deliberate pacing through sentence structure

## Example: Oxford Seminar Style

Input text optimized for neural TTS:

```
Let us begin with a careful distinction.

The question before us is not merely whether artificial intelligence systems might one day become conscious.

That is already widely debated.

The question I want to examine is more specific — and perhaps more difficult.
```

Note:
- Short sentences for measured delivery
- Line breaks for pauses
- Em dash for rhetorical pause
- Clear structural phrases

## Batch Processing

Process multiple files:
```bash
for f in *.txt; do
  edge-tts --voice en-GB-RyanNeural --rate=-15% --file "$f" --write-media "${f%.txt}.mp3"
done
```

## With Subtitles

Generate audio and synchronized subtitles:
```bash
edge-tts --voice en-GB-RyanNeural --rate=-15% \
  --file lecture.txt \
  --write-media lecture.mp3 \
  --write-subtitles lecture.srt
```

## Claude Code Skill

Invoke the text-to-voice skill:
```
/text-to-voice lecture.txt
/text-to-voice help
```

The skill auto-detects content type and suggests appropriate voice presets.

## Files in This Directory

- `lecture.txt` — Sample Oxford-style lecture script
- `AI_Valence_Oxford_45min.mp3` — Generated lecture audio
- `TEXT_TO_VOICE.md` — This documentation
