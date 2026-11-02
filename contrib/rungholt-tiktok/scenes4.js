// Teil 4 — Schlick
(function () {
  const day = (t, hy = 400) => sky('gSky', hy) + R(0, hy - 60, W, 60, 'rgba(200,210,200,.06)') + seaBand(hy, hy + 8, t, .7) + mudflat(hy + 6, t);
  // Schlick, der Beine bis zur Höhe d bedeckt (x,y = Füße)
  const mudOver = (x, y, d, w = 70) => P(`M ${x - w} ${y + 4} Q ${x - w * .7} ${y - d - 8} ${x} ${y - d - 6} Q ${x + w * .7} ${y - d - 8} ${x + w} ${y + 4} Q ${x} ${y + 14} ${x - w} ${y + 4} Z`, '#2a2a23') + L(`M ${x - w * .8} ${y - d * .6} Q ${x} ${y - d - 10} ${x + w * .8} ${y - d * .6}`, 'rgba(160,190,195,.25)', 2);
  const staff = (x1, y1, x2, y2) => L(`M ${x1} ${y1} L ${x2} ${y2}`, '#8a6a43', 6) + L(`M ${x1} ${y1} L ${x2} ${y2}`, 'rgba(255,255,255,.15)', 1.5);

  SC.mud_hook = c => {
    const { lt } = c;
    let s = day(lt);
    s += person({ who: 'ben', x: 120, y: 600, s: 1.4, face: 'scared' }) + person({ who: 'mia', x: 420, y: 600, s: 1.45, face: 'worried', pose: 'reach', flip: true });
    const hx = 270, hy = 640;
    s += person({ who: 'hinnerk', x: hx, y: hy, s: 1.9, face: 'worried', arms: [[40, -10], [40, -10]] });
    s += mudOver(hx, hy, 50, 80);
    s += staff(330, 650, 470, 700);
    return { svg: s };
  };
  SC.watt_low = c => {
    const { lt } = c;
    let s = sky('gSky', 330) + C(420, 300, 110, 'url(#gWarm)', 'opacity=".25"') + seaBand(330, 336, lt, .6) + mudflat(334, lt);
    s += halligFar(90, 338, .7);
    for (let i = 0; i < 6; i++) { const p = ((lt * .7 + i / 6) % 1); s += O(1 - p, arrow(560 - p * 300, 180 + i * 28, 500 - p * 300, 180 + i * 28, COL.teal, 3)); }
    s += person({ who: 'hinnerk', x: 230, y: 560, s: 1.1, pose: 'stand' }) + person({ who: 'mia', x: 280, y: 560, s: 1.1 }) + person({ who: 'ben', x: 315, y: 560, s: 1.1 });
    return { svg: s, anchors: { wind: [400, 150] } };
  };
  SC.hinnerk = c => {
    const { lt } = c;
    let s = day(lt);
    const bob = k => Math.abs(Math.sin(lt * 4.5 + k)) * 3;
    s += person({ who: 'ben', x: 110, y: 600 - bob(1), s: 1.6, face: 'neutral' });
    s += person({ who: 'hinnerk', x: 270, y: 610 - bob(0), s: 2, face: 'smile', pose: 'hold' }) + staff(318, 470, 345, 640);
    s += person({ who: 'mia', x: 420, y: 600 - bob(2), s: 1.6, face: 'neutral', lookX: -3 });
    return { svg: s, anchors: { tagHinnerk: [270, 330] } };
  };
  SC.legend = c => {
    const { lt, sp, t } = c;
    let s = R(0, 0, W, H, 'url(#gSepia)');
    for (let i = 0; i < 60; i++) s += L(`M 0 ${i * 16} L ${W} ${i * 16 + 4}`, 'rgba(255,240,200,.025)', 1);
    const sep = '#d9c9a3', dark = '#14150f';
    s += R(0, 560, W, 400, '#2b2a1f');
    // Deich
    s += P('M -20 560 Q 120 520 240 530 L 300 560 Z', '#3a3826');
    // Dorf
    let v = '';
    [[60, 560, .6], [150, 560, .7], [370, 560, .7], [460, 560, .6]].forEach(([x, y, k]) => { v += house(x, y, k, { lit: !sp.flood }); });
    v += R(255, 380, 34, 180, '#5a5240') + P('M 252 382 L 272 320 L 292 382 Z', '#4a4434') + R(266, 410, 12, 18, sp.flood ? '#1a1a14' : COL.warm);
    s += sp.flood ? O(.75, v) : v;
    // Lüchtenjung auf dem Deich
    s += lanternBoy(170, 530, .62, t, { op: .95, lop: 1, swing: 10, glowR: 90 });
    if (!sp.flood) s += soundWaves(205, 470, lt, 3, 'rgba(255,220,150,.7)', 1);
    if (sp.flood) {
      const k = ease(clamp(lt - c.beatOffset));
      s += waterLayer(lerp(700, 500, k), t, { amp: 10, col: 'rgba(25,40,40,.85)' }) + rain(t, 50, .3);
    } else {
      // Leute, die weggehen
      s += O(.8, person({ who: 'hinnerk', x: 410, y: 600, s: .55, sil: true }) + person({ who: 'oma', x: 450, y: 600, s: .55, sil: true }) + person({ who: 'arch', x: 90, y: 610, s: .5, sil: true }));
    }
    s += R(0, 0, W, H, 'rgba(120,100,60,.08)');
    return { svg: s };
  };
  SC.sink = c => {
    const { lt, sp, t } = c;
    let s = day(lt);
    s += person({ who: 'ben', x: 110, y: 600, s: 1.4, face: 'scared' }) + person({ who: 'mia', x: 430, y: 600, s: 1.45, face: 'worried', flip: true });
    const hx = 270, hy = 640;
    const first = !sp.arrows && !sp.wiggle;
    const d = first ? lerp(5, 50, easeOut(clamp(lt / 1.2))) : 50;
    const wig = sp.wiggle ? Math.sin(lt * 6) * 3 : 0;
    s += person({ who: 'hinnerk', x: hx + wig, y: hy, s: 1.9, face: 'worried', arms: [[40, -10], [40, -10]] });
    s += mudOver(hx, hy, d, 80);
    if (sp.arrows) {
      const k = clamp((lt - c.beatOffset - .5) / .4);
      s += O(k, arrow(hx, 600, hx, 480, COL.red, 6) + L(`M ${hx - 26} 520 l 52 52 M ${hx + 26} 520 l -52 52`, COL.red, 7));
    }
    if (sp.wiggle) {
      for (let i = 0; i < 2; i++) {
        const cx = hx + (i ? 36 : -36), a = lt * 5 + i * 3;
        s += `<path d="M ${cx - 16} 610 A 16 8 0 1 1 ${cx + 16} 610" fill="none" stroke="${COL.orange}" stroke-width="3" transform="rotate(${f1(Math.sin(a) * 10)} ${cx} 610)"/>`;
      }
    }
    s += staff(330, 650, 470, 700);
    return { svg: s };
  };
  SC.tide_timer = c => {
    const { lt } = c;
    let s = bg() + C(270, 330, 200, 'url(#gRed)', 'opacity=".25"');
    const secs = 40 * 60 - Math.floor(lt * 7);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
    s += ringTimer(270, 330, 120, 1 - (40 * 60 - secs) / (40 * 60), COL.red, `${mm}:${ss}`, 'BIS DIE FLUT KOMMT');
    s += waterLayer(lerp(940, 900, clamp(lt / 3)), lt, { amp: 4 });
    return { svg: s };
  };
  SC.suction = c => {
    const { lt } = c;
    let s = bg();
    s += R(0, 330, W, 630, '#2b2a22');
    for (let i = 0; i < 9; i++) s += L(`M 0 ${360 + i * 60} Q 270 ${350 + i * 60 + 10} ${W} ${360 + i * 60}`, 'rgba(255,255,255,.04)', 3);
    s += L('M 0 330 L 540 330', 'rgba(160,190,195,.4)', 3);
    // Bein + Stiefel im Schlick
    s += R(238, 150, 64, 300, '#3d3a33', 10) + P('M 230 430 L 310 430 L 330 500 Q 330 520 300 520 L 230 520 Z', '#1d2a22');
    // Vakuum unter dem Stiefel
    const p = (Math.sin(lt * 3) + 1) / 2;
    s += E(270, 540, 70, 18, `rgba(0,0,0,${f1((.45 + p * .2) * 100) / 100})`);
    for (let i = 0; i < 5; i++) s += TX(220 + i * 25, 546, '−', 16, 'rgba(255,77,79,.85)', { w: 900 });
    const k = clamp((lt - .4) / .5);
    s += O(k, arrow(380, 420, 380, 250, COL.red, 6));
    for (let i = 0; i < 3; i++) s += O(k, arrow(200 + i * 70, 600, 200 + i * 70 + (i - 1) * 10, 560, 'rgba(255,77,79,.7)', 3));
    s += TX(390, 230, 'ZIEHEN', 11, COL.red, { w: 900 });
    return { svg: s, anchors: { suck: [270, 590] } };
  };
  SC.ketchup = c => {
    const { lt } = c;
    let s = bg();
    // Ketchup links
    const sh = Math.sin(lt * 14) * 8 * (lt % 3 < 1.5 ? 1 : .2);
    s += G(`translate(140,320) rotate(${f1(160 + sh)})`, R(-34, -80, 68, 150, '#d63a30', 18) + R(-14, 70, 28, 24, '#f2f2f2', 4) + R(-24, -30, 48, 40, '#f2f2f2', 6) + TX(0, -2, 'K', 22, '#d63a30', { w: 900 }));
    const flow = clamp((lt % 3 - 1.4) / .6);
    if (flow > 0) s += L(`M 140 230 Q 136 ${f1(230 + 60 * flow)} 140 ${f1(230 + 140 * flow)}`, '#d63a30', 10);
    s += TX(140, 470, 'BEWEGT', 12, COL.green, { w: 900 }) + TX(140, 488, '= FLÜSSIGER', 12, COL.green, { w: 900 });
    // Bein im Schlick rechts
    s += R(300, 200, 200, 280, '#2b2a22', 14) + R(372, 150, 54, 230, '#3d3a33', 10);
    const a = lt * 5;
    s += `<path d="M 360 300 A 40 14 0 1 1 440 300" fill="none" stroke="${COL.orange}" stroke-width="3" transform="rotate(${f1(Math.sin(a) * 12)} 400 300)"/>`;
    for (let i = 0; i < 6; i++) { const pp = ((lt * .9 + i / 6) % 1); s += E(i % 2 ? 368 : 432, 210 + pp * 230, 4, 7, `rgba(90,170,200,${f1((1 - pp) * .9 * 100) / 100})`); }
    s += TX(400, 510, 'WASSER AN', 12, COL.teal, { w: 900 }) + TX(400, 528, 'DIE BEINE', 12, COL.teal, { w: 900 });
    return { svg: s };
  };
  SC.lean = c => {
    const { lt, sp } = c;
    let s = day(lt);
    s += R(0, 690, W, 270, 'rgba(120,110,80,.18)');
    const hx = 270, hy = 640;
    if (sp.phase === 0) {
      s += person({ who: 'hinnerk', x: hx, y: hy, s: 1.9, face: 'worried', arms: [[40, -10], [40, -10]] }) + mudOver(hx, hy, 50, 80);
      s += staff(330, 650, 470, 700);
      s += person({ who: 'ben', x: 110, y: 600, s: 1.4, face: 'worried' }) + person({ who: 'mia', x: 430, y: 600, s: 1.45, face: 'worried', flip: true });
    } else if (sp.phase === 1) {
      const k = ease(clamp((lt - c.beatOffset) / 1.6));
      s += staff(60, 630, 330, 600);
      s += person({ who: 'hinnerk', x: hx, y: hy, s: 1.9, rot: lerp(0, -62, k), face: 'worried', arms: [[60, 0], [60, 0]] }) + mudOver(hx, hy, 46, 80);
      s += person({ who: 'ben', x: 80, y: 690, s: 1.3, pose: 'crouch' }) + person({ who: 'mia', x: 170, y: 700, s: 1.35, pose: 'crouch', face: 'worried' });
    } else {
      const k = ease(clamp((lt - c.beatOffset) / Math.max(1, c.dur - .6)));
      s += E(hx, hy + 2, 40, 10, '#151511') + E(hx + 14, hy + 4, 18, 6, '#0d0d0a');
      s += staff(60, 630, 330, 600);
      s += person({ who: 'hinnerk', x: lerp(hx, hx - 20, k), y: lerp(hy, 700, k), s: 1.9, rot: lerp(-62, -84, k), face: k > .8 ? 'smile' : 'worried', arms: [[70, 0], [70, 0]] });
      s += person({ who: 'ben', x: 430, y: 700, s: 1.3, face: 'smile' }) + person({ who: 'mia', x: 480, y: 700, s: 1.35, face: 'smile' });
    }
    return { svg: s };
  };
  SC.bell_find = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, '#2b2a22');
    for (let i = 0; i < 14; i++) s += L(`M 0 ${i * 70 + 20} Q 270 ${i * 70 + 40} ${W} ${i * 70 + 20}`, 'rgba(255,255,255,.035)', 3);
    s += E(270, 400, 170, 90, '#151511') + E(270, 410, 150, 74, 'rgba(50,90,100,.55)');
    s += bell(270, 410, 2.1, { rot: 28 });
    s += P('M 100 420 Q 270 520 440 420 L 440 520 L 100 520 Z', '#2b2a22');
    const g = (Math.sin(lt * 4) + 1) / 2;
    s += G(`translate(300,360) scale(${f1((.6 + g * .6) * 100) / 100}) rotate(${f1(lt * 40)})`, P('M 0 -22 L 4 -4 L 22 0 L 4 4 L 0 22 L -4 4 L -22 0 L -4 -4 Z', '#fff7d6', 'filter="url(#glow)"'));
    s += E(170, 600, 60, 20, '#1d1c16') + E(390, 640, 50, 16, '#1d1c16');
    return { svg: s };
  };
  SC.bell_close = c => {
    const { lt } = c;
    let s = bg() + C(270, 380, 220, 'url(#gWarm)', 'opacity=".18"');
    const k = clamp((lt - (c.wt('Klöppel.') ?? 1)) / .4);
    s += bell(270, 380, 4, { rot: Math.sin(lt * .8) * 4, clapperGhost: k > 0 });
    return { svg: s };
  };
  SC.walk_back = c => {
    const { lt, t } = c;
    let s = day(lt, 380) + halligFar(110, 384, .8);
    s += waterLayer(lerp(960, 900, clamp(lt / c.sdur)), lt, { amp: 3, col: 'rgba(42,95,108,.6)' });
    const bob = k => Math.abs(Math.sin(lt * 4.5 + k)) * 3;
    s += person({ who: 'hinnerk', x: 210 - lt * 4, y: 600 - bob(0), s: 1.7, flip: true }) + staff(170 - lt * 4, 470, 150 - lt * 4, 610);
    s += person({ who: 'mia', x: 320 - lt * 4, y: 600 - bob(1), s: 1.6, flip: true, face: 'worried' });
    s += person({ who: 'ben', x: 400 - lt * 4, y: 600 - bob(2), s: 1.6, flip: true });
    const bs = SFXT('bell_soft').find(x => x <= t);
    if (bs !== undefined) s += soundWaves(335 - lt * 4, 515, t - bs, 3, 'rgba(255,220,150,.55)', 1);
    return { svg: s };
  };
  SC.pocket = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, COL.mia) + R(0, 0, W, H, 'rgba(0,0,0,.35)');
    s += L('M 0 120 L 540 160', 'rgba(0,0,0,.2)', 3);
    s += P('M 120 300 L 420 300 L 430 640 Q 270 690 110 640 Z', '#8e2b28');
    s += L('M 120 300 L 420 300', 'rgba(255,255,255,.25)', 3);
    s += C(270, 400, 170, 'url(#gWarm)', `opacity="${f1((.35 + Math.sin(lt * 5) * .1) * 100) / 100}"`);
    s += bell(270, 400, 1.9, { rot: Math.sin(lt * 9) * 5 });
    s += P('M 116 420 L 424 420 L 430 640 Q 270 690 110 640 Z', '#9c302c') + L('M 116 420 L 424 420', 'rgba(255,255,255,.25)', 3);
    s += soundWaves(440, 440, lt, 3, 'rgba(255,220,150,.75)', 1) + soundWaves(100, 440, lt + .3, 3, 'rgba(255,220,150,.75)', -1);
    return { svg: s };
  };
})();
