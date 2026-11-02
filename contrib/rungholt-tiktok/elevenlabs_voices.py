"""Zeigt passende ElevenLabs-Stimmen: eigene + Bibliothek (Deutsch, männlich, Erzähler).
Aufruf: ELEVENLABS_API_KEY=... python elevenlabs_voices.py [suchbegriff]"""
import json, os, ssl, sys, urllib.parse, urllib.request
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip() or sys.exit("ELEVENLABS_API_KEY fehlt")
def get(path, **q):
    url = "https://api.elevenlabs.io" + path + ("?" + urllib.parse.urlencode(q) if q else "")
    req = urllib.request.Request(url, headers={"xi-api-key": KEY, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60, context=ssl.create_default_context()) as r:
        return json.load(r)
print("== Eigene Stimmen ==")
for v in get("/v1/voices").get("voices", []):
    print(f"{v['voice_id']}  {v['name']}  {json.dumps(v.get('labels', {}), ensure_ascii=False)}")
print("\n== Bibliothek: Deutsch, männlich, Erzählung ==")
q = dict(language="de", gender="male", page_size=30, sort="usage_character_count_1y")
if len(sys.argv) > 1: q["search"] = " ".join(sys.argv[1:])
for v in get("/v1/shared-voices", **q).get("voices", []):
    print(f"{v['voice_id']}  {v['name']}  [{v.get('age','')}, {v.get('accent','')}, {v.get('use_case','')}]  {v.get('description','')[:80]}")
print("\nStimme aus der Bibliothek erst in 'My Voices' hinzufügen, dann ELEVENLABS_VOICE_ID=<id> setzen.")
