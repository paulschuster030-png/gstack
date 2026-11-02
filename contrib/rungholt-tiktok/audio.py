"""Tonmischung pro Teil: Stimme + Atmo + Drone + Soundeffekte -> build/part<N>/mix.wav (Stereo, 44.1 kHz).
Alle Klänge werden hier synthetisiert (keine fremden Samples)."""
import json, os, sys, wave
import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(1362)

def db(x): return 10 ** (x / 20)
def t_(d): return np.arange(int(d * SR)) / SR
def noise(n): return rng.standard_normal(n).astype(np.float32)

def fband(x, lo=None, hi=None, slope=4.0):
    """Statischer Filter im Frequenzbereich (weiche Flanken)."""
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** slope)
    if hi: m *= 1 / (1 + (f / hi) ** slope)
    return np.fft.irfft(X * m, n).astype(np.float32)

def env(n, a=.005, r=.3, hold=0.0):
    e = np.ones(n, np.float32); ai = max(1, int(a * SR)); e[:ai] = np.linspace(0, 1, ai)
    h = int(hold * SR); tail = n - ai - h
    if tail > 0: e[ai + h:] = np.exp(-np.arange(tail) / (r * SR))
    return e

def norm(x, peak=.9):
    m = np.max(np.abs(x)) + 1e-9; return (x / m * peak).astype(np.float32)

def reverb_ir(dur=2.2, decay=.6, damp=4000):
    n = int(dur * SR); ir = noise(n) * np.exp(-np.arange(n) / (decay * SR))
    ir = fband(ir, hi=damp); ir[0] = 1.0
    return ir / np.sqrt(np.sum(ir ** 2))

def conv(x, ir):
    n = len(x) + len(ir) - 1; N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:n].astype(np.float32)

IR_BIG = reverb_ir(3.0, .9, 3500)
IR_ROOM = reverb_ir(.6, .12, 6000)

# ---------------------------------------------------------------- Soundeffekte
def bell(f0=330, dur=5.0, bright=1.0):
    t = t_(dur); x = np.zeros_like(t)
    for ratio, amp, dec in [(.5, .5, 3.5), (1, 1, 2.6), (1.19, .55, 1.8), (1.5, .45, 1.6), (2.0, .4, 1.2), (2.51, .3 * bright, .9), (3.0, .2 * bright, .7), (4.2, .12 * bright, .4)]:
        x += amp * np.sin(2 * np.pi * f0 * ratio * t + rng.random() * 6) * np.exp(-t / dec)
    x *= env(len(t), .002, 10)
    return norm(x, .8)

def sfx(name):
    if name in ('bell_far', 'bell_soft'):
        b = bell(392 if name == 'bell_far' else 523, 4.5, .6)
        b = fband(b, lo=200, hi=2500 if name == 'bell_far' else 4000)
        w = conv(b, IR_BIG)
        return norm(w * .7 + np.pad(b, (0, len(w) - len(b))) * (.15 if name == 'bell_far' else .4), .8)
    if name == 'knock3':
        out = np.zeros(int(1.6 * SR), np.float32)
        for k, off in enumerate([0, .5, 1.0]):
            n = int(.25 * SR); t = t_(.25)
            th = np.sin(2 * np.pi * (110 - 40 * t) * t) * np.exp(-t / .045)
            cl = fband(noise(n), lo=300, hi=2500) * np.exp(-t / .012) * .5
            i = int(off * SR); out[i:i + n] += (th + cl) * (1 - .08 * k)
        return norm(conv(out, IR_ROOM)[:len(out) + 8000], .95)
    if name == 'crack':
        n = int(1.2 * SR); out = np.zeros(n, np.float32)
        for k in range(14):
            i = int((rng.random() ** 2) * .5 * SR); m = int(.03 * SR)
            out[i:i + m] += fband(noise(m), lo=1500, hi=9000) * np.exp(-np.arange(m) / (.004 * SR)) * (1 - k / 16)
        t = t_(1.2); ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / .25) for f in (1180, 1730, 2650)) * .08
        return norm(conv(out + ring.astype(np.float32), IR_ROOM)[:n], .95)
    if name == 'splash':
        n = int(1.0 * SR); t = t_(1.0)
        return norm(fband(noise(n), lo=200, hi=5000) * np.exp(-t / .25) * env(n, .01, 1), .8)
    if name == 'squelch':
        n = int(.9 * SR); t = t_(.9)
        x = fband(noise(n), hi=600) * (1 + .8 * np.sin(2 * np.pi * 9 * t)) * np.exp(-t / .3)
        x += np.sin(2 * np.pi * (90 + 60 * np.sin(2 * np.pi * 3 * t)) * t) * np.exp(-t / .2) * .5
        return norm(x * env(n, .03, 1), .8)
    if name == 'click':
        n = int(.12 * SR); t = t_(.12)
        x = fband(noise(n), lo=1500) * (np.exp(-t / .006) + .6 * np.exp(-np.maximum(t - .05, 0) / .006) * (t > .05))
        return norm(x, .7)
    if name == 'tick':
        t = t_(.35)
        x = np.sin(2 * np.pi * 1320 * t) * np.exp(-t / .05) + .4 * np.sin(2 * np.pi * 660 * t) * np.exp(-t / .08)
        return norm(x, .6)
    if name == 'whoosh':
        n = int(1.2 * SR); t = t_(1.2)
        x = fband(noise(n), lo=300, hi=3000) * np.sin(np.pi * np.clip(t / 1.2, 0, 1)) ** 2
        return norm(x, .7)
    if name == 'riser':
        n = int(3.0 * SR); t = t_(3.0)
        x = fband(noise(n), lo=500, hi=6000) * (t / 3) ** 2 + .3 * np.sin(2 * np.pi * (220 + 200 * t / 3) * t) * (t / 3)
        return norm(x * env(n, .5, 3), .6)
    if name == 'dial':
        out = []
        for lo, hi in [(697, 1209), (697, 1209), (697, 1336)]:
            t = t_(.16); out.append((np.sin(2 * np.pi * lo * t) + np.sin(2 * np.pi * hi * t)) * env(len(t), .005, 1)); out.append(np.zeros(int(.09 * SR)))
        t = t_(1.6); ring = np.sin(2 * np.pi * 425 * t) * ((t % 1.0) < .9) * .6  # Freizeichen DE
        out.append(ring)
        return norm(np.concatenate(out), .45)
    if name == 'water':
        n = int(3.0 * SR); t = t_(3.0)
        x = fband(noise(n), lo=400, hi=3000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 1.3 * t + np.sin(2 * np.pi * .4 * t))))
        return norm(x * env(n, .4, 2), .5)
    if name == 'motor':
        n = int(6.0 * SR); t = t_(6.0)
        x = sum(np.sin(2 * np.pi * 38 * k * t) / k for k in range(1, 7)) * (1 + .3 * np.sin(2 * np.pi * 7 * t))
        x = fband(x, hi=900) + fband(noise(n), lo=80, hi=500) * .3
        return norm(x * env(n, 1.5, 6) * np.clip(t / 2, 0, 1), .6)
    if name == 'switch':
        out = np.zeros(int(1.6 * SR), np.float32)
        for k in range(8):
            m = int(.04 * SR); i = int(k * .16 * SR)
            out[i:i + m] += fband(noise(m), lo=800, hi=6000) * np.exp(-np.arange(m) / (.004 * SR))
        return norm(out, .7)
    if name == 'creak':
        n = int(1.6 * SR); t = t_(1.6)
        f = 180 + 60 * np.sin(2 * np.pi * .7 * t) + 20 * rng.standard_normal(n).cumsum() / np.sqrt(n)
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        x = fband(saw.astype(np.float32), lo=300, hi=2500) * (.5 + .5 * np.sin(2 * np.pi * 11 * t) ** 2)
        return norm(x * env(n, .1, 1.2), .6)
    if name == 'shimmer':
        out = np.zeros(int(2.0 * SR), np.float32)
        for k, f in enumerate([1568, 2093, 2637, 3136, 2637]):
            t = t_(1.2); i = int(k * .09 * SR)
            out[i:i + len(t)] += np.sin(2 * np.pi * f * t) * np.exp(-t / .3) * .4
        return norm(conv(out, IR_BIG)[:int(3 * SR)], .5)
    if name in ('thunder_far', 'thunder_close'):
        d = 6.0; n = int(d * SR); t = t_(d)
        rum = fband(np.cumsum(noise(n)) / 200, lo=20, hi=180)
        e = np.exp(-t / (1.8 if name == 'thunder_far' else 1.4)) * (1 + .6 * np.sin(2 * np.pi * .9 * t + 1) ** 2)
        x = rum * e
        if name == 'thunder_close':
            m = int(.35 * SR); x[:m] += fband(noise(m), lo=400, hi=8000) * np.exp(-np.arange(m) / (.05 * SR)) * 3
            x += fband(noise(n), lo=60, hi=1200) * np.exp(-t / .8) * .6
        else:
            x = fband(x, hi=400)
        return norm(x * env(n, .05 if name == 'thunder_close' else .4, 3, .2), .95)
    if name == 'zap':
        n = int(.6 * SR); t = t_(.6)
        x = fband(noise(n), lo=2000) * (rng.random(n) > .8) * np.exp(-t / .15)
        return norm(x, .6)
    if name == 'hit':
        t = t_(1.4)
        x = np.sin(2 * np.pi * (58 - 18 * t) * t) * np.exp(-t / .35) + fband(noise(len(t)), lo=100, hi=1500) * np.exp(-t / .04) * .4
        return norm(conv(x.astype(np.float32), IR_ROOM)[:len(t)], .9)
    if name == 'pop':
        t = t_(.25)
        x = np.sin(2 * np.pi * (520 + 900 * np.exp(-t / .02)) * t) * np.exp(-t / .045) + fband(noise(len(t)), lo=2000) * np.exp(-t / .004) * .3
        return norm(x, .8)
    if name == 'ding':
        t = t_(1.2)
        x = (np.sin(2 * np.pi * 1318.5 * t) + .5 * np.sin(2 * np.pi * 1975.5 * t)) * np.exp(-t / .35)
        return norm(conv(x.astype(np.float32), IR_ROOM)[:len(t)], .6)
    raise KeyError(name)

SFX_GAIN = {'bell_far': -9, 'bell_soft': -10, 'knock3': -5, 'crack': -6, 'splash': -10, 'squelch': -9, 'click': -12,
            'tick': -15, 'whoosh': -14, 'riser': -14, 'dial': -16, 'water': -16, 'motor': -11, 'switch': -12, 'creak': -10,
            'shimmer': -14, 'pop': -12, 'ding': -16, 'thunder_far': -8, 'thunder_close': -4, 'zap': -14, 'hit': -9}

# ---------------------------------------------------------------- Atmo
def ambience(kind, dur):
    n = int(dur * SR); t = t_(dur)
    gust = lambda sp, ph: .55 + .45 * np.sin(2 * np.pi * sp * t + ph) * np.sin(2 * np.pi * sp * .37 * t + ph * 2)
    if kind in ('fog', 'wind', 'ice', 'calm'):
        w = fband(noise(n), lo=150, hi={'fog': 900, 'wind': 1600, 'ice': 2400, 'calm': 700}[kind]) * gust(.08, 1)
        sea = fband(noise(n), lo=60, hi=400) * (.6 + .4 * np.sin(2 * np.pi * .11 * t))
        x = w * {'fog': .5, 'wind': .9, 'ice': .5, 'calm': .35}[kind] + sea * {'fog': .5, 'wind': .4, 'ice': .1, 'calm': .4}[kind]
        if kind == 'ice': x += np.sin(2 * np.pi * 1760 * t) * .015 * gust(.05, 2)
        return x
    if kind in ('storm', 'thunder'):
        w = fband(noise(n), lo=120, hi=2200) * gust(.13, .4) * 1.2
        rainn = fband(noise(n), lo=1500, hi=9000) * .35
        low = fband(noise(n), lo=30, hi=160) * .6
        return w + rainn + low
    if kind == 'storm_in':
        w = fband(noise(n), lo=60, hi=500) * gust(.11, .7) * 1.1
        rainn = fband(noise(n), lo=2000, hi=7000) * .12 * (rng.random(n) > .6)
        return w + rainn
    if kind == 'calm_in':
        return fband(noise(n), lo=80, hi=300) * .15
    if kind == 'boat':
        eng = sum(np.sin(2 * np.pi * 38 * k * t) / k for k in range(1, 5)) * .15
        return fband(noise(n), lo=80, hi=600) * .5 + eng
    return np.zeros(n, np.float32)
AMB_GAIN = {'fog': -24, 'wind': -23, 'ice': -26, 'calm': -28, 'storm': -19, 'thunder': -20, 'storm_in': -21, 'calm_in': -30, 'boat': -23}

def drone(dur):
    t = t_(dur)
    x = np.zeros_like(t)
    for f, a in [(55, .5), (82.4, .3), (110, .25), (130.8, .12), (164.8, .08)]:
        x += a * np.sin(2 * np.pi * f * t + .3 * np.sin(2 * np.pi * .05 * t)) * (.6 + .4 * np.sin(2 * np.pi * (.03 + f / 9000) * t))
    hi = np.sin(2 * np.pi * 1318.5 * t) * .03 * (.5 + .5 * np.sin(2 * np.pi * .07 * t)) + np.sin(2 * np.pi * 1396.9 * t) * .02 * (.5 + .5 * np.sin(2 * np.pi * .05 * t + 2))
    return (x + hi).astype(np.float32)

# ---------------------------------------------------------------- Mischen
def read_wav(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[1]: return
    x = x[: buf.shape[1] - i]
    buf[0, i:i + len(x)] += x * gain * (1 - pan) ** .5
    buf[1, i:i + len(x)] += x * gain * (1 + pan) ** .5

def mix(part):
    d = os.path.join(HERE, 'build', f'part{part}')
    tl = json.load(open(os.path.join(d, 'timeline.json')))
    voice = read_wav(os.path.join(d, 'voice.wav'))
    dur = tl['duration'] + 0.5
    n = int(dur * SR)
    out = np.zeros((2, n), np.float32)
    # Stimme (leichter Raum)
    v = norm(voice, .5); vw = conv(v, IR_ROOM)[:len(v)]
    v = v + vw * .07
    place(out, v, 0, 1.0)
    # Ducking-Hüllkurve aus Stimme
    venv = np.convolve(np.abs(v), np.ones(int(.12 * SR)) / int(.12 * SR), 'same')
    venv = np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)
    venv = np.pad(venv, (0, max(0, n - len(venv))))[:n]
    duck = 1 - .45 * venv
    # Atmo mit Überblendungen
    for a in tl['amb']:
        t0, t1 = max(0, a['t0'] - .6), min(dur, a['t1'] + .6)
        x = ambience(a['type'], t1 - t0); fade = int(.6 * SR)
        x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
        x = norm(x, .9) * db(AMB_GAIN[a['type']])
        i = int(t0 * SR); m = min(len(x), n - i)
        xl = x[:m] * duck[i:i + m]
        xr = np.roll(x[:m], 977) * duck[i:i + m]
        out[0, i:i + m] += xl; out[1, i:i + m] += xr
    # Drone
    dr = norm(drone(dur), .9) * db(-31)
    fi = int(2 * SR); dr[:fi] *= np.linspace(0, 1, fi); dr[-fi:] *= np.linspace(1, 0, fi)
    out[0, :len(dr)] += dr[:n]; out[1, :len(dr)] += np.roll(dr, 331)[:n]
    # Effekte
    cache = {}
    def S(name):
        if name not in cache: cache[name] = sfx(name)
        return cache[name]
    for e in tl['sfx']:
        g = db(SFX_GAIN.get(e['name'], -12)) * (e['gain'] / .6)
        place(out, S(e['name']), e['t'], g, pan=-.25 if e['name'] in ('bell_far',) else 0)
    for b in tl['beats']:
        if b['stamp']: place(out, S('hit'), b['stamp']['t'] - .02, db(-13))
        if b['card']:
            for i in range(len(b['card']['items'])): place(out, S('tick'), b['t0'] + .5 + i * .38, db(-17))
    # Limiter + Pegel
    out = np.tanh(out * 1.4) / 1.4
    peak = np.max(np.abs(out)); out = out / peak * db(-1.0)
    pcm = (np.clip(out.T, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(d, 'mix.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    rms = 20 * np.log10(np.sqrt(np.mean(out ** 2)) + 1e-9)
    print(f'Teil {part}: mix.wav {dur:.1f}s, RMS {rms:.1f} dBFS')

if __name__ == '__main__':
    for p in (sys.argv[1:] or sorted(int(d[4:]) for d in os.listdir(os.path.join(HERE, 'build')) if d.startswith('part'))): mix(int(p))
