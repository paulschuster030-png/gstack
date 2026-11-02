// Teil 1 — Nebel
(function () {
  const headY = (y, s, kid, small) => y - 135 * s * (small ? .7 : kid ? .82 : 1);
  const watt = (t, o = {}) => sky(o.sky || 'gSky', o.hy || 400) + seaBand(o.hy || 400, (o.hy || 400) + 14, t, .8) + mudflat((o.hy || 400) + 12, t);
  // Priel: gewundener Wasserlauf auf dem Watt (Perspektive)
  const priel = (t, fill = 1, op = 1) => {
    const d = `M 560 430 C 420 450 470 500 360 520 C 250 540 120 560 160 640 C 190 700 60 760 -20 800`;
    return L(d, `rgba(48,104,116,${.85 * op})`, 26 * fill + 2) + L(d, `rgba(130,200,210,${.25 * op})`, 2, `transform="translate(0,-6)"`);
  };

  SC.hook_fog = c => {
    const { lt, sp } = c;
    let s = watt(lt, { sky: 'gSkyNight' }) + priel(lt, .8, .7);
    s += lanternBoy(440, 425, .42, lt, { op: .45, lop: 1, swing: 8, glowR: 110 });
    const kx = 250, ky = 560, sc = 1.35;
    const off = sp.lightOff ? clamp(1 - (c.lt - (c.wt('Licht') ?? 0)) / .25) : 1;
    if (off > 0) s += P(`M ${kx + 44} ${ky - 120} L ${kx + 260} ${ky + 20} L ${kx + 120} ${ky + 80} Z`, 'url(#gBeam)', `opacity="${f1(off * .55 * 100) / 100}" transform="rotate(-6 ${kx + 44} ${ky - 120})"`);
    s += person({ who: 'mia', x: kx, y: ky, s: sc, pose: 'reach', face: 'worried' });
    s += person({ who: 'ben', x: kx - 62, y: ky, s: sc, pose: 'stand', face: 'scared' });
    if (off > 0) s += C(kx + 46, ky - 120, 6, '#fff', `opacity="${off}" filter="url(#glow)"`);
    s += fog(lt, 1.5, 200, 900);
    return { svg: s, anchors: {} };
  };

  SC.watt_day = c => {
    const { lt } = c;
    let s = sky('gSkyDawn', 400) + C(150, 330, 120, 'url(#gWarm)', 'opacity=".35"') + seaBand(400, 414, lt) + mudflat(412, lt);
    s += halligFar(440, 414, .9);
    s += priel(lt, .5, .8);
    const bob = Math.abs(Math.sin(lt * 5)) * 3, x0 = 230 + lt * 6;
    s += person({ who: 'ben', x: x0 - 70, y: 585 - bob, s: 1.5, pose: 'stand', face: 'smile', lookX: 2 });
    s += person({ who: 'mia', x: x0 + 10, y: 585 - Math.abs(Math.sin(lt * 5 + 1.5)) * 3, s: 1.5, pose: 'hold', face: 'smile' });
    s += footprints([[x0 - 120, 700], [x0 - 110, 680], [x0 - 98, 660], [x0 - 86, 640], [x0 - 60, 720], [x0 - 52, 700], [x0 - 44, 680], [x0 - 36, 660]], 'rgba(10,12,10,.35)', 1.2);
    return { svg: s, anchors: { tagMia: [x0 + 10, headY(585, 1.5, 1) - 26], tagBen: [x0 - 70, headY(585, 1.5, 1, 1) - 26] } };
  };

  SC.rungholt_rings = c => {
    const { lt } = c;
    let s = sky('gSkyDawn', 300) + seaBand(300, 312, lt) + mudflat(310, lt);
    // Brunnenringe + Pfahlreihen (Spuren von Rungholt)
    const rings = [[180, 520, 60], [360, 600, 48], [250, 760, 70], [430, 820, 40]];
    rings.forEach(([x, y, r], i) => {
      s += E(x, y, r, r * .38, 'none', `stroke="#15160f" stroke-width="9"`) + E(x, y, r * .7, r * .26, 'rgba(60,110,120,.25)');
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; s += R(x + Math.cos(a) * r - 3, y + Math.sin(a) * r * .38 - 3, 6, 5, '#2a1f14', 1); }
    });
    for (let i = 0; i < 9; i++) s += R(60 + i * 26, 410 + Math.sin(i) * 4, 7, 12, '#20180f', 2) + R(300 + i * 22, 470 + i * 3, 6, 10, '#20180f', 2);
    // Geisterhafte Umrisse des alten Dorfes
    const g = clamp(Math.sin(clamp(lt / c.sdur) * Math.PI)) * .22;
    let ghost = '';
    [[110, 470, .7], [200, 455, .6], [330, 470, .75], [440, 460, .55]].forEach(([x, y, k]) => { ghost += house(x, y, k, {}); });
    ghost += R(262, 330, 26, 120, '#9fd') + P('M 262 330 L 275 290 L 288 330 Z', '#9fd');
    s += `<g opacity="${f1(g * 100) / 100}" style="mix-blend-mode:screen" fill="none">${ghost.replace(/fill="[^"]+"/g, 'fill="none" stroke="#bfe" stroke-width="1.5"')}</g>`;
    s += person({ who: 'mia', x: 470, y: 470, s: .9, pose: 'stand' }) + person({ who: 'ben', x: 440, y: 470, s: .9 });
    return { svg: s, anchors: {} };
  };

  // Selfie-Bild (wird in Teil 5 wiederverwendet)
  window.selfieImage = (t, o = {}) => {
    let s = R(-72, -150, 144, 300, '#2c4a55');
    s += R(-72, -150, 144, 120, '#4f6b70') + R(-72, -40, 144, 8, '#2a5862') + R(-72, -32, 144, 200, '#34352d');
    s += E(-50, -60, 70, 22, `rgba(${COL.fog},.55)`, 'filter="url(#b10)"') + E(-10, -45, 60, 14, `rgba(${COL.fog},.4)`, 'filter="url(#b10)"');
    // der Junge – winzig, im Nebel, Rücken zur Kamera
    s += G('translate(42,-36)', person({ who: 'boy', x: 0, y: 0, s: .16, pose: 'lantern' }) + lantern(4.5, -13, .1, 1, 0, 9), `opacity="${o.boyOp ?? .75}"`);
    s += person({ who: 'ben', x: -24, y: 160, s: 1.25, face: 'smile' });
    s += person({ who: 'mia', x: 30, y: 175, s: 1.15, face: 'smile', pose: 'reach' });
    return s;
  };
  SC.selfie = c => {
    const { lt } = c;
    let s = bg() + mudflat(600, lt);
    const ui = selfieImage(lt) + R(-72, 120, 144, 30, 'rgba(0,0,0,.45)') + C(0, 135, 11, '#fff') + C(0, 135, 8, 'none', 'stroke="#111" stroke-width="1.5"');
    s += phone(270, 390, 1.45, ui, { rot: -4 });
    s += L('M 600 900 L 395 590', COL.mia, 70) + L('M 600 900 L 395 590', 'rgba(0,0,0,.15)', 2) + E(386, 562, 26, 34, COL.skin, 'transform="rotate(-30 386 562)"') + E(368, 540, 8, 16, COL.skin, 'transform="rotate(-20 368 540)"');
    const fl = c.wt('Selfie') !== null ? clamp(1 - (lt - c.wt('Selfie')) / .25) : 0;
    if (fl > 0 && lt >= c.wt('Selfie')) s += R(0, 0, W, H, `rgba(255,255,255,${f1(fl * .8 * 100) / 100})`);
    return { svg: s };
  };

  SC.fog_in = c => {
    const { lt } = c, k = ease(lt / c.sdur);
    let s = watt(lt) + halligFar(440, 414, .9, {}) + priel(lt, .6, .8);
    s += person({ who: 'ben', x: 230, y: 560, s: 1.25, face: 'worried' }) + person({ who: 'mia', x: 290, y: 560, s: 1.25, face: 'worried', lookX: -3 });
    // Nebelwand von links
    const fx = lerp(-420, 140, k);
    s += E(fx, 420, 520, 380, 'url(#gFog)', 'opacity=".6"');
    s += fog(lt, lerp(.3, 1.7, k), 200, 900);
    return { svg: s };
  };

  SC.fog_bell = c => {
    const { lt } = c;
    let s = watt(lt, { sky: 'gSkyNight' });
    const k = ease(clamp((lt - (c.wt('Flut.') ?? 3)) / 2));
    s += priel(lt, lerp(.6, 1.6, k), 1);
    s += person({ who: 'ben', x: 250, y: 560, s: 1.35, face: 'scared', lookX: -4 }) + person({ who: 'mia', x: 312, y: 560, s: 1.35, face: 'worried', lookX: -4 });
    s += fog(lt, 1.7, 200, 900);
    s += soundWaves(70, 360, lt, 3, 'rgba(255,220,150,.7)', 1);
    return { svg: s };
  };

  SC.kids_fog = c => {
    const { lt, sp } = c;
    let s = watt(lt, { sky: 'gSkyNight' }) + priel(lt, 1, .6);
    const hand = sp.hands;
    s += person({ who: 'ben', x: 205, y: 575, s: 2, face: 'scared', pose: hand ? 'hold' : 'stand', lookX: hand ? 2 : 0 });
    s += person({ who: 'mia', x: 320, y: 575, s: 2, face: 'worried', pose: 'stand', arms: hand ? [[38, -12], [8, 0]] : null });
    s += fog(lt, 1.4, 150, 900);
    return { svg: s };
  };

  SC.circles = c => {
    const { lt } = c;
    let s = bg('gMud') + R(0, 0, W, H, 'rgba(10,20,24,.55)');
    for (let i = 0; i < 18; i++) s += L(`M 0 ${i * 56} L ${W} ${i * 56 + 20}`, 'rgba(255,255,255,.03)', 1);
    s += TX(270, 120, 'OHNE SICHT', 11, 'rgba(214,226,230,.6)', { mono: 1, w: 500, ls: 4 });
    // Spirale/Kreisbahn
    const cx = 270, cy = 360, R0 = 120, k = clamp(lt / Math.max(3, c.sdur * .8));
    const pts = [];
    const N = 220;
    for (let i = 0; i <= N * k; i++) {
      const a = i / N * Math.PI * 4.2 - Math.PI / 2;
      const r = R0 * (1 - i / N * .15);
      pts.push([cx + Math.cos(a) * r + (i / N) * 30, cy + Math.sin(a) * r * .95]);
    }
    if (pts.length > 1) s += L('M ' + pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join(' L '), 'rgba(246,168,35,.85)', 3, 'stroke-dasharray="2 7"');
    const last = pts[pts.length - 1] || [cx, cy - R0];
    s += C(last[0], last[1], 9, COL.mia) + C(last[0], last[1], 18, 'url(#gRed)');
    s += C(cx, cy - R0, 5, '#fff') + TX(cx, cy - R0 - 14, 'START', 9, 'rgba(255,255,255,.7)', { mono: 1, w: 700, ls: 2 });
    // Maßlinie
    const mk = clamp((lt - (c.wt('zwanzig') ?? 4)) / .5);
    if (mk > 0) s += O(mk, L(`M ${cx - R0} ${cy} L ${cx + R0} ${cy}`, '#fff', 1.5, 'stroke-dasharray="4 4"') + C(cx - R0, cy, 3, '#fff') + C(cx + R0, cy, 3, '#fff'));
    return { svg: s };
  };

  SC.priele = c => {
    const { lt } = c, k = ease(clamp(lt / 3.5));
    let s = bg('gMud') + R(0, 0, W, 150, 'url(#gSea)');
    s += TX(270, 70, 'MEER', 11, 'rgba(214,226,230,.6)', { mono: 1, w: 500, ls: 6 });
    s += R(0, 810, W, 150, '#22352b') + TX(270, 890, 'HALLIG', 11, 'rgba(214,226,230,.6)', { mono: 1, w: 500, ls: 6 });
    const chans = [
      'M 120 150 C 140 260 80 330 120 420 C 160 520 260 520 330 560 C 400 600 470 640 520 700',
      'M 430 150 C 410 240 470 300 430 380 C 400 450 330 470 300 520',
      'M 60 150 C 40 300 10 420 40 560',
    ];
    chans.forEach((d, i) => {
      const kk = clamp(k * 1.3 - i * .15);
      s += L(d, 'rgba(48,110,124,.9)', 20, `stroke-dasharray="${f1(kk * 900)} 2000"`) + L(d, 'rgba(150,220,230,.35)', 3, `stroke-dasharray="${f1(kk * 900)} 2000"`);
    });
    // Kinder-Position
    s += C(270, 440, 22, 'url(#gWarm)') + C(262, 440, 6, COL.mia) + C(278, 442, 5, COL.ben);
    s += TX(270, 476, 'MIA + BEN', 9, 'rgba(255,255,255,.8)', { mono: 1, w: 700, ls: 2 });
    if (k > .5) s += O(clamp((k - .5) * 3), arrow(150, 260, 175, 330, '#ff4d4f', 3) + arrow(420, 300, 380, 400, '#ff4d4f', 3) + arrow(380, 580, 320, 545, '#ff4d4f', 3));
    return { svg: s };
  };

  const keypad = (typed, lt) => {
    let s = R(-72, -150, 144, 300, '#0e171b');
    s += TX(0, -92, typed || '&#160;', 34, '#fff', { w: 800 });
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    keys.forEach((k, i) => {
      const x = -44 + (i % 3) * 44, y = -48 + Math.floor(i / 3) * 40;
      const hot = typed && typed.length && ((k === '1' && typed.length <= 2) || (k === '2' && typed.length === 3));
      s += C(x, y, 16, hot ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.1)') + TX(x, y + 6, k, 15, '#fff', { w: 700 });
    });
    const pul = 1 + Math.sin(lt * 8) * .06;
    s += G(`translate(0,122) scale(${f1(pul * 100) / 100})`, C(0, 0, 18, COL.green) + P('M -7 -3 Q -6 -9 -2 -8 L 0 -4 L -2 -1 Q 0 3 3 4 L 5 2 L 9 4 Q 9 9 4 8 Q -8 6 -7 -3 Z', '#fff'));
    return s;
  };
  SC.phone_dial = c => {
    const { lt } = c;
    const t0 = (c.wt('112.') ?? 1);
    const n = clamp(Math.floor((lt - t0 + .1) / .18) + 1, 0, 3);
    let s = bg() + C(270, 380, 260, 'url(#gGreen)', 'opacity=".25"');
    s += phone(270, 390, 1.5, keypad('112'.slice(0, n), lt));
    return { svg: s };
  };
  SC.phone_map = c => {
    const { lt } = c;
    let ui = R(-72, -150, 144, 300, '#3a3a31');
    for (let i = 0; i < 12; i++) ui += L(`M -80 ${-150 + i * 26} Q 0 ${-140 + i * 26 + Math.sin(i) * 8} 80 ${-150 + i * 26}`, 'rgba(255,255,255,.05)', 1);
    ui += L('M -80 -60 C -30 -40 -40 10 10 30 C 50 50 40 110 80 140', 'rgba(60,130,145,.9)', 10) + L('M 80 -120 C 40 -90 60 -30 20 -10', 'rgba(60,130,145,.9)', 7);
    const pr = (lt * .8) % 1;
    ui += C(0, 10, 18 + pr * 40, 'rgba(70,160,255,.18)', `opacity="${f1(1 - pr)}"`) + C(0, 10, 26, 'rgba(70,160,255,.18)') + C(0, 10, 8, '#3d8bff', 'stroke="#fff" stroke-width="3"');
    ui += R(-72, -150, 144, 40, 'rgba(14,23,27,.92)') + TX(0, -126, 'NOTRUF · 112', 10, '#fff', { w: 800, ls: 1 }) + TX(0, -114, '54.53° N · 8.61° O', 7, 'rgba(255,255,255,.6)', { mono: 1, w: 500 });
    let s = bg() + C(270, 380, 260, 'url(#gGreen)', 'opacity=".2"') + phone(270, 390, 1.5, ui);
    return { svg: s };
  };
  SC.phone_call = c => {
    const { lt } = c;
    let ui = R(-72, -150, 144, 300, '#0e171b') + C(0, -88, 26, 'rgba(255,255,255,.08)') + TX(0, -80, '112', 16, '#fff', { w: 900 });
    ui += TX(0, -46, 'LEITSTELLE', 12, '#fff', { w: 800, ls: 1 }) + TX(0, -32, `00:${String(14 + Math.floor(lt)).padStart(2, '0')}`, 9, 'rgba(255,255,255,.6)', { mono: 1, w: 500 });
    for (let i = 0; i < 14; i++) { const h = 4 + Math.abs(Math.sin(lt * 9 + i * 1.3)) * 18; ui += R(-52 + i * 8, -4 - h / 2, 4, h, 'rgba(51,209,122,.8)', 2); }
    const chips = [['2 KINDER', 'Kinder.'], ['WATT', 'Watt.'], ['NEBEL', 'Nebel.'], ['FLUT KOMMT', 'kommt.']];
    chips.forEach(([txt, w], i) => {
      const tw = c.wt(w); if (tw === null || lt < tw) return;
      const k = easeBack(clamp((lt - tw) / .2));
      ui += G(`translate(${i % 2 ? 32 : -32},${44 + Math.floor(i / 2) * 26}) scale(${f1(k * 100) / 100})`, R(-30, -10, 60, 20, '#f6a823', 10) + TX(0, 4, txt, 7.5, '#1d1203', { w: 900 }));
    });
    const tb = c.wt('Bleibt,');
    if (tb !== null && lt >= tb) ui += O(clamp((lt - tb) / .2), R(-62, 100, 124, 28, '#33d17a', 14) + TX(0, 118, 'BLEIBT, WO IHR SEID', 8, '#06210f', { w: 900 }));
    let s = bg() + phone(270, 390, 1.5, ui) + soundWaves(410, 300, lt, 3, 'rgba(51,209,122,.6)', 1);
    return { svg: s };
  };

  SC.battery = c => {
    const { lt, sp } = c;
    let s = bg() + C(270, 360, 240, sp.cold ? 'url(#gCold)' : 'url(#gRed)', 'opacity=".25"');
    const lvl = sp.cold ? lerp(18, 11, ease(lt / c.sdur)) : 18;
    s += R(150, 280, 220, 110, 'none', 16, 'stroke="#fff" stroke-width="7"') + R(372, 315, 14, 40, '#fff', 4);
    s += R(162, 292, f1(196 * lvl / 100), 86, COL.red, 8);
    s += TX(270, 350, `${Math.round(lvl)} %`, 40, '#fff', { w: 900 });
    // Taschenlampe
    const on = sp.cold ? (lt < (c.wt('Rest.') ?? 99) ? 1 : 0) : (c.wt('aus.') !== null && lt >= c.wt('aus.') ? 0 : 1);
    s += G('translate(270,500)', R(-50, -12, 70, 24, '#d0d6d8', 6) + P('M 20 -18 L 40 -24 L 40 24 L 20 18 Z', '#b9c1c4') +
      (on ? P('M 40 -24 L 240 -80 L 240 80 L 40 24 Z', 'url(#gBeam)', 'transform="rotate(-90 40 0)" opacity=".0"') + C(40, 0, 30, 'url(#gWhite)', 'opacity=".9"') : ''));
    if (sp.cold) {
      const k = clamp((lt - (c.wt('Kälte') ?? 1)) / .3);
      s += O(k, G('translate(270,200)', [0, 60, 120].map(a => L(`M ${f1(Math.cos(a * Math.PI / 180) * -26)} ${f1(Math.sin(a * Math.PI / 180) * -26)} L ${f1(Math.cos(a * Math.PI / 180) * 26)} ${f1(Math.sin(a * Math.PI / 180) * 26)}`, '#bfefff', 4)).join('') + C(0, 0, 5, '#bfefff')));
    }
    return { svg: s };
  };

  SC.phone_pocket = c => {
    const { lt } = c;
    let s = bg();
    s += P('M 60 230 Q 270 150 480 230 L 520 960 L 20 960 Z', COL.mia);
    s += P('M 180 175 L 270 330 L 360 175 Q 270 150 180 175 Z', '#2b2f38') + E(270, 160, 60, 26, COL.skin);
    s += P('M 270 330 L 280 960 L 470 960 L 455 260 Q 400 200 360 175 Z', '#7a2623');
    s += L('M 270 330 L 280 960', '#c9c9c9', 3, 'stroke-dasharray="2 4"');
    s += P('M 60 230 L 10 960 L 70 960 L 110 260 Z', '#b93a36') + P('M 480 230 L 530 960 L 470 960 L 430 260 Z', '#b93a36');
    s += P('M 300 380 L 430 380 L 430 560 Q 365 580 300 560 Z', '#5e1d1b');
    s += L('M 300 380 L 430 380', 'rgba(0,0,0,.35)', 3);
    const tp = c.wt('Innentasche.') ?? 2;
    const k = ease(clamp((lt - tp + .3) / .7));
    const py = lerp(200, 470, k);
    s += G(`translate(365,${f1(py)}) rotate(${f1(lerp(-20, 0, k))})`, R(-34, -62, 68, 124, '#0f1417', 10) + R(-30, -56, 60, 112, '#0a0f12', 7));
    s += P('M 300 460 L 430 460 L 430 560 Q 365 580 300 560 Z', '#6b2220') + L('M 300 460 L 430 460', 'rgba(255,255,255,.2)', 2);
    const wk = clamp((lt - (c.wt('warm.') ?? 3)) / .4);
    s += C(365, 500, 120, 'url(#gWarm)', `opacity="${f1(wk * .7 * 100) / 100}"`);
    return { svg: s };
  };

  SC.kids_dark = c => {
    const { lt } = c;
    let s = watt(lt, { sky: 'gSkyNight' }) + R(0, 0, W, H, 'rgba(0,8,12,.35)');
    s += person({ who: 'ben', x: 215, y: 590, s: 1.9, face: 'scared', pose: 'hold' }) + person({ who: 'mia', x: 320, y: 590, s: 1.9, face: 'worried', arms: [[38, -12], [8, 0]] });
    const wl = lerp(600, 572, ease(lt / c.sdur));
    s += waterLayer(wl, lt, { amp: 2.5, col: 'rgba(30,70,80,.85)' });
    s += fog(lt, 1.6, 150, 900);
    return { svg: s };
  };

  SC.boat = c => {
    const { lt } = c, k = ease(clamp(lt / 3));
    let s = sky('gSkyNight', 400) + seaBand(400, 960, lt);
    s += person({ who: 'ben', x: 130, y: 600, s: 1.3, face: 'worried' }) + person({ who: 'mia', x: 190, y: 600, s: 1.3, face: 'worried' });
    s += waterLayer(585, lt, { amp: 2 });
    const bx = lerp(700, 400, k);
    s += P(`M ${bx - 50} 455 L ${bx - 120} 380 L ${bx - 70} 300 L ${bx + 30} 305 L ${bx + 30} 380 Z`, 'url(#gBeam)', 'opacity="0"');
    s += G(`translate(${f1(bx)},520)`, P('M -110 0 L 120 0 L 100 40 L -90 40 Z', COL.rescue) + R(-40, -50, 90, 50, '#e9e9e9', 6) + R(-30, -40, 30, 18, '#2a4f5a', 3) + R(10, -40, 30, 18, '#2a4f5a', 3) + R(-4, -80, 6, 30, '#ddd') + R(-110, 8, 230, 5, '#fff'));
    const ang = lerp(25, -5, k) + Math.sin(lt * 1.5) * 3;
    s += G(`translate(${f1(bx - 40)},470) rotate(${f1(ang)})`, P('M 0 0 L -380 -70 L -380 120 Z', 'url(#gBeam)', 'opacity=".6" transform="rotate(0)"'), '');
    s += C(bx - 40, 470, 10, '#fff', 'filter="url(#glow)"');
    s += fog(lt, 1.2, 150, 900);
    return { svg: s };
  };

  SC.boat_deck = c => {
    const { lt } = c;
    let s = sky('gSkyNight', 960) + fog(lt, 1, 100, 700);
    s += R(0, 560, W, 400, '#2a2f33') + R(0, 560, W, 8, COL.rescue);
    s += person({ who: 'rescuer', x: 150, y: 600, s: 2.1, pose: 'stand', face: 'smile' });
    s += person({ who: 'ben', x: 320, y: 600, s: 1.9, pose: 'sit', blanket: 'foil' }) + person({ who: 'mia', x: 410, y: 600, s: 1.9, pose: 'sit', blanket: 'foil', face: 'worried' });
    s += L('M 0 470 L 540 470', '#c9c9c9', 4) + L('M 30 470 L 30 565 M 260 470 L 260 565 M 500 470 L 500 565', '#c9c9c9', 4);
    return { svg: s };
  };

  SC.phone_off = c => {
    const { lt } = c;
    let ui = R(-72, -150, 144, 300, '#0b1114');
    ui += TX(0, -100, 'TASCHENLAMPE', 9, 'rgba(255,255,255,.6)', { mono: 1, w: 500, ls: 2 });
    ui += R(-26, -80, 52, 96, 'rgba(255,255,255,.08)', 26) + C(0, 0, 20, 'rgba(255,255,255,.25)');
    ui += TX(0, 50, 'AUS', 22, COL.red, { w: 900 });
    const sec = 4 + Math.floor(lt);
    ui += TX(0, 80, `SEIT 27:${String(sec).padStart(2, '0')} MIN`, 9, 'rgba(255,255,255,.75)', { mono: 1, w: 700 });
    let s = bg() + phone(270, 390, 1.5, ui);
    return { svg: s };
  };

  SC.lantern_far = c => {
    const { lt, sp } = c;
    let s = sky('gSkyNight', 420) + seaBand(420, 960, lt) + R(0, 420, W, 540, 'rgba(0,6,10,.45)');
    const out = sp.goOut ? clamp(1 - (lt - (c.wt('aus.') ?? 0.5)) / .6) : 1;
    s += fog(lt, 1.0, 200, 800);
    s += lanternBoy(300, 480, .5, lt, { op: .22 * out + .03, lop: out, swing: 14, lit: out, glowR: 130 });
    // Reling im Vordergrund
    s += R(0, 760, W, 200, '#1d2226') + L('M 0 700 L 540 700', '#9aa', 5) + L('M 40 700 L 40 770 M 200 700 L 200 770 M 360 700 L 360 770 M 520 700 L 520 770', '#9aa', 5);
    return { svg: s };
  };
})();
