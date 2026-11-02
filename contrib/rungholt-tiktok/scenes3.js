// Teil 3 — Eis
(function () {
  const frostSky = () => sky('gSkyFrost', 380);
  const frostGround = (y0 = 370) => R(0, y0, W, H - y0, '#9fb6b8') + R(0, y0, W, H - y0, 'rgba(20,40,48,.25)') + (() => { let s = ''; for (let i = 0; i < 40; i++) s += C(hash(i + 50) * W, y0 + hash(i + 70) * (H - y0), 1 + hash(i) * 1.5, 'rgba(255,255,255,.35)'); return s; })();
  const pondE = { cx: 270, cy: 560, rx: 300, ry: 150 };
  const pond = (o = {}) => {
    let s = E(pondE.cx, pondE.cy + 8, pondE.rx + 10, pondE.ry + 8, '#5d6f61') + E(pondE.cx, pondE.cy, pondE.rx, pondE.ry, 'url(#gIce)');
    for (let i = 0; i < 26; i++) { const a = hash(i + 1) * Math.PI * 2, r = Math.sqrt(hash(i + 2)); s += E(pondE.cx + Math.cos(a) * r * pondE.rx * .9, pondE.cy + Math.sin(a) * r * pondE.ry * .9, 6 + hash(i + 3) * 18, 1 + hash(i + 4) * 2, 'rgba(255,255,255,.28)'); }
    for (let i = 0; i < 9; i++) s += R(20 + i * 14 + (i > 4 ? 420 : 0), 470 + hash(i) * 30, 3, 30 + hash(i + 9) * 20, '#7d6b45', 1);
    return s;
  };
  const cracks = (x, y, k, seed = 1) => {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + hash(seed + i);
      const len = (40 + hash(seed + i * 3) * 70) * k;
      const mx = x + Math.cos(a) * len * .5 + (hash(i + 30) - .5) * 14, my = y + Math.sin(a) * len * .25;
      s += L(`M ${x} ${y} L ${f1(mx)} ${f1(my)} L ${f1(x + Math.cos(a) * len)} ${f1(y + Math.sin(a) * len * .45)}`, 'rgba(255,255,255,.8)', 1.6);
    }
    return s;
  };
  // Loch mit Ben drin
  const holeWithBen = (x, y, t, o = {}) => {
    let s = E(x, y, 56, 20, '#10272e') + cracks(x, y, 1, 7);
    if (o.scarfTo) s += '';
    s += person({ who: 'ben', x, y: y + 66, s: 1.65, face: o.face || 'scared', arms: o.arms || [[100, -10], [100, -10]], flip: o.flip });
    s += P(`M ${x - 56} ${y} A 56 20 0 0 0 ${x + 56} ${y} Z`, 'rgba(16,39,46,.92)');
    s += P(`M ${x - 64} ${y} Q ${x - 50} ${y + 26} ${x} ${y + 28} Q ${x + 50} ${y + 26} ${x + 64} ${y} L ${x + 300} ${y} L ${x + 300} ${y + 400} L ${x - 300} ${y + 400} L ${x - 300} ${y} Z`, 'url(#gIce)', 'clip-path="url(#pondClip)"');
    s += L(`M ${x - 58} ${y + 2} Q ${x} ${y + 30} ${x + 58} ${y + 2}`, 'rgba(255,255,255,.7)', 2);
    for (let i = 0; i < 3; i++) { const p = ((t * .8 + i / 3) % 1); s += E(x, y + 4, 40 + p * 40, 10 + p * 10, 'none', `stroke="rgba(170,225,235,${f1((1 - p) * .5 * 100) / 100})" stroke-width="1.5"`); }
    return s;
  };
  const pondClip = `<clipPath id="pondClip"><ellipse cx="${pondE.cx}" cy="${pondE.cy}" rx="${pondE.rx}" ry="${pondE.ry}"/></clipPath>`;

  SC.ice_hook = c => {
    const { lt } = c;
    let s = frostSky() + frostGround() + pondClip + pond();
    s += holeWithBen(330, 540, lt);
    s += person({ who: 'mia', x: 120, y: 760, s: 1.6, face: 'scared', arms: [[40, 90], [40, 90]] });
    s += snow(lt, 30, .5);
    return { svg: s };
  };
  SC.hallig_frost = c => {
    const { lt } = c;
    let s = sky('gSkyFrost', 422) + C(420, 260, 90, 'url(#gWhite)', 'opacity=".35"') + frostGround(420);
    s += warft(150, 440, 300, 70, '#8aa3a2') + house(150, 375, 1, {}).replace(/#5b4a33/, '#dfe8ea');
    s += E(390, 600, 150, 46, 'url(#gIce)') + E(390, 600, 150, 46, 'none', 'stroke="#6e8486" stroke-width="5"');
    s += person({ who: 'mia', x: 230, y: 640, s: 1.2, hood: true }) + person({ who: 'ben', x: 280, y: 640, s: 1.2 });
    s += snow(lt, 45, .7);
    return { svg: s };
  };
  SC.fething = c => {
    const { lt } = c;
    let s = frostSky() + frostGround() + pondClip + pond();
    for (let i = 0; i < 12; i++) s += C(170 + hash(i + 3) * 200, 500 + hash(i + 5) * 120, 3 + hash(i) * 4, 'rgba(255,255,255,.4)', 'stroke="rgba(255,255,255,.6)" stroke-width="1"');
    const k = clamp((lt - (c.wt('Meerwasser') ?? 3)) / .8);
    if (k > 0) {
      s += P(`M 560 520 Q ${f1(lerp(560, 430, k))} 540 ${f1(lerp(560, 380, k))} 580 Q ${f1(lerp(560, 450, k))} 610 560 620 Z`, 'rgba(255,77,79,.28)');
      s += O(k, arrow(540, 470, 450, 520, COL.red, 4));
    }
    return { svg: s };
  };
  SC.salt_ice = c => {
    const { lt } = c;
    let s = bg();
    const block = (x, salty) => {
      let g = R(x - 90, 260, 180, 220, salty ? '#8fb3bb' : '#b9dde5', 10) + R(x - 90, 260, 180, 26, 'rgba(255,255,255,.4)', 10);
      if (salty) {
        for (let i = 0; i < 9; i++) { const xx = x - 76 + i * 19; let d = `M ${xx} 290`; for (let y = 290; y < 470; y += 14) d += ` L ${f1(xx + Math.sin(y * .1 + i) * 4)} ${y}`; g += L(d, 'rgba(40,80,95,.55)', 2.2); }
        for (let i = 0; i < 16; i++) g += E(x - 80 + hash(i + 3) * 160, 300 + hash(i + 9) * 160, 3, 5, 'rgba(40,80,95,.5)');
        const ck = clamp((lt - (c.wt('weniger,') ?? 2.5)) / .4);
        if (ck > 0) g += L(`M ${x - 10} 260 L ${x + 6} 320 L ${x - 14} 380 L ${x + 10} ${f1(lerp(380, 480, ck))}`, '#fff', 3);
      }
      g += TX(x, 520, salty ? 'MIT SALZ' : 'SÜSSWASSER', 13, salty ? COL.red : COL.teal, { w: 900 });
      return g;
    };
    s += block(150, false) + block(390, true);
    s += TX(270, 200, 'EIS IM QUERSCHNITT', 11, 'rgba(214,226,230,.6)', { mono: 1, w: 500, ls: 3 });
    return { svg: s };
  };
  SC.ben_walk = c => {
    const { lt } = c;
    const kn = c.wt('Knack.') ?? 3;
    const k = ease(clamp(lt / Math.max(1, kn)));
    let s = frostSky() + frostGround() + pondClip + pond();
    s += lanternBoy(470, 470, .55, lt, { op: .22, lop: .35, lit: 0, flip: true });
    s += G('translate(470,470) scale(.55)', person({ who: 'boy', x: 0, y: 0, s: 1, pose: 'wave', t: lt }), 'opacity=".22"');
    const bx = lerp(140, 320, k), by = lerp(700, 560, k);
    s += footprints(Array.from({ length: Math.floor(k * 10) }, (_, i) => [lerp(140, 320, i / 10), lerp(712, 572, i / 10), -40]), 'rgba(80,110,120,.55)', 1);
    const ck = clamp((lt - kn) / .25);
    if (ck > 0) s += cracks(bx, by, ck, 3);
    s += person({ who: 'ben', x: bx, y: by, s: 1.35, face: ck > 0 ? 'scared' : 'neutral', lookX: 3 });
    s += person({ who: 'mia', x: 80, y: 820, s: 1.5, face: 'worried', pose: 'reach' });
    if (ck > 0 && ck < 1) s += R(0, 0, W, H, `rgba(255,255,255,${f1((1 - ck) * .35 * 100) / 100})`);
    return { svg: s };
  };
  SC.ice_hole = c => {
    const { lt, sp } = c;
    let s = frostSky() + frostGround() + pondClip + pond();
    s += holeWithBen(330, 540, lt);
    if (sp.mia) s += person({ who: 'mia', x: 90, y: 600, s: 1.4, rot: 84, face: 'worried' });
    else s += person({ who: 'mia', x: 110, y: 780, s: 1.6, face: 'scared', pose: 'reach' });
    return { svg: s };
  };
  SC.pressure = c => {
    const { lt } = c;
    let s = bg();
    s += person({ who: 'mia', x: 140, y: 470, s: 1.6 });
    s += E(128, 474, 13, 5, COL.red, 'filter="url(#glow)"') + E(152, 474, 13, 5, COL.red, 'filter="url(#glow)"');
    s += TX(140, 520, 'STEHEN', 12, COL.red, { w: 900 });
    const k = clamp((lt - (c.wt('Liegen') ?? 3)) / .6);
    s += O(.35 + k * .65, R(300, 380, 210, 100, 'rgba(51,209,122,.25)', 14, `stroke="${COL.green}" stroke-width="3"`) + person({ who: 'mia', x: 500, y: 440, s: 1.45, rot: -90 }) + TX(405, 520, 'LIEGEN', 12, COL.green, { w: 900 }));
    s += R(0, 480, W, 6, 'rgba(188,217,224,.6)');
    return { svg: s };
  };
  SC.mia_crawl = c => {
    const { lt } = c, k = ease(clamp(lt / c.sdur));
    let s = frostSky() + frostGround() + pondClip + pond();
    s += holeWithBen(380, 520, lt);
    const mx = lerp(-60, 110, k);
    s += footprints([[60, 700], [70, 690]], 'rgba(80,110,120,.5)');
    s += person({ who: 'mia', x: mx, y: 590 - k * 20, s: 1.4, rot: 84 + Math.sin(lt * 6) * 3, face: 'worried' });
    return { svg: s };
  };
  SC.scarf = c => {
    const { lt } = c;
    let s = frostSky() + frostGround() + pondClip + pond();
    s += holeWithBen(380, 520, lt, { arms: [[100, -20], [70, -10]] });
    s += person({ who: 'mia', x: 110, y: 572, s: 1.4, rot: 84, face: 'worried' });
    const t0 = c.wt('Schal') ?? 4, k = easeOut(clamp((lt - t0) / .5));
    if (k > 0) {
      const ex = lerp(265, 335, k), ey = lerp(548, 500, k);
      s += L(`M 265 548 Q ${f1((265 + ex) / 2)} ${f1(548 + 20 * k)} ${f1(ex)} ${f1(ey)}`, '#f2b632', 9) + L(`M 265 548 Q ${f1((265 + ex) / 2)} ${f1(548 + 20 * k)} ${f1(ex)} ${f1(ey)}`, COL.mia, 9, 'stroke-dasharray="8 8"');
    }
    return { svg: s };
  };
  SC.rule1101 = c => {
    const { lt } = c;
    let s = bg();
    const cards = [['1', 'MIN', 'KÄLTESCHOCK', 'RUHIG ATMEN', 'Minute'], ['10', 'MIN', 'KRAFT IN ARMEN', 'UND BEINEN', 'Zehn'], ['1', 'STD', 'BIS DIE KÄLTE', 'GEFÄHRLICH WIRD', 'Stunde,']];
    cards.forEach(([n, u, a, b, w], i) => {
      const tw = c.wt(w); const k = tw === null ? 0 : easeBack(clamp((lt - tw + .15) / .3));
      if (k <= 0) return;
      const y = 150 + i * 135;
      s += G(`translate(270,${y}) scale(${f1(k * 100) / 100})`, R(-200, -52, 400, 104, 'rgba(16,22,26,.92)', 14) + R(-200, -52, 8, 104, COL.orange, 4) +
        TX(-120, 18, n, 54, COL.orange, { w: 900 }) + TX(-120, 40, u, 12, 'rgba(255,255,255,.7)', { w: 800, ls: 2 }) +
        TX(-40, -4, a, 17, '#fff', { w: 900, a: 'start' }) + TX(-40, 20, b, 13, 'rgba(255,255,255,.7)', { w: 800, a: 'start' }));
    });
    return { svg: s };
  };
  SC.ice_roll = c => {
    const { lt, sp } = c;
    let s = frostSky() + frostGround() + pondClip + pond();
    const track = Array.from({ length: 9 }, (_, i) => [lerp(140, 320, i / 9), lerp(712, 572, i / 9), -40]);
    s += footprints(track, 'rgba(80,110,120,.55)');
    if (sp.phase === 0) s += holeWithBen(330, 545, lt);
    if (sp.phase === 1) {
      s += holeWithBen(330, 545, lt, { flip: true, arms: [[100, -10], [100, -10]], face: 'worried' });
      const k = clamp((lt - c.beatOffset - .3) / .6);
      s += O(k, arrow(300, 600, 170, 700, COL.green, 6));
    }
    if (sp.phase === 2) {
      const k = ease(clamp((lt - c.beatOffset) / Math.max(1, c.dur - .5)));
      s += E(330, 545, 56, 20, '#10272e') + cracks(330, 545, 1, 7);
      const x = lerp(300, 150, k), y = lerp(560, 705, k), rot = -90 + k * 720;
      s += person({ who: 'ben', x, y, s: 1.2, rot, face: 'worried' });
    }
    s += person({ who: 'mia', x: 90, y: 790, s: 1.5, face: 'worried', pose: 'reach' });
    return { svg: s };
  };
  SC.blanket = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, '#3a3226') + C(270, 360, 320, 'url(#gWarm)', 'opacity=".45"');
    s += R(320, 120, 170, 150, '#9fb6b8', 6) + R(320, 120, 170, 150, 'none', 6, 'stroke="#2a1f17" stroke-width="10"');
    s += L('M 40 300 L 300 300', '#ddd', 2) + R(70, 300, 50, 70, COL.ben, 4) + R(150, 300, 44, 90, COL.jeans, 4) + R(220, 300, 40, 60, COL.benHat, 4);
    s += person({ who: 'ben', x: 230, y: 640, s: 1.9, pose: 'sit', blanket: 1, face: 'neutral' });
    s += person({ who: 'oma', x: 410, y: 650, s: 1.7, pose: 'stand', face: 'worried' });
    s += R(240, 520, 30, 32, '#e8e1d5', 5) + L(`M 250 512 q -6 -12 0 -22 q 6 -10 0 -20`, 'rgba(255,255,255,.45)', 2, `transform="translate(${f1(Math.sin(lt * 2) * 2)},0)"`);
    s += R(0, 650, W, 310, '#2a2219');
    return { svg: s };
  };
  SC.ben_whisper = c => {
    const { lt } = c;
    let s = R(0, 0, W, H, '#2e2a22') + C(270, 420, 300, 'url(#gWarm)', 'opacity=".25"');
    s += R(330, 90, 170, 190, '#6f8f98', 6);
    s += G('translate(0,0)', person({ who: 'boy', x: 430, y: 240, s: .35, pose: 'wave', t: lt }), 'opacity=".35"');
    s += R(330, 90, 170, 190, 'none', 6, 'stroke="#2a1f17" stroke-width="12"') + L('M 415 90 L 415 280', '#2a1f17', 6);
    s += person({ who: 'ben', x: 230, y: 860, s: 3.1, pose: 'sit', blanket: 1, face: 'scared', lookX: 3 });
    return { svg: s };
  };
  SC.ice_track = c => {
    const { lt, sp } = c;
    let s = frostSky() + frostGround() + pondClip + pond();
    s += E(330, 545, 56, 20, '#1d3a40') + E(330, 545, 50, 16, 'rgba(160,200,210,.5)') + cracks(330, 545, .8, 7);
    s += footprints(Array.from({ length: 9 }, (_, i) => [lerp(140, 320, i / 9), lerp(712, 572, i / 9), -40]), 'rgba(60,90,100,.6)');
    if (sp.circle) {
      const k = clamp((lt - c.beatOffset - (c.wt('weggeschmolzen.') !== null ? c.wt('weggeschmolzen.') - c.beatOffset : .8)) / .8);
      s += O(k, E(220, 520, 24, 9, '#5a8794') + E(220, 520, 24, 9, 'none', 'stroke="rgba(255,200,120,.75)" stroke-width="2"') + E(220, 520, 60, 26, 'url(#gWarm)', 'opacity=".35"'));
    }
    s += R(0, 0, W, H, 'rgba(10,20,30,.15)');
    return { svg: s, anchors: { circle: [220, 470] } };
  };
})();
