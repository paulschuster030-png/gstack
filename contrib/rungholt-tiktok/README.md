# RUNGHOLT – familienfreundliche Grusel-Serie für TikTok (5 Teile)

Prinzip wie „Sturmvogel“: Regel-Hook → 3 Schritte mit echten Fakten → „Alles nach Protokoll“ → Twist
→ Teaser auf den nächsten Teil → Endkarte „Folgt für Teil X“ (Plus wird zum Haken und verschwindet).
Look: dunkles Petrol, flache Figuren, ein Wort groß in der Mitte, Stempel, Pillen, Skala links. 1080×1920, 30 fps.

## Dateien
- `story.py` – komplettes Drehbuch (Text, Szenen, Einblendungen, Effekte, `slow=True` = spannender gelesen)
- `tts.py` – Sprachspur + Zeitachse. **ElevenLabs**, wenn `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` gesetzt sind,
  sonst kostenlose Microsoft-Neural-Stimme (edge-tts, de-DE-FlorianMultilingualNeural, tiefer gelegt)
- `elevenlabs_voices.py` – listet passende ElevenLabs-Stimmen (Deutsch, männlich, Erzähler)
- `engine.html`, `core.js`, `lib.js`, `scenes*.js` – Animation (SVG im Browser)
- `audio.py` – Atmo, Drone, Soundeffekte (alles synthetisiert) + Mischung
- `render.js` – Rendern mit Playwright/Chromium + ffmpeg; `run_all.sh` – alles nacheinander
- `preview.js` – Standbilder pro Szene (`node preview.js 1` → previews/)

## Voraussetzungen
Python 3 mit `numpy` und `Pillow` (+ `edge-tts` nur ohne ElevenLabs), Node mit Playwright (Chromium), ffmpeg mit rubberband.

## Bauen
    python3 tts.py        # Stimme + Zeitachse (alle Teile)
    ./run_all.sh          # Ton + Video -> final/RUNGHOLT_Teil_N.mp4 (+ Cover, Anleitung)

## Übergabe an die nächste Sitzung (ElevenLabs-Stimme)
1. In den Umgebungs-Einstellungen `ELEVENLABS_API_KEY` eintragen (nicht in den Chat).
2. Neue Sitzung auf Branch `claude/inspiring-gates-bb9315` öffnen.
3. `cd contrib/rungholt-tiktok && python3 elevenlabs_voices.py` → tiefe deutsche Erzählerstimme wählen
   (ruhig, düster, spannend; NICHT die Stimme aus dem Beispielvideo klonen), ggf. in „My Voices“ hinzufügen,
   dann `export ELEVENLABS_VOICE_ID=<id>`.
4. `python3 tts.py` → kurz prüfen (Dauer > 1 Minute je Teil, Untertitel synchron), dann `./run_all.sh`.
