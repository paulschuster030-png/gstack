// Teil 5 — Gewitter / Finale
(function () {
  const stormy = (t, hy = 400) => sky('gSkyNight', hy) + seaBand(hy, hy + 8, t, .6) + mudflat(hy + 6, t) + R(0, 0, W, H, 'rgba(0,4,8,.25)');
  const flash = (t, every = 3.7, seed = 0) => { const ph = (t + seed) % every; return ph < .1 ? 1 - ph / .1 : (ph > .16 && ph < .24 ? .5 : 0); };
  const staffL = (x1, y1, x2, y2) => L(`M ${x1} ${y1} L ${x2} ${y2}`, '#8a6a43', 6);
  const flags = (x, y, s = 1) => { let g = ''; [[-50, 0], [50, 0], [-40, 26], [40, 26]].forEach(([dx, dy]) => { g += L(`M ${x + dx * s} ${y + dy * s} l 0 ${-30 * s}`, '#ddd', 2) + P(`M ${x + dx * s} ${y + dy * s - 30 * s} l ${14 * s} ${5 * s} l ${-14 * s} ${5 * s} Z`, COL.red); }); return g + L(`M ${x - 50 * s} ${y} L ${x + 50 * s} ${y} L ${x + 40 * s} ${y + 26 * s} L ${x - 40 * s} ${y + 26 * s} Z`, 'rgba(255,255,255,.5)', 1.5, 'stroke-dasharray="4 4"'); };
  const crouchers = (sc = 1, spread = 1) => person({ who: 'hinnerk', x: 270 - 190 * spread, y: 640, s: 1.2 * sc, pose: 'crouch', face: 'worried' }) + person({ who: 'arch', x: 270 - 60 * spread, y: 650, s: 1.15 * sc, pose: 'crouch', face: 'worried' }) + person({ who: 'mia', x: 270 + 70 * spread, y: 645, s: 1.2 * sc, pose: 'crouch', face: 'worried' }) + person({ who: 'ben', x: 270 + 190 * spread, y: 650, s: 1.2 * sc, pose: 'crouch', face: 'scared' });

  SC.storm_hook = c => {
    const { lt, t } = c;
    let s = stormy(lt);
    const fl = flash(t, 3.3, 3.2);
    if (fl > 0) s += bolt(400, 0, 400, Math.floor(t / 3.3) + 1, 3);
    s += crouchers(1, 1) + rain(t, 70, .4, 10);
    if (fl > 0) s += R(0, 0, W, H, `rgba(220,240,255,${f1(fl * .4 * 100) / 100})`);
    return { svg: s };
  };
  SC.dig_site = c => {
    const { lt } = c;
    let s = sky('gSky', 400) + seaBand(400, 408, lt, .6) + mudflat(406, lt) + flags(300, 640, 1.6);
    s += person({ who: 'hinnerk', x: 110, y: 640, s: 1.6 }) + staffL(160, 500, 175, 650);
    s += person({ who: 'arch', x: 300, y: 650, s: 1.55, pose: 'crouch', arms: [[25, 40], [60, 60]] }) + R(330, 560, 30, 40, '#e8e1d5', 3);
    s += person({ who: 'mia', x: 440, y: 630, s: 1.45, face: 'smile', lookX: -3 }) + person({ who: 'ben', x: 495, y: 630, s: 1.45, lookX: -3 });
    return { svg: s, anchors: { tagArch: [300, 460] } };
  };
  SC.bell_iron = c => {
    const { lt } = c;
    let s = bg();
    s += bell(270, 360, 4, {});
    const k = clamp((lt - (c.wt('rostet') ?? 3)) / 2.2);
    // Eisenklöppel, der zerfällt
    s += O(1 - k, L('M 270 300 L 270 430', '#5a4a3e', 8) + C(270, 450, 18, '#6a4a32'));
    for (let i = 0; i < 18; i++) {
      const pp = clamp(k * 1.4 - hash(i) * .4);
      if (pp > 0) s += C(262 + hash(i + 3) * 16 + (hash(i + 9) - .5) * 40 * pp, 440 + pp * 140, 2 + hash(i) * 2, `rgba(150,85,45,${f1((1 - pp) * 100) / 100})`);
    }
    return { svg: s, anchors: { iron: [270, 540], bronze: [270, 210] } };
  };
  SC.storm_come = c => {
    const { lt, t } = c, k = ease(clamp(lt / c.sdur));
    let s = sky('gSky', 400) + seaBand(400, 408, lt, .6) + mudflat(406, lt) + flags(330, 600, 1.1);
    const cx = lerp(-200, 220, k);
    let d = `M -100 0 L ${f1(cx)} 0`;
    for (let y = 0; y <= 470; y += 30) d += ` L ${f1(cx + Math.sin(y * .05 + lt) * 20 + (y > 380 ? -(y - 380) * 1.2 : 0))} ${y}`;
    d += ` L -100 470 Z`;
    s += P(d, 'rgba(8,12,16,.92)');
    const fl = flash(t, 2.6, 1);
    if (fl > 0) s += O(fl, bolt(cx - 120, 120, 420, Math.floor(t / 2.6) + 4, 2));
    s += person({ who: 'hinnerk', x: 250, y: 620, s: 1.4, flip: true, lookX: -3, face: 'worried' }) + person({ who: 'arch', x: 320, y: 625, s: 1.35, lookX: -3, face: 'worried' });
    s += person({ who: 'mia', x: 390, y: 620, s: 1.35, lookX: -3, face: 'worried' }) + person({ who: 'ben', x: 440, y: 625, s: 1.35, lookX: -3, face: 'scared' });
    return { svg: s };
  };
  SC.count = c => {
    const { lt, sp, t } = c;
    let s = bg();
    const ear = (x, y) => P(`M ${x} ${y - 40} Q ${x + 34} ${y - 40} ${x + 34} ${y - 6} Q ${x + 34} ${y + 14} ${x + 16} ${y + 24} Q ${x + 6} ${y + 32} ${x + 6} ${y + 42} Q ${x - 6} ${y + 46} ${x - 10} ${y + 34}`, 'none', `stroke="#fff" stroke-width="7" stroke-linecap="round"`) + L(`M ${x + 6} ${y - 18} Q ${x + 18} ${y - 14} ${x + 14} ${y}`, '#fff', 5);
    const bolt2 = (x, y, col) => P(`M ${x + 8} ${y - 50} L ${x - 22} ${y + 6} L ${x - 2} ${y + 6} L ${x - 12} ${y + 52} L ${x + 22} ${y - 8} L ${x + 2} ${y - 8} Z`, col);
    if (sp.phase === 0) {
      s += bolt2(170, 330, '#fff2a8') + TX(270, 345, '→', 40, 'rgba(255,255,255,.6)', { w: 900 }) + ear(360, 330);
    } else if (sp.phase === 1) {
      const tb = c.wt('Blitz.') ?? .1, td = c.wt('Donner.') ?? 2;
      const fl = clamp(1 - (lt - tb) / .3);
      const n = clamp(Math.floor((lt - tb) / Math.max(.2, (td - tb) / 9)) + 1, 1, 9);
      s += bolt2(130, 250, '#fff2a8') + ear(390, 250);
      s += TX(270, 470, String(lt >= tb ? n : 0), 110, COL.orange, { w: 900 }) + TX(270, 500, 'SEKUNDEN', 11, 'rgba(255,255,255,.6)', { mono: 1, w: 500, ls: 3 });
      if (lt >= tb && fl > 0) s += R(0, 0, W, H, `rgba(255,255,255,${f1(fl * .5 * 100) / 100})`);
    } else {
      s += TX(270, 300, '9 S ÷ 3', 46, '#fff', { w: 900 }) + TX(270, 380, '= 3 KM', 56, COL.orange, { w: 900 });
      s += L('M 90 470 L 450 470', 'rgba(255,255,255,.3)', 3, 'stroke-dasharray="6 6"') + C(90, 470, 7, COL.mia) + bolt2(460, 450, '#fff2a8');
      const k = clamp((lt - (c.wt('Reichweite.') ?? 3)) / .4);
      s += O(k, C(270, 470, 200, 'url(#gRed)', 'opacity=".5"'));
    }
    return { svg: s };
  };
  SC.ground_current = c => {
    const { lt, sp, t } = c;
    let s = sky('gSkyNight', 520) + R(0, 520, W, 440, '#2b2a22') + L('M 0 520 L 540 520', 'rgba(160,190,195,.4)', 3);
    for (let i = 0; i < 6; i++) s += L(`M 0 ${560 + i * 60} L ${W} ${560 + i * 60}`, 'rgba(255,255,255,.03)', 3);
    const sx = 70;
    const st = sp.strike ? ((lt - c.beatOffset) % 2.6) : -1;
    if (sp.strike && st >= 0 && st < .25) s += bolt(sx, 0, 520, Math.floor((lt - c.beatOffset) / 2.6) + 2, 3);
    if (sp.strike && st >= 0) for (let i = 0; i < 4; i++) {
      const p = clamp((st - i * .12) / 1.4);
      if (p > 0 && p < 1) s += `<path d="M ${f1(sx - 30 - p * 520)} 520 A ${f1(30 + p * 520)} ${f1(18 + p * 300)} 0 0 0 ${f1(sx + 30 + p * 520)} 520" fill="none" stroke="rgba(255,226,120,${f1((1 - p) * .85 * 100) / 100})" stroke-width="3"/>`;
    }
    if (sp.lying) {
      s += person({ who: 'mia', x: 220, y: 512, s: 1.25, rot: 90, face: 'scared' });
      if (sp.strike && st > .2 && st < 1.2) s += arrow(230, 505, 360, 505, COL.red, 4) + R(200, 470, 190, 50, 'rgba(255,77,79,.15)', 10);
    }
    if (sp.crouch) {
      s += person({ who: 'mia', x: 350, y: 520, s: 1.6, pose: 'crouch', face: 'worried' });
      s += E(350, 520, 30, 6, 'rgba(51,209,122,.5)');
    }
    return { svg: s };
  };
  SC.spread = c => {
    const { lt, sp } = c;
    let s = R(0, 0, W, H, '#2b2a22');
    for (let i = 0; i < 16; i++) s += L(`M 0 ${i * 64} Q 270 ${i * 64 + 14} ${W} ${i * 64}`, 'rgba(255,255,255,.03)', 3);
    s += rain(lt, 40, .25);
    const k = sp.phase === 0 ? ease(clamp((lt - c.beatOffset) / 1.6)) : 1;
    const pos = [[270, 300, '#2f4f6f'], [270, 360, COL.arch], [300, 330, COL.mia], [240, 330, COL.ben]];
    const tgt = [[110, 220], [430, 220], [120, 480], [420, 470]];
    const P2 = pos.map((p, i) => [lerp(p[0], tgt[i][0], k), lerp(p[1], tgt[i][1], k), p[2]]);
    if (k > .6) for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if ((i + j) % 2 === 1 || (i === 0 && j === 3)) s += O((k - .6) / .4, L(`M ${f1(P2[i][0])} ${f1(P2[i][1])} L ${f1(P2[j][0])} ${f1(P2[j][1])}`, 'rgba(51,209,122,.6)', 2, 'stroke-dasharray="5 6"'));
    P2.forEach(([x, y, col]) => { s += C(x, y, 26, 'rgba(0,0,0,.35)') + C(x, y, 20, col) + C(x, y - 4, 10, COL.skin); });
    if (sp.phase === 1) {
      const kk = clamp((lt - (c.wt('Peilstock') ?? 2)) / .6);
      s += O(kk, staffL(300, 700, 480, 760) + TX(390, 800, 'STOCK: FLACH, WEIT WEG', 10, 'rgba(255,255,255,.75)', { mono: 1, w: 700 }));
    }
    s += TX(270, 120, 'VON OBEN', 11, 'rgba(214,226,230,.6)', { mono: 1, w: 500, ls: 4 });
    return { svg: s };
  };
  SC.strike = c => {
    const { lt, t } = c;
    let s = stormy(lt);
    s += flags(420, 470, .6);
    const ts = c.wt('schlägt') ?? .2, p = lt - ts;
    if (p >= 0 && p < .35) s += bolt(420, 0, 470, 9, 4);
    if (p >= 0) s += C(420, 470, 60, 'url(#gWarm)', `opacity="${f1(clamp(1 - p / 3) * 100) / 100}"`);
    s += O(.9, person({ who: 'hinnerk', x: 80, y: 650, s: 1.1, pose: 'crouch' }) + person({ who: 'arch', x: 200, y: 680, s: 1.05, pose: 'crouch' }) + person({ who: 'mia', x: 310, y: 700, s: 1.1, pose: 'crouch', face: 'scared' }) + person({ who: 'ben', x: 160, y: 760, s: 1.1, pose: 'crouch', face: 'scared' }));
    s += rain(t, 60, .35);
    if (p >= 0 && p < .4) s += R(0, 0, W, H, `rgba(240,250,255,${f1((1 - p / .4) * .8 * 100) / 100})`);
    return { svg: s };
  };
  SC.wait30 = c => {
    const { lt, t } = c;
    let s = stormy(lt) + R(0, 0, W, H, 'rgba(0,0,0,.35)');
    const k = clamp(lt / Math.max(1, c.sdur - .4));
    const secs = Math.round(30 * 60 * (1 - k));
    s += ringTimer(270, 300, 110, 1 - k, COL.orange, `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, 'NACH DEM LETZTEN DONNER');
    s += O(.7, crouchers(.8, .9)) + rain(t, 30 * (1 - k) + 5, .3);
    return { svg: s };
  };
  SC.evening = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, '#1e2426');
    s += R(320, 120, 170, 170, '#132328', 6) + E(405, 230, 80, 26, `rgba(${COL.fog},.25)`, 'filter="url(#b10)"') + R(320, 120, 170, 170, 'none', 6, 'stroke="#2a1f17" stroke-width="10"');
    s += C(110, 300, 160, 'url(#gWarm)', 'opacity=".45"') + L('M 110 180 L 110 300', '#999', 3) + P('M 80 180 L 140 180 L 128 150 L 92 150 Z', '#e8d9b0');
    s += R(60, 480, 420, 150, '#4a3a5a', 30) + R(60, 430, 420, 80, '#5a4a6a', 30);
    s += person({ who: 'mia', x: 270, y: 640, s: 1.8, pose: 'sit', arms: [[20, 100], [20, 100]], face: 'neutral', lookX: 0 });
    s += C(270, 520, 60, 'url(#gWhite)', 'opacity=".35"') + R(250, 560, 40, 56, '#0f1417', 6) + R(254, 564, 32, 48, 'rgba(160,200,215,.7)', 4);
    s += R(0, 640, W, 320, '#151a1c');
    return { svg: s };
  };
  SC.photo_zoom = c => {
    const { lt, sp } = c;
    let s = bg();
    const total = c.sdur;
    const k = ease(clamp(lt / Math.max(1, total * .55)));
    const z = sp.phase === 1 ? lerp(5.2, 6.2, ease(clamp((lt - c.beatOffset) / c.dur))) : lerp(1, 5.2, k);
    const fx = 42, fy = -40;
    const inner = G(`translate(${f1(-fx * (z - 1))},${f1(-fy * (z - 1))}) scale(${f1(z * 1000) / 1000})`, selfieImage(lt, { boyOp: .85 }));
    s += phone(270, 390, 1.5, inner);
    s += TX(270, 200 - 0, `${Math.round(z * 100)} %`, 10, 'rgba(255,255,255,.6)', { mono: 1, w: 700 });
    if (sp.phase === 1) {
      const kk = clamp((lt - c.beatOffset - .4) / .6);
      s += O(kk * .9, arrow(330, 520, 330, 450, COL.teal, 3) + TX(330, 540, 'MEER', 9, COL.teal, { mono: 1, w: 700, ls: 2 }));
    }
    return { svg: s };
  };
  SC.bell_table = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, '#1c1916') + C(270, 300, 260, 'url(#gWarm)', 'opacity=".3"');
    s += R(0, 520, W, 440, '#4b3421') + L('M 0 520 L 540 520', 'rgba(255,220,170,.2)', 3);
    for (let i = 0; i < 6; i++) s += L(`M 0 ${560 + i * 60} L ${W} ${566 + i * 60}`, 'rgba(0,0,0,.15)', 2);
    s += E(270, 535, 130, 14, 'rgba(0,0,0,.4)') + bell(270, 470, 2.6, { rot: 75 });
    return { svg: s };
  };
  SC.final_fog = c => {
    const { lt, sp, t } = c;
    let s = sky('gSkyNight', 420) + seaBand(420, 428, lt, .5) + mudflat(426, lt) + R(0, 420, W, 540, 'rgba(0,6,10,.4)');
    s += halligFar(90, 426, .9, { night: true, lit: true });
    s += fog(t, 1.1, 200, 860);
    const T0 = (window.TL.beats.find(b => b.sc === 'final_fog') || c.b).t0;
    const g = t - T0;
    const x = 470 - g * 22, y = 470 + Math.sin(g * 1.4) * 4;
    const fade = sp.land ? clamp(1 - (c.lt - c.beatOffset - .6) / 1.4) : 1;
    s += lanternBoy(x, y, .42, t, { op: .12 * fade, lop: fade, swing: 10, glowR: 120, flip: true });
    s += R(0, 0, W, H, `rgba(0,0,0,${f1((sp.land ? clamp((c.lt - c.beatOffset - 1) / 1.6) * .7 : 0) * 100) / 100})`);
    return { svg: s };
  };
})();
