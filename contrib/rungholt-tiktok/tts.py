"""Erzeugt pro Teil: Sprachspur (WAV) + timeline.json mit Wort-Zeiten.
Jeder Teil wird AM STÜCK gesprochen (durchgehende Betonung). Danach werden überlange
Pausen gekürzt und die Wort-Zeiten entsprechend verschoben.
Aufruf: venv/bin/python tts.py [teilnummern...]"""
import asyncio, hashlib, json, os, re, subprocess, sys, wave
import base64, ssl, urllib.request
import numpy as np
from story import PARTS

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
OUT = os.path.join(HERE, "build")
os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
VOICE, RATE, PITCH = "de-DE-FlorianMultilingualNeural", "-6%", "-28Hz"
SLOW_RATE = "-14%"   # Hook + Twist: langsamer, spannender
# Düstere, tiefe Erzählerstimme: tiefer (Formanten mit), Bass rauf, Mitten runter, leicht komprimiert.
# Abgeglichen mit der Klangfarbe des Beispielvideos (Bänder 0.3-1k / 1-3k / 3-7k relativ zu 80-300 Hz).
DARK = ("rubberband=pitch=0.93:formant=shifted:transients=mixed:detector=soft:pitchq=quality:smoothing=on,"
        "equalizer=f=550:t=o:w=1.8:g=-5,bass=g=3:f=140,treble=g=3:f=4500,"
        "acompressor=threshold=-22dB:ratio=3:attack=10:release=200:makeup=2")
SR = 44100
LEAD = 0.15          # Stille am Anfang
SENT_PAUSE = 0.27    # hörbare Stille nach einem Satz innerhalb eines Blocks
MIN_BEAT_PAUSE = 0.28
SUSPENSE = 0.62     # Pause bei „…“
MAX_INNER = 0.32     # hörbare Pausen darüber werden gekürzt

MARK = re.compile(r"\{([^|}]*)\|([^}]*)\}")

def tokenize(say):
    """-> list of (display, spoken) per whitespace token."""
    subs = []
    def rep(m):
        subs.append((m.group(1), m.group(2))); return f"\x00{len(subs)-1}\x00"
    s = MARK.sub(rep, say)
    toks = []
    for raw in s.split():
        disp = re.sub(r"\x00(\d+)\x00", lambda m: subs[int(m.group(1))][0], raw)
        spok = re.sub(r"\x00(\d+)\x00", lambda m: subs[int(m.group(1))][1], raw)
        toks.append((disp, spok))
    return toks

async def synth(text, path_mp3, path_json, rate):
    import edge_tts
    c = edge_tts.Communicate(text, VOICE, rate=rate, pitch=PITCH, boundary="WordBoundary")
    audio = b""; wb = []
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            wb.append(dict(t=ch["offset"] / 1e7, d=ch["duration"] / 1e7, text=ch["text"]))
    open(path_mp3, "wb").write(audio)
    json.dump(wb, open(path_json, "w"), ensure_ascii=False)

# ---- ElevenLabs (bevorzugt, wenn ELEVENLABS_API_KEY gesetzt ist) -------------------------------
ELEVEN_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
ELEVEN_VOICE = os.environ.get("ELEVENLABS_VOICE_ID", "").strip() or "JiW03c2Gt43XNUQAumRP"  # "Helmut Stieglbauer – Deep" (Bibliothek, vom Nutzer gewählt)
ELEVEN_MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
# Natürliche Stimme: nicht verbiegen, nur etwas Wärme und gleichmäßiger Pegel.
# Natürliche Stimme wie gewählt (keine Tonhöhenänderung), nur Hochpass + gleichmäßiger Pegel.
NATURAL = "highpass=f=60,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=200:makeup=1.5"

def tts_eleven(text, slow):
    settings = dict(stability=0.45, similarity_boost=0.8, style=0.3, use_speaker_boost=True, speed=0.85 if slow else 0.9)  # Tempo wie im Beispielvideo
    key = json.dumps([ELEVEN_VOICE, ELEVEN_MODEL, settings, text], ensure_ascii=False)
    h = "el_" + hashlib.sha1(key.encode()).hexdigest()[:16]
    mp3 = os.path.join(CACHE, h + ".mp3"); js = os.path.join(CACHE, h + ".json")
    if not (os.path.exists(mp3) and os.path.exists(js) and os.path.getsize(mp3) > 0):
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE}/with-timestamps?output_format=mp3_44100_128"
        body = json.dumps(dict(text=text, model_id=ELEVEN_MODEL, voice_settings=settings)).encode()
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "xi-api-key": ELEVEN_KEY, "Content-Type": "application/json", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=600, context=ssl.create_default_context()) as r:
            resp = json.load(r)
        open(mp3, "wb").write(base64.b64decode(resp["audio_base64"]))
        al = resp.get("alignment") or resp.get("normalized_alignment")
        words, cur, t0, t1 = [], "", None, None
        for ch, a, b in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
            if ch.isspace():
                if cur: words.append(dict(t=t0, d=t1 - t0, text=cur))
                cur, t0 = "", None
            else:
                if t0 is None: t0 = a
                cur += ch; t1 = b
        if cur: words.append(dict(t=t0, d=t1 - t0, text=cur))
        json.dump(words, open(js, "w"), ensure_ascii=False)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-af", NATURAL, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0, json.load(open(js))

def tts(text, rate=RATE):
    if ELEVEN_KEY:
        if not ELEVEN_VOICE:
            sys.exit("ELEVENLABS_API_KEY ist gesetzt, aber ELEVENLABS_VOICE_ID fehlt. Stimme suchen: python elevenlabs_voices.py")
        return tts_eleven(text, rate == SLOW_RATE)
    h = hashlib.sha1(f"{VOICE}|{rate}|{PITCH}|{text}".encode()).hexdigest()[:16]
    mp3 = os.path.join(CACHE, h + ".mp3"); js = os.path.join(CACHE, h + ".json")
    if not (os.path.exists(mp3) and os.path.exists(js) and os.path.getsize(mp3) > 0):
        for attempt in range(4):
            try:
                asyncio.run(synth(text, mp3, js, rate)); break
            except Exception as e:
                print("retry", attempt, e, file=sys.stderr)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-af", DARK, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0, json.load(open(js))

def norm(w): return re.sub(r"[^\wäöüß]", "", w.lower())

def align(spoken_tokens, wb):
    """Word-Boundary-Events -> (start, end) je Token über Zeichenpositionen."""
    spoken = " ".join(spoken_tokens)
    spans, pos = [], 0
    for s in spoken_tokens:
        spans.append((pos, pos + len(s))); pos += len(s) + 1
    low = spoken.lower(); cur = 0
    n = len(spoken_tokens); st = [None] * n; en = [None] * n
    j = 0
    for ev in wb:
        k = low.find(ev["text"].lower(), cur)
        if k < 0: continue
        cur = k + len(ev["text"])
        while j < n and spans[j][1] <= k: j += 1
        if j < n and spans[j][0] <= k:
            if st[j] is None: st[j] = ev["t"]
            en[j] = ev["t"] + ev["d"]
    for i in range(n):  # Lücken interpolieren
        if st[i] is None:
            prev = next((en[q] for q in range(i - 1, -1, -1) if en[q] is not None), 0.0)
            nxt = next((st[q] for q in range(i + 1, n) if st[q] is not None), prev + .4)
            st[i] = prev + .02; en[i] = max(st[i] + .12, min(nxt - .02, st[i] + .35))
    return st, en

def build(part):
    beats = part["beats"]
    toks, owner = [], []
    for bi, b in enumerate(beats):
        for tk in tokenize(b["say"]):
            toks.append(tk); owner.append(bi)
    # Gruppen gleicher Sprechgeschwindigkeit am Stück synthetisieren und aneinanderhängen
    groups = []
    for i, bi in enumerate(owner):
        slow = bool(beats[bi].get("slow"))
        if not groups or groups[-1][0] != slow: groups.append([slow, []])
        groups[-1][1].append(i)
    xs, st, en, off = [], [0.0] * len(toks), [0.0] * len(toks), 0.0
    full = ""
    for slow, idx in groups:
        text = " ".join(toks[i][1] for i in idx); full += text + " "
        xg, wbg = tts(text, SLOW_RATE if slow else RATE)
        sg, eg = align([toks[i][1] for i in idx], wbg)
        a = max(0.0, sg[0] - .05); b = min(len(xg) / SR, eg[-1] + .45)
        xs.append(xg[int(a * SR):int(b * SR)])
        for k, i in enumerate(idx): st[i] = sg[k] - a + off; en[i] = eg[k] - a + off
        off += b - a
    x = np.concatenate(xs)
    n = len(toks)
    first = {}; last = {}
    for i, bi in enumerate(owner):
        first.setdefault(bi, i); last[bi] = i
    # Echte Stille messen (5-ms-Raster), Schnitte nur innerhalb gemessener Stille
    hop = int(.005 * SR)
    rms = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(hop * 6) / (hop * 6), "same")[::hop])
    silent = rms < rms.max() * 10 ** (-36 / 20)
    def silent_run(a, b):
        """längste stille Strecke zwischen a und b (Sekunden) -> (start, end) oder None"""
        i0, i1 = max(0, int(a / .005)), min(len(silent), int(b / .005) + 1)
        best, cur0 = None, None
        for i in range(i0, i1):
            if silent[i] and cur0 is None: cur0 = i
            if (not silent[i] or i == i1 - 1) and cur0 is not None:
                e = i if not silent[i] else i + 1
                if best is None or e - cur0 > best[1] - best[0]: best = (cur0, e)
                cur0 = None
        return (best[0] * .005, best[1] * .005) if best else None
    # Pausen-Edits: (Position, Delta) -- Delta<0 schneidet, >0 fügt Stille ein
    edits = []
    for i in range(n - 1):
        a, b_ = en[i], st[i + 1]
        boundary = owner[i] != owner[i + 1]
        run = silent_run(a - .05, b_ + .08)
        L = (run[1] - run[0]) if run else 0.0
        if boundary:
            g = beats[owner[i]].get("gap", 0.3)
            want = max(MIN_BEAT_PAUSE, 0.28 + (g - 0.3) * 0.6)  # Spannungspausen bleiben spürbar, aber kürzer
        elif toks[i][1].endswith("…"):
            want = SUSPENSE
        elif L > MAX_INNER:
            want = SENT_PAUSE
        else:
            continue
        if run and L > want + .02:
            c = L - want
            edits.append((run[0] + want / 2, -c))
        elif (boundary or toks[i][1].endswith("…")) and want - L > .02:
            pos = (run[0] + run[1]) / 2 if run else (a + b_) / 2
            edits.append((pos, want - L))
    # Anfang/Ende
    head = max(0.0, st[0] - .05)
    tail_end = min(len(x) / SR, en[-1] + .3)
    edits.sort()
    # Audio neu zusammensetzen
    fade = int(.012 * SR)
    pieces = [np.zeros(int(LEAD * SR), np.float32)]
    cur = head
    def seg(a, b):
        y = x[int(a * SR):int(b * SR)].copy()
        if len(y) > 2 * fade:
            y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
        return y
    for pos, d in edits:
        if pos < cur: continue
        pieces.append(seg(cur, pos))
        if d < 0: cur = pos - d
        else: pieces.append(np.zeros(int(d * SR), np.float32)); cur = pos
    pieces.append(seg(cur, tail_end))
    voice_core = np.concatenate(pieces)
    def remap(t):
        out = LEAD + (t - head)
        for pos, d in edits:
            if pos >= t: break
            if d < 0: out -= min(-d, t - pos)
            else: out += d
        return out
    S = [remap(v) for v in st]; Eend = [remap(v) for v in en]
    final_gap = beats[-1].get("gap", 1.5)
    voice = np.concatenate([voice_core, np.zeros(int(final_gap * SR), np.float32)])
    total = len(voice) / SR

    # Beats + Zeitachse
    beats_out, sfx, amb = [], [], []
    lab = ""; hud = 0.0; amb_cur = None; prev_sc = None; sc_start = 0.0
    t0s = []
    for bi in range(len(beats)):
        s0 = S[first[bi]] - .12
        if bi == 0: s0 = min(s0, LEAD)
        else: s0 = max(s0, Eend[last[bi - 1]] + .02)
        t0s.append(round(max(0, s0), 3))
    for bi, b in enumerate(beats):
        t = t0s[bi]
        end = t0s[bi + 1] if bi + 1 < len(beats) else total
        colors = {}
        for key, col in (("red", "red"), ("grn", "green"), ("org", "orange")):
            for w in b.get(key, []): colors[norm(w)] = col
        words = [dict(text=toks[i][0], t0=round(S[i], 3), t1=round(Eend[i], 3), color=colors.get(norm(toks[i][0])))
                 for i in range(first[bi], last[bi] + 1)]
        speech_end = round(Eend[last[bi]], 3)
        def at(trigger):
            if trigger is None: return None
            if isinstance(trigger, (int, float)): return round(t + trigger, 3)
            for w in words:
                if w["text"] == trigger or norm(w["text"]) == norm(trigger): return w["t0"]
            print(f"  ! Teil {part['n']} Beat {bi}: Auslöser '{trigger}' nicht gefunden", file=sys.stderr)
            return round(t, 3)
        if "lab" in b: lab = b["lab"]
        if "hud" in b: hud = b["hud"]
        if b.get("amb") and b["amb"] != amb_cur:
            if amb: amb[-1]["t1"] = t
            amb.append(dict(type=b["amb"], t0=t, t1=None)); amb_cur = b["amb"]
        if b["sc"] != prev_sc: sc_start = t
        prev_sc = b["sc"]
        beats_out.append(dict(i=bi, sc=b["sc"], sp=b.get("sp", {}), t0=t, t1=round(end, 3), speechEnd=speech_end,
                              scStart=round(sc_start, 3), lab=lab, hud=hud, words=words,
                              pills=[dict(text=p[0], color=p[1], t=at(p[2]) if p[2] is not None else speech_end, pos=p[3]) for p in b.get("pills", [])],
                              stamp=(dict(text=b["stamp"][0], color=b["stamp"][1], t=at(b["stamp"][2])) if b.get("stamp") else None),
                              card=(dict(title=b["card"][0], items=b["card"][1]) if b.get("card") else None)))
        for name, trig, gain in b.get("sfx", []):
            sfx.append(dict(name=name, t=at(trig), gain=gain))
    if amb: amb[-1]["t1"] = round(total, 3)
    d = os.path.join(OUT, f"part{part['n']}"); os.makedirs(d, exist_ok=True)
    with wave.open(os.path.join(d, "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes())
    tl = dict(part=part["n"], title=part["title"], hudLabel=part["hud_label"], duration=round(total, 3),
              beats=beats_out, sfx=sfx, amb=amb, caption=part["caption"])
    json.dump(tl, open(os.path.join(d, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    cuts = sum(-dd for _, dd in edits if dd < 0); adds = sum(dd for _, dd in edits if dd > 0)
    print(f"Teil {part['n']}: {total:.1f}s, {len(beats_out)} Beats, {n} Wörter, {len(full.encode())} Bytes Text, "
          f"Pausen gekürzt {cuts:.1f}s / verlängert {adds:.1f}s")

if __name__ == "__main__":
    want = [int(a) for a in sys.argv[1:]] or [p["n"] for p in PARTS]
    for p in PARTS:
        if p["n"] in want: build(p)
