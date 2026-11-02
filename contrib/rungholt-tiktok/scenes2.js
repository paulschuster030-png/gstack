// Teil 2 — Landunter
(function () {
  const KNOCK_OFFS = [0, .5, 1.0];
  const knocks = c => { const r = []; for (const t0 of SFXT('knock3')) for (const k of KNOCK_OFFS) r.push(t0 + k); return r; };
  const knockShake = c => { let x = 0; for (const k of knocks(c)) { const p = (c.t - k) / .18; if (p >= 0 && p < 1) x += Math.sin(p * 30) * 3 * (1 - p); } return x; };
  const flash = (t, every = 4.3, seed = 1) => { const ph = (t + seed) % every; return ph < .12 ? 1 - ph / .12 : (ph > .2 && ph < .28 ? .6 : 0); };
  const room = (o = {}) => R(0, 0, W, H, 'url(#gRoom)') + (() => { let s = ''; for (let i = 0; i < 12; i++) s += L(`M ${i * 48} 0 L ${i * 48} ${o.floor || 700}`, 'rgba(255,255,255,.025)', 2); return s; })() + R(0, o.floor || 700, W, H, '#1a1410') + (() => { let s = ''; for (let i = 0; i < 8; i++) s += L(`M 0 ${(o.floor || 700) + 12 + i * 34} L ${W} ${(o.floor || 700) + 12 + i * 34}`, 'rgba(255,255,255,.04)', 2); return s; })();
  const door = (x, y, w, h, o = {}) => {
    let g = R(x - 10, y - 10, w + 20, h + 10, '#2a1f17', 4) + R(x, y, w, h, o.col || '#4a3324', 3);
    g += R(x + 14, y + 16, w - 28, 70, o.night ? '#0d1a20' : '#7fb6c6', 4);
    if (o.night) g += L(`M ${x + 22} ${y + 22} l -6 20 M ${x + 44} ${y + 30} l -6 22 M ${x + 70} ${y + 18} l -6 20 M ${x + 96} ${y + 26} l -6 22`, 'rgba(160,210,225,.45)', 1.5);
    g += R(x + 14, y + 104, (w - 34) / 2, h - 130, 'rgba(0,0,0,.18)', 3) + R(x + w / 2 + 3, y + 104, (w - 34) / 2, h - 130, 'rgba(0,0,0,.18)', 3);
    g += C(x + w - 18, y + h / 2 + 10, 5, '#c9a44a');
    return g;
  };

  SC.door_night = c => {
    const { sp, t } = c;
    const sh = knockShake(c);
    let s = room();
    s += G(`translate(${f1(sh)},0)`, door(180, 250, 180, 450, { night: true }));
    s += knockRings(270, 420, t, knocks(c), 'rgba(255,255,255,.8)');
    s += R(0, 0, W, H, 'rgba(0,5,10,.35)');
    if (sp.oma) {
      s += C(120, 520, 140, 'url(#gWarm)', 'opacity=".35"');
      s += person({ who: 'oma', x: 110, y: 700, s: 1.7, face: 'worried', pose: 'reach', arms: [[8, 0], [30, 100]] });
      s += person({ who: 'ben', x: 440, y: 700, s: 1.5, face: 'scared' }) + person({ who: 'mia', x: 490, y: 700, s: 1.5, face: 'worried', lookX: -3 });
    }
    return { svg: s };
  };

  const stormSea = (t, level = 560) => sky('gSkyNight', level) + seaBand(level, 960, t) + waterLayer(level, t, { amp: 9, col: 'rgba(30,72,84,.9)' });
  SC.hallig_storm = c => {
    const { lt, t } = c;
    let s = sky('gSkyNight', 960);
    const fl = flash(t);
    if (fl > 0) s += bolt(110, 0, 360, Math.floor(t / 4.3) + 3, 2.5);
    s += halligFar(500, 548, .5, { night: true, lit: true });
    s += warft(270, 600, 360, 90, '#24362b') + house(270, 512, 1.25, { night: true, lit: true });
    s += waterLayer(565, lt, { amp: 10, col: 'rgba(28,66,78,.95)' });
    s += rain(t, 90, .45, 14);
    if (fl > 0) s += R(0, 0, W, H, `rgba(220,240,255,${f1(fl * .35 * 100) / 100})`);
    return { svg: s, anchors: { warft: [140, 540] } };
  };

  SC.bedroom = c => {
    const { t } = c;
    const k = knocks(c), awake = k.length && t > k[0];
    let s = room({ floor: 720 });
    // Fenster mit Sturm
    s += R(330, 170, 150, 170, '#0d1a20', 4) + G('translate(0,0)', rain(t, 18, .5).replace('<path', '<path clip-path="url(#wclip)"'));
    s += `<clipPath id="wclip"><rect x="330" y="170" width="150" height="170"/></clipPath>`;
    s += L('M 405 170 L 405 340 M 330 255 L 480 255', '#3b2a1d', 6) + R(322, 162, 166, 186, 'none', 4, 'stroke="#3b2a1d" stroke-width="8"');
    // Sessel mit Oma
    s += R(40, 470, 150, 230, '#4a3a5a', 30) + person({ who: 'oma', x: 115, y: 690, s: 1.45, pose: 'sit', eyesClosed: !awake, face: awake ? 'worried' : 'neutral' }) + R(46, 600, 140, 30, '#4a3a5a', 12);
    // Bett mit Kindern
    s += R(250, 520, 280, 190, '#5b3d27', 10) + R(260, 500, 260, 60, '#e8e1d5', 20);
    s += C(320, 520, 22, COL.skin) + P('M 298 516 Q 300 494 320 494 Q 342 494 342 516 Q 330 504 320 506 Q 308 504 298 516 Z', '#5a3825');
    s += C(410, 522, 19, COL.skin) + P('M 391 518 Q 392 500 410 500 Q 428 500 429 518 Z', COL.benHat);
    const eye = (x, y, open) => open ? C(x - 7, y, 2.2, '#1d1d1d') + C(x + 7, y, 2.2, '#1d1d1d') : L(`M ${x - 10} ${y} l 6 0 M ${x + 4} ${y} l 6 0`, '#1d1d1d', 1.6);
    s += eye(320, 522, awake) + eye(410, 524, false);
    s += P('M 250 540 Q 390 520 530 540 L 530 700 L 250 700 Z', '#3a6e8f') + L('M 250 600 L 530 600', 'rgba(255,255,255,.12)', 3);
    s += knockRings(20, 420, t, k, 'rgba(255,255,255,.7)');
    s += R(0, 0, W, H, 'rgba(0,5,10,.3)');
    return { svg: s, anchors: { tagOma: [115, 470] } };
  };

  SC.wind_door = c => {
    const { lt } = c;
    let s = bg();
    // Tür rechts (Profil)
    s += R(400, 200, 26, 380, '#5a3d27', 3) + R(426, 200, 70, 380, '#1c2a2e');
    for (let i = 0; i < 7; i++) {
      const y = 230 + i * 50, p = ((lt * .9 + i * .17) % 1);
      s += arrow(60 + p * 200, y, 160 + p * 230, y, `rgba(92,200,200,${f1((1 - p) * 90) / 100 + .1})`, 5);
    }
    // Tacho
    const k = ease(clamp(lt / 1.6)), a = lerp(-120, 75, k) * Math.PI / 180;
    s += G('translate(150,170)', `<path d="M -70 0 A 70 70 0 0 1 70 0" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="10"/>` +
      `<path d="M -70 0 A 70 70 0 0 1 ${f1(Math.sin(lerp(-90, 75, k) * Math.PI / 180) * 70)} ${f1(-Math.cos(lerp(-90, 75, k) * Math.PI / 180) * 70)}" fill="none" stroke="${COL.teal}" stroke-width="10" stroke-linecap="round"/>` +
      L(`M 0 0 L ${f1(Math.sin(a) * 56)} ${f1(-Math.cos(a) * 56)}`, '#fff', 4) + C(0, 0, 7, '#fff'));
    // Gewicht
    const wk = clamp((lt - (c.wt('hundert') ?? 3)) / .35);
    if (wk > 0) s += G(`translate(330,${f1(lerp(150, 380, easeOut(wk)))})`, P('M -50 -40 L 50 -40 L 62 50 L -62 50 Z', '#2b2f33') + R(-14, -56, 28, 18, 'none', 8, 'stroke="#2b2f33" stroke-width="7"') + TX(0, 20, '100 KG', 20, '#fff', { w: 900 }));
    return { svg: s, anchors: { gauge: [150, 205] } };
  };

  SC.door_burst = c => {
    const { lt, t } = c, k = easeOut(clamp(lt / .5));
    let s = room() + R(170, 240, 200, 470, '#0d1a20');
    s += rain(t, 40, .5, 20).replace('<path', '<path clip-path="url(#dclip)"') + `<clipPath id="dclip"><rect x="170" y="240" width="200" height="470"/></clipPath>`;
    const dw = lerp(180, 40, k);
    s += P(`M 180 250 L ${f1(180 + dw)} ${f1(250 + (180 - dw) * .25)} L ${f1(180 + dw)} ${f1(700 - (180 - dw) * .25)} L 180 700 Z`, '#4a3324');
    for (let i = 0; i < 6; i++) { const p = ((lt * 1.4 + i / 6) % 1); s += arrow(270, 300 + i * 60, 270 + p * 260, 320 + i * 60 + p * 40, `rgba(92,200,200,${f1((1 - p) * .8 * 100) / 100})`, 4); }
    s += waterLayer(lerp(720, 640, k), lt, { amp: 6 });
    s += R(0, 0, W, H, 'rgba(255,40,40,.08)');
    return { svg: s };
  };

  SC.door_seep = c => {
    const { lt } = c, k = ease(clamp(lt / c.sdur));
    let s = R(0, 0, W, 560, '#4a3324') + R(0, 0, W, 560, 'rgba(0,0,0,.25)');
    s += R(60, 40, 420, 520, 'rgba(0,0,0,.18)', 6) + C(440, 300, 8, '#c9a44a');
    s += R(0, 560, W, 18, '#2a1f17') + R(0, 578, W, 400, '#2a1e15');
    for (let i = 0; i < 9; i++) s += L(`M 0 ${600 + i * 42} L ${W} ${600 + i * 42}`, 'rgba(255,255,255,.05)', 2);
    // Wasser kriecht unter der Tür durch
    const len = lerp(15, 240, k);
    let d = `M 0 578 L ${W} 578`;
    for (let x = W; x >= 0; x -= 20) d += ` L ${x} ${f1(578 + len * (.55 + .45 * Math.sin(x / W * Math.PI)) + Math.sin(x * .07 + lt * 2) * 6 * k)}`;
    s += P(d + ' Z', 'rgba(60,130,150,.55)');
    for (let i = 0; i < 5; i++) { const p = ((lt * .7 + i / 5) % 1); s += E(80 + i * 95, 590 + p * len * .7, 30 * p + 4, 6 * p + 1, 'none', `stroke="rgba(170,225,235,${f1((1 - p) * .5 * 100) / 100})" stroke-width="1.5"`); }
    s += L(`M 0 576 L ${W} 576`, 'rgba(170,225,235,.6)', 2);
    return { svg: s };
  };

  SC.fusebox = c => {
    const { lt } = c;
    let s = room({ floor: 900 });
    s += R(130, 120, 280, 360, '#c9cdd0', 10) + R(146, 140, 248, 320, '#e3e6e8', 6);
    const t0 = c.wt('Sicherungen') ?? .4;
    for (let i = 0; i < 8; i++) {
      const x = 170 + (i % 4) * 56, y = 190 + Math.floor(i / 4) * 140;
      const down = lt > t0 + i * .16;
      s += R(x, y, 40, 100, '#f4f5f6', 4, 'stroke="#b8bec2" stroke-width="2"');
      s += R(x + 12, down ? y + 55 : y + 15, 16, 30, down ? COL.red : COL.green, 3);
      s += TX(x + 20, y + 95, down ? '0' : 'I', 10, '#555', { w: 800 });
    }
    // Steckdose + steigendes Wasser
    s += R(220, 640, 100, 100, '#e3e6e8', 12) + C(252, 690, 7, '#555') + C(288, 690, 7, '#555');
    const wl = lerp(900, 790, ease(lt / c.sdur));
    s += waterLayer(wl, lt, { amp: 3 });
    const allDown = lt > t0 + 8 * .16;
    s += C(270, 690, 80, allDown ? 'url(#gGreen)' : 'url(#gRed)', 'opacity=".35"');
    return { svg: s };
  };

  SC.house_section = c => {
    const { lt, sp, t } = c;
    let s = sky('gSkyNight', 960) + rain(t, 60, .3);
    const fk = sp.flood ? ease(clamp(lt / 3)) : 0;
    // Warft-Querschnitt
    s += P('M -20 760 Q 120 560 270 560 Q 420 560 560 760 Z', '#3b3324') + P('M -20 760 Q 120 560 270 560 Q 420 560 560 760 L 560 960 L -20 960 Z', '#3b3324');
    for (let i = 0; i < 6; i++) s += L(`M -20 ${640 + i * 50} Q 270 ${600 + i * 50} 560 ${640 + i * 50}`, 'rgba(0,0,0,.15)', 2);
    // Haus (aufgeschnitten)
    const wall = '#3c4448';
    s += R(120, 360, 300, 200, wall, 2) + P('M 100 362 L 270 220 L 440 362 Z', '#3a3024');
    s += R(130, 460, 135, 92, '#1d2629') + R(275, 460, 135, 92, '#1d2629') + R(130, 372, 280, 80, '#1d2629');
    // Schutzraum + Pfeiler
    const hl = sp.highlight ? 1 : 0;
    const pc = hl ? COL.teal : '#5b6468';
    s += R(208, 380, 14, 330, pc, 2) + R(318, 380, 14, 330, pc, 2);
    s += R(200, 372, 140, 80, hl ? 'rgba(246,168,35,.25)' : '#2a3236', 4, hl ? `stroke="${COL.orange}" stroke-width="4"` : '');
    if (hl) s += C(270, 412, 90, 'url(#gWarm)', 'opacity=".35"');
    // Hochwasser
    const wl = lerp(980, 520, fk);
    if (fk > 0) {
      s += waterLayer(wl, lt, { amp: 6, col: 'rgba(30,80,95,.85)' });
      s += R(200, 372, 140, 80, 'none', 4, `stroke="${COL.orange}" stroke-width="4"`);
      s += person({ who: 'oma', x: 238, y: 448, s: .45, face: 'worried' }) + person({ who: 'mia', x: 268, y: 448, s: .45 }) + person({ who: 'ben', x: 292, y: 448, s: .45 });
    }
    return { svg: s, anchors: { room: [270, 350], pillars: [400, 640] } };
  };

  SC.shelter = c => {
    const { lt, t } = c;
    let s = R(0, 0, W, H, '#2c3539') + R(0, 0, W, H, 'rgba(0,0,0,.3)');
    for (let i = 0; i < 6; i++) s += L(`M 0 ${120 + i * 110} L ${W} ${120 + i * 110}`, 'rgba(255,255,255,.04)', 2);
    s += R(190, 140, 160, 110, '#0d1a20', 6) + rain(t, 14, .5).replace('<path', '<path clip-path="url(#sclip)"') + `<clipPath id="sclip"><rect x="190" y="140" width="160" height="110"/></clipPath>` + R(184, 134, 172, 122, 'none', 6, 'stroke="#4a5458" stroke-width="10"');
    s += C(270, 520, 230, 'url(#gWarm)', 'opacity=".35"');
    s += person({ who: 'oma', x: 130, y: 640, s: 1.55, pose: 'sit', blanket: 1, face: 'worried' });
    s += person({ who: 'mia', x: 270, y: 640, s: 1.55, pose: 'sit', blanket: 1 });
    s += person({ who: 'ben', x: 390, y: 640, s: 1.55, pose: 'sit', blanket: 1, eyesClosed: true });
    // Radio
    s += R(440, 600, 80, 50, '#6b4a2f', 6) + C(462, 625, 12, '#2b2f33') + R(484, 612, 26, 6, '#c9a44a', 2) + soundWaves(520, 595, lt, 3, 'rgba(246,168,35,.6)', 1);
    // Taschenlampe
    s += R(40, 630, 50, 16, '#d0d6d8', 5) + C(92, 638, 24, 'url(#gWhite)');
    s += R(0, 650, W, 310, '#232b2e');
    return { svg: s };
  };

  SC.hallig_dawn = c => {
    const { lt } = c;
    let s = sky('gSkyDawn', 520) + C(400, 470, 140, 'url(#gWarm)', 'opacity=".5"');
    s += R(0, 520, W, 440, '#2c3e33');
    for (let i = 0; i < 8; i++) s += E(hash(i) * W, 560 + hash(i + 4) * 380, 50 + hash(i + 2) * 60, 6 + hash(i + 3) * 8, 'rgba(160,190,195,.25)');
    s += warft(270, 560, 380, 80, '#304735') + house(270, 486, 1.15, {});
    s += halligFar(480, 522, .45);
    for (let i = 0; i < 3; i++) { const x = 100 + i * 50 + lt * 20, y = 300 + i * 18 + Math.sin(lt * 3 + i) * 4; s += L(`M ${f1(x - 9)} ${f1(y - 4)} Q ${f1(x - 4)} ${f1(y - 8)} ${f1(x)} ${f1(y)} Q ${f1(x + 4)} ${f1(y - 8)} ${f1(x + 9)} ${f1(y - 4)}`, '#1d2a2e', 2); }
    return { svg: s };
  };

  SC.kitchen = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, '#33464c') + R(300, 150, 180, 170, '#a9c0c4', 6) + R(300, 150, 180, 170, 'none', 6, 'stroke="#2a1f17" stroke-width="10"') + L('M 390 150 L 390 320', '#2a1f17', 6);
    s += person({ who: 'oma', x: 150, y: 640, s: 1.7, pose: 'sit', face: 'worried' }) + person({ who: 'mia', x: 390, y: 640, s: 1.6, pose: 'sit', face: 'worried', lookX: -3 });
    s += R(40, 560, 460, 26, '#6b4a2f', 4) + R(60, 586, 20, 300, '#4b3421') + R(460, 586, 20, 300, '#4b3421');
    [[190, 540], [350, 540]].forEach(([x, y], i) => { s += R(x - 14, y - 20, 28, 26, '#e8e1d5', 4) + L(`M ${x - 4} ${y - 26} q -6 -12 0 -22 q 6 -10 0 -20`, 'rgba(255,255,255,.35)', 2, `transform="translate(${f1(Math.sin(lt * 2 + i) * 2)},0)"`); });
    return { svg: s };
  };

  SC.window_oma = c => {
    const { lt } = c;
    let s = sky('gSkyDawn', 470) + R(0, 470, W, 490, '#2c3e33');
    for (let i = 0; i < 6; i++) s += E(hash(i + 20) * W, 500 + hash(i + 7) * 120, 70, 6, 'rgba(160,190,195,.25)');
    s += halligFar(470, 474, .55);
    s += warft(60, 520, 300, 60, '#304735') + house(80, 470, .9, {});
    const k = clamp((lt - (c.wt('Kilometer') ?? 3)) / .6);
    if (k > 0) s += O(k, L(`M 140 440 L ${f1(lerp(140, 455, ease(k)))} 440`, '#fff', 2, 'stroke-dasharray="5 5"') + C(140, 440, 4, '#fff') + (k > .9 ? C(455, 440, 4, '#fff') : ''));
    s += R(0, 0, W, H, 'rgba(0,0,0,.18)');
    // Fenster mit Oma (Nahaufnahme unten)
    s += R(150, 640, 240, 240, '#cfc6b5') + R(170, 660, 200, 200, '#152328');
    s += person({ who: 'oma', x: 270, y: 920, s: 1.6, face: 'worried' });
    s += R(150, 640, 240, 240, 'none', 0, 'stroke="#3b2a1d" stroke-width="16"') + L('M 270 640 L 270 880', '#3b2a1d', 6) + R(140, 870, 260, 20, '#3b2a1d');
    s += R(0, 880, W, 80, '#cfc6b5');
    return { svg: s };
  };

  SC.door_open = c => {
    const { lt } = c, k = ease(clamp(lt / 1.6));
    let s = room();
    s += R(180, 250, 180, 450, '#fff5dc') + C(270, 470, lerp(60, 320, k), 'url(#gWarm)', `opacity="${f1(k * .9 * 100) / 100}"`);
    const dw = lerp(180, 30, k);
    s += P(`M 180 250 L ${f1(180 + dw)} ${f1(250 + (180 - dw) * .2)} L ${f1(180 + dw)} ${f1(700 - (180 - dw) * .2)} L 180 700 Z`, '#4a3324');
    s += P(`M 180 700 L 360 700 L 470 960 L 70 960 Z`, `rgba(255,230,170,${f1(k * .25 * 100) / 100})`);
    return { svg: s };
  };

  SC.lantern_step = c => {
    const { lt } = c;
    let s = sky('gSkyDawn', 600) + R(0, 600, W, 360, '#2c3e33');
    s += R(60, 100, 420, 520, '#cfc6b5') + R(150, 140, 240, 480, '#4a3324') + R(130, 600, 280, 50, '#8d877c', 4) + R(110, 650, 320, 40, '#77716a', 4);
    s += E(270, 610, 120, 14, 'rgba(0,0,0,.3)');
    s += lantern(270, 405, 5.2, 0, 0);
    for (let i = 0; i < 4; i++) {
      const p = ((lt * .45 + i / 4) % 1);
      s += L(`M ${f1(245 + i * 12)} ${f1(440 - p * 140)} q ${f1(-10 + Math.sin(lt * 2 + i) * 6)} -20 0 -40`, `rgba(255,255,255,${f1((1 - p) * .5 * 100) / 100})`, 4, 'filter="url(#b4)"');
    }
    s += C(270, 540, 70, 'url(#gWarm)', `opacity="${f1((.18 + Math.sin(lt * 3) * .04) * 100) / 100}"`);
    // feuchte Fußabdrücke? Nein — nur Schlick auf der Stufe
    s += E(200, 640, 20, 5, 'rgba(40,35,25,.6)') + E(340, 668, 16, 4, 'rgba(40,35,25,.6)');
    return { svg: s };
  };
})();
