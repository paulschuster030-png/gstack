// Grafik-Bibliothek: flacher Vektorstil, dunkles Petrol, wie im Original.
const W = 540, H = 960;
const COL = {
  bgTop: '#17343c', bgBot: '#0a1519', mud: '#2b2c26', mudDark: '#1b1d19', mudLight: '#3b3b32',
  water: '#24505a', waterLight: '#3d7d88', fog: '185,205,210', warm: '#ffc861', glow: '#ffb347',
  red: '#ff4d4f', green: '#33d17a', orange: '#f6a823', teal: '#5cc8c8', ink: '#0d1114',
  skin: '#f1c9a5', mia: '#d64541', ben: '#3b6fa8', benHat: '#f2b632', oma: '#7b5ea7',
  hinnerk: '#2f4f6f', rescue: '#f26b1d', arch: '#2a8c82', shoe: '#1a1c1e', jeans: '#2d3b55',
  ice: '#bcd9e0', iceDark: '#7fa9b4', wood: '#6b4a2f', wall: '#cfc6b5', roof: '#5b4a33',
};

// ---- Mathe / Easing
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeBack = k => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const prog = (t, a, d) => clamp((t - a) / d);
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const f1 = n => (+n).toFixed(1);

// ---- SVG-Bausteine
const R = (x, y, w, h, f, rx = 0, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${f}" ${ex}/>`;
const C = (cx, cy, r, f, ex = '') => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${f}" ${ex}/>`;
const E = (cx, cy, rx, ry, f, ex = '') => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${f}" ${ex}/>`;
const P = (d, f, ex = '') => `<path d="${d}" fill="${f}" ${ex}/>`;
const L = (d, st, w = 2, ex = '') => `<path d="${d}" fill="none" stroke="${st}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
const G = (tr, inner, ex = '') => `<g transform="${tr}" ${ex}>${inner}</g>`;
const O = (op, inner) => `<g opacity="${f1(op * 100) / 100}">${inner}</g>`;
const TX = (x, y, s, size, fill, o = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" font-family="${o.mono ? 'JetBrains Mono' : 'Montserrat'}" font-weight="${o.w || 800}" font-size="${size}" fill="${fill}" text-anchor="${o.a || 'middle'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''} ${o.ex || ''}>${s}</text>`;

const DEFS = `<defs>
<radialGradient id="gWarm"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".95"/><stop offset=".25" stop-color="#ffbe55" stop-opacity=".45"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></radialGradient>
<radialGradient id="gWhite"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#dff" stop-opacity=".35"/><stop offset="1" stop-color="#bff" stop-opacity="0"/></radialGradient>
<radialGradient id="gCold"><stop offset="0" stop-color="#bfefff" stop-opacity=".8"/><stop offset="1" stop-color="#7fd0e0" stop-opacity="0"/></radialGradient>
<radialGradient id="gRed"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".7"/><stop offset="1" stop-color="#ff4d4f" stop-opacity="0"/></radialGradient>
<radialGradient id="gGreen"><stop offset="0" stop-color="#5cf09a" stop-opacity=".6"/><stop offset="1" stop-color="#33d17a" stop-opacity="0"/></radialGradient>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3d46"/><stop offset="1" stop-color="#0f262d"/></linearGradient>
<linearGradient id="gSkyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b161b"/><stop offset="1" stop-color="#132c33"/></linearGradient>
<linearGradient id="gSkyDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a55"/><stop offset=".7" stop-color="#6b7f80"/><stop offset="1" stop-color="#a99a85"/></linearGradient>
<linearGradient id="gSkyFrost" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4f5c"/><stop offset="1" stop-color="#6f95a0"/></linearGradient>
<linearGradient id="gMud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34352d"/><stop offset="1" stop-color="#191a16"/></linearGradient>
<linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5862"/><stop offset="1" stop-color="#0e2329"/></linearGradient>
<linearGradient id="gIce" gradientUnits="userSpaceOnUse" x1="0" y1="400" x2="0" y2="720"><stop offset="0" stop-color="#9cc3cc"/><stop offset="1" stop-color="#5f8b96"/></linearGradient>
<linearGradient id="gRoom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22343a"/><stop offset="1" stop-color="#121c20"/></linearGradient>
<linearGradient id="gBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17343c"/><stop offset="1" stop-color="#0a1519"/></linearGradient>
<linearGradient id="gBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="gBeamWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></linearGradient>
<linearGradient id="gSepia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3a2c"/><stop offset="1" stop-color="#1e2019"/></linearGradient>
<radialGradient id="gFog"><stop offset="0" stop-color="rgb(185,205,210)" stop-opacity="1"/><stop offset=".45" stop-color="rgb(185,205,210)" stop-opacity=".7"/><stop offset="1" stop-color="rgb(185,205,210)" stop-opacity="0"/></radialGradient>
<filter id="b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="b10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="b24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

// ---- Hintergründe
const bg = (id = 'gBg') => R(0, 0, W, H, `url(#${id})`);
function sky(id = 'gSky', h = 420) { return R(0, 0, W, h + 2, `url(#${id})`); }
function mudflat(y0 = 420, t = 0, o = {}) {
  let s = R(0, y0, W, H - y0, 'url(#gMud)');
  // Rippel
  for (let i = 0; i < 16; i++) {
    const y = y0 + 12 + Math.pow(i / 16, 1.6) * (H - y0);
    const a = 2 + i * .25, k = 0.04 - i * .0015;
    let d = `M -10 ${f1(y)}`;
    for (let x = -10; x <= W + 10; x += 20) d += ` L ${x} ${f1(y + Math.sin(x * k + i * 1.7) * a)}`;
    s += L(d, 'rgba(255,255,255,.035)', 1 + i * .12);
  }
  // nasse Glanzflächen
  for (let i = 0; i < 7; i++) {
    const x = hash(i + 3) * W, y = y0 + 30 + hash(i + 9) * (H - y0 - 60);
    s += E(x, y, 30 + hash(i) * 70, 4 + hash(i + 1) * 6, 'rgba(120,170,180,.07)');
  }
  return s;
}
function seaBand(y0, y1, t = 0, op = 1) {
  let s = R(0, y0, W, y1 - y0, 'url(#gSea)', 0, `opacity="${op}"`);
  for (let i = 0; i < 6; i++) {
    const y = y0 + 6 + i * (y1 - y0) / 6;
    const off = (t * (12 + i * 3)) % 60;
    let d = '';
    for (let x = -60 + off; x < W + 60; x += 60) d += `M ${f1(x)} ${f1(y)} l 26 0 `;
    s += L(d, 'rgba(160,215,225,.12)', 1.2);
  }
  return s;
}
function waterLayer(yTop, t, o = {}) {
  // Wasseroberfläche mit Wellen (seitliche Ansicht)
  const amp = o.amp || 3, col = o.col || 'rgba(42,95,108,.82)';
  let d = `M -10 ${H + 10} L -10 ${f1(yTop)}`;
  for (let x = -10; x <= W + 10; x += 10) d += ` L ${x} ${f1(yTop + Math.sin(x * .045 + t * 2.2) * amp + Math.sin(x * .11 - t * 1.3) * amp * .4)}`;
  d += ` L ${W + 10} ${H + 10} Z`;
  let s = P(d, col);
  let d2 = `M -10 ${f1(yTop)}`;
  for (let x = -10; x <= W + 10; x += 10) d2 += ` L ${x} ${f1(yTop + Math.sin(x * .045 + t * 2.2) * amp + Math.sin(x * .11 - t * 1.3) * amp * .4)}`;
  s += L(d2, 'rgba(170,225,235,.45)', 1.5);
  return s;
}
function fog(t, dens = 1, y0 = 250, y1 = 900) {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const dir = i % 2 ? 1 : -1, sp = 6 + hash(i) * 10;
    const x = ((hash(i + 20) * 900 + dir * t * sp) % 900 + 900) % 900 - 180;
    const y = y0 + hash(i + 40) * (y1 - y0);
    s += E(x, y, 300 + hash(i + 2) * 140, 90 + hash(i + 5) * 50, 'url(#gFog)', `opacity="${Math.min(1, .2 * dens).toFixed(3)}"`);
  }
  s += R(0, 0, W, H, `rgba(${COL.fog},${(.06 * dens).toFixed(3)})`);
  return s;
}
function rain(t, n = 70, op = .35, ang = 12) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const sp = 900 + hash(i) * 500;
    const y = ((hash(i + 7) * H + t * sp) % (H + 60)) - 30;
    const x = (hash(i + 13) * (W + 200) - t * sp * Math.tan(ang * Math.PI / 180)) % (W + 200);
    const xx = ((x % (W + 200)) + W + 200) % (W + 200) - 100;
    d += `M ${f1(xx)} ${f1(y)} l ${f1(-4)} ${f1(18)} `;
  }
  return L(d, `rgba(190,220,230,${op})`, 1.2);
}
function snow(t, n = 40, op = .6) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const y = ((hash(i + 3) * H + t * (30 + hash(i) * 30)) % (H + 20)) - 10;
    const x = hash(i + 11) * W + Math.sin(t + i) * 8;
    s += C(x, y, 1 + hash(i + 5) * 1.6, `rgba(235,245,250,${op})`);
  }
  return s;
}
function bolt(x, y0, y1, seed = 1, w = 3) {
  let d = `M ${x} ${y0}`, cx = x, steps = 9;
  for (let i = 1; i <= steps; i++) { cx += (hash(seed * 10 + i) - .5) * 46; d += ` L ${f1(cx)} ${f1(y0 + (y1 - y0) * i / steps)}`; }
  return L(d, '#eaffff', w, 'filter="url(#glow)"') + L(d, 'rgba(190,240,255,.35)', w * 4, 'filter="url(#b4)"');
}

// ---- Figuren (Frontalansicht, Füße bei 0,0; Höhe ~125 bei s=1)
const PRESET = {
  mia: { coat: COL.mia, pants: COL.jeans, hair: '#5a3825', hairStyle: 'ponytail', kid: true },
  ben: { coat: COL.ben, pants: '#2b2f38', hair: '#7a5230', hat: 'beanie', hatColor: COL.benHat, kid: true, small: true },
  oma: { coat: COL.oma, pants: '#3a3550', hair: '#d9d9d9', hairStyle: 'bun', glasses: true },
  hinnerk: { coat: COL.hinnerk, pants: '#3d3a33', hair: '#cfcfcf', hat: 'cap', hatColor: '#1b1f24', beard: '#d0d0d0' },
  rescuer: { coat: COL.rescue, pants: COL.rescue, hair: '#3a2a1e', hat: 'helmet', hatColor: '#f4f4f4', stripes: true },
  arch: { coat: COL.arch, pants: '#3b3b44', hair: '#2b1f17', hat: 'beanie', hatColor: '#e8e1d5', hairStyle: 'long' },
  boy: { sil: true, hat: 'oldcap', kid: true, small: true },
};
function arm(sx, sy, a1, a2, len1, len2, col, side, w = 9, handCol = COL.skin) {
  const r1 = (a1 * side) * Math.PI / 180, r2 = ((a1 + a2) * side) * Math.PI / 180;
  const ex = sx + Math.sin(r1) * len1, ey = sy + Math.cos(r1) * len1;
  const hx = ex + Math.sin(r2) * len2, hy = ey + Math.cos(r2) * len2;
  return L(`M ${f1(sx)} ${f1(sy)} L ${f1(ex)} ${f1(ey)} L ${f1(hx)} ${f1(hy)}`, col, w) + C(hx, hy, w * .52, handCol);
}
function person(o) {
  o = Object.assign({}, PRESET[o.who] || {}, o);
  const sil = o.sil, ink = '#0a1316';
  const coat = sil ? ink : o.coat, pants = sil ? ink : o.pants, skin = sil ? ink : (o.skin || COL.skin);
  const shoe = sil ? ink : COL.shoe;
  const s = (o.s || 1) * (o.small ? .7 : o.kid ? .82 : 1);
  const pose = o.pose || 'stand';
  const crouch = pose === 'crouch' || pose === 'sit';
  const dy = crouch ? 26 : 0; // Oberkörper absenken
  let g = '';
  // Beine
  if (crouch) {
    g += P(`M -13 -30 Q -24 -22 -16 -2 L -6 -2 Q -8 -18 -2 -26 Z`, pants) + P(`M 13 -30 Q 24 -22 16 -2 L 6 -2 Q 8 -18 2 -26 Z`, pants);
    g += E(-10, -2, 8, 3.6, shoe) + E(10, -2, 8, 3.6, shoe);
  } else {
    const sp = o.feetApart ? 8 : 0;
    g += R(-12 - sp, -48, 10, 46, pants, 3) + R(2 + sp, -48, 10, 46, pants, 3);
    g += E(-7 - sp, -2.5, 7.5, 3.6, shoe) + E(7 + sp, -2.5, 7.5, 3.6, shoe);
  }
  const ty = dy; // Verschiebung Oberkörper
  // Arme hinter dem Körper zuerst (Hand)
  const pa = o.arms || ({ stand: [[8, 0], [8, 0]], hold: [[8, 0], [38, -10]], wave: [[8, 0], [150, 10 + Math.sin((o.t || 0) * 6) * 18]],
    phone: [[8, 0], [40, 125]], sit: [[20, 30], [20, 30]], crouch: [[25, 40], [25, 40]], up: [[160, 0], [160, 0]], hug: [[30, 80], [30, 80]],
    reach: [[8, 0], [95, 0]], lantern: [[8, 0], [25, -15]], ears: [[35, 140], [35, 140]] }[pose]) || [[8, 0], [8, 0]];
  const armCol = coat;
  const armsSvg = arm(-16, -86 + ty, pa[0][0], pa[0][1], 21, 20, armCol, -1, 9, skin) + arm(16, -86 + ty, pa[1][0], pa[1][1], 21, 20, armCol, 1, 9, skin);
  // Rumpf
  const coatLen = o.coatLong ? 54 : 48;
  g += P(`M -17 ${-82 + ty} Q -18 ${-93 + ty} -6 ${-94 + ty} L 6 ${-94 + ty} Q 18 ${-93 + ty} 17 ${-82 + ty} L 19 ${-94 + coatLen + 8 + ty} Q 0 ${-94 + coatLen + 12 + ty} -19 ${-94 + coatLen + 8 + ty} Z`, coat);
  if (o.stripes && !sil) g += R(-18, -62 + ty, 36, 4, '#e8e8e8') + R(-18, -54 + ty, 36, 4, '#e8e8e8');
  if (o.zip && !sil) g += L(`M 0 ${-92 + ty} L 0 ${-44 + ty}`, 'rgba(0,0,0,.25)', 1.5);
  if (!sil && !o.stripes) g += L(`M 0 ${-92 + ty} L 0 ${-46 + ty}`, 'rgba(0,0,0,.18)', 1.4);
  g += armsSvg;
  // Kopf
  const hy = -110 + ty;
  g += R(-4, hy + 10, 8, 8, skin);
  if (o.hairStyle === 'long' && !sil) g += P(`M -15 ${hy} Q -17 ${hy + 22} -12 ${hy + 24} L 12 ${hy + 24} Q 17 ${hy + 22} 15 ${hy} Z`, o.hair);
  if (o.hairStyle === 'ponytail' && !sil) g += P(`M 11 ${hy - 6} Q 26 ${hy - 2} 22 ${hy + 18} Q 18 ${hy + 8} 12 ${hy + 4} Z`, o.hair);
  g += C(0, hy, 14.5, skin);
  if (!sil) {
    if (o.hairStyle === 'bun') g += C(0, hy - 17, 7, o.hair) + P(`M -14.5 ${hy - 1} Q -14 ${hy - 16} 0 ${hy - 15} Q 14 ${hy - 16} 14.5 ${hy - 1} Q 8 ${hy - 9} 0 ${hy - 9} Q -8 ${hy - 9} -14.5 ${hy - 1} Z`, o.hair);
    else if (!o.hat || o.hat === 'helmet') g += P(`M -14.8 ${hy + 1} Q -15 ${hy - 16} 0 ${hy - 15.5} Q 15 ${hy - 16} 14.8 ${hy + 1} Q 10 ${hy - 8} 2 ${hy - 7} Q -8 ${hy - 9} -14.8 ${hy + 1} Z`, o.hair || '#3a2a1e');
    if (o.beard) g += P(`M -13 ${hy + 2} Q -12 ${hy + 17} 0 ${hy + 18} Q 12 ${hy + 17} 13 ${hy + 2} Q 8 ${hy + 9} 0 ${hy + 9} Q -8 ${hy + 9} -13 ${hy + 2} Z`, o.beard);
    // Gesicht
    const ex = o.lookX || 0;
    if (o.eyesClosed) g += L(`M ${-7 + ex} ${hy + 1} l 4 0 M ${3 + ex} ${hy + 1} l 4 0`, '#1d1d1d', 1.4);
    else g += C(-5 + ex, hy + 1, 1.9, '#1d1d1d') + C(5 + ex, hy + 1, 1.9, '#1d1d1d');
    if (o.glasses) g += `<g fill="none" stroke="#2a2a2a" stroke-width="1.1">${C(-5 + ex, hy + 1, 4, 'none', 'stroke="#2a2a2a"')}${C(5 + ex, hy + 1, 4, 'none', 'stroke="#2a2a2a"')}</g>`;
    const face = o.face || 'neutral';
    if (face === 'worried') g += L(`M ${-8 + ex} ${hy - 5} l 5 -2 M ${8 + ex} ${hy - 5} l -5 -2`, '#2a1d14', 1.3) + L(`M ${-3 + ex} ${hy + 9} q 3 -2 6 0`, '#5a2d22', 1.4);
    else if (face === 'scared') g += L(`M ${-8 + ex} ${hy - 6} l 5 -2 M ${8 + ex} ${hy - 6} l -5 -2`, '#2a1d14', 1.3) + E(ex, hy + 9, 2.4, 3, '#5a2d22');
    else if (face === 'smile') g += L(`M ${-4 + ex} ${hy + 7} q 4 3 8 0`, '#5a2d22', 1.4);
    else if (!o.beard) g += L(`M ${-3 + ex} ${hy + 8} l 6 0`, '#5a2d22', 1.3);
    if (o.kid && face !== 'scared') g += C(-9 + ex, hy + 6, 2.2, 'rgba(230,110,100,.25)') + C(9 + ex, hy + 6, 2.2, 'rgba(230,110,100,.25)');
  }
  // Hüte
  const hc = sil ? ink : o.hatColor;
  if (o.hat === 'beanie') g += P(`M -15.5 ${hy - 2} Q -15 ${hy - 20} 0 ${hy - 20} Q 15 ${hy - 20} 15.5 ${hy - 2} Z`, hc) + R(-16.5, hy - 5, 33, 6, sil ? ink : 'rgba(0,0,0,.18)', 3) + C(0, hy - 21, 4, hc);
  if (o.hat === 'cap') g += P(`M -15 ${hy - 4} Q -14 ${hy - 17} 0 ${hy - 17} Q 14 ${hy - 17} 15 ${hy - 4} Z`, hc) + R(-17, hy - 6, 34, 4, '#111418', 2) + R(-6, hy - 13, 12, 3, '#c9a44a', 1);
  if (o.hat === 'helmet') g += P(`M -16 ${hy - 1} Q -16 ${hy - 21} 0 ${hy - 21} Q 16 ${hy - 21} 16 ${hy - 1} Z`, hc);
  if (o.hat === 'oldcap') g += P(`M -15 ${hy - 3} Q -12 ${hy - 18} 2 ${hy - 17} Q 18 ${hy - 15} 21 ${hy - 7} L 15 ${hy - 4} Z`, hc);
  if (o.hood && !sil) g += P(`M -18 ${hy + 12} Q -22 ${hy - 22} 0 ${hy - 22} Q 22 ${hy - 22} 18 ${hy + 12} Q 16 ${hy - 12} 0 ${hy - 13} Q -16 ${hy - 12} -18 ${hy + 12} Z`, coat);
  if (o.blanket) g += P(`M -24 ${-96 + ty} Q 0 ${-104 + ty} 24 ${-96 + ty} L 28 ${-30 + ty} Q 0 ${-24 + ty} -28 ${-30 + ty} Z`, o.blanket === 'foil' ? '#d9b44a' : '#a0523d') + (o.blanket === 'foil' ? L(`M -18 ${-80 + ty} l 10 40 M 6 ${-90 + ty} l 6 50 M -6 ${-60 + ty} l 14 -20`, 'rgba(255,245,200,.75)', 2.2) : L(`M -24 ${-70 + ty} L 24 ${-70 + ty} M -26 ${-50 + ty} L 26 ${-50 + ty}`, 'rgba(255,220,170,.35)', 3));
  if (sil) g = `<g>${g}</g>`;
  const rot = o.rot ? ` rotate(${o.rot})` : '';
  return G(`translate(${f1(o.x)},${f1(o.y)})${rot} scale(${f1((o.flip ? -s : s) * 1000) / 1000},${f1(s * 1000) / 1000})`, g);
}

// Laterne (y = Aufhängung)
function lantern(x, y, s = 1, lit = 1, swing = 0, glowR = 70) {
  let g = '';
  if (lit > 0) g += C(0, 22, glowR, 'url(#gWarm)', `opacity="${f1(lit * 100) / 100}"`);
  g += L(`M -7 2 Q 0 -10 7 2`, '#1c1a16', 2.2);
  g += P(`M -9 4 L 9 4 L 12 10 L -12 10 Z`, '#232019');
  g += R(-9, 10, 18, 22, lit > 0 ? `rgba(255,${190 + 40 * lit},${90 + 60 * lit},${.35 + .65 * lit})` : '#3a3830', 2);
  g += L(`M -9 10 L -9 32 M 9 10 L 9 32 M 0 10 L 0 32`, '#232019', 1.6);
  if (lit > 0) g += E(0, 22, 3, 5, `rgba(255,250,220,${lit})`);
  g += P(`M -12 32 L 12 32 L 9 37 L -9 37 Z`, '#232019');
  return G(`translate(${f1(x)},${f1(y)}) rotate(${f1(swing)}) scale(${s})`, g);
}
// Laternenjunge (Silhouette)
function lanternBoy(x, y, s = 1, t = 0, o = {}) {
  const lit = o.lit === undefined ? 1 : o.lit;
  let g = O(o.op !== undefined ? o.op : 1, person({ who: 'boy', x: 0, y: 0, s: 1, pose: 'lantern', flip: o.flip }));
  g += O(o.lop !== undefined ? o.lop : 1, lantern(o.flip ? -27 : 27, -78, .55, lit, Math.sin(t * 2.2) * (o.swing || 6), o.glowR || 60));
  return G(`translate(${f1(x)},${f1(y)}) scale(${s})`, g);
}

// Hallig-Haus (Reetdach). y = Boden
function house(x, y, s = 1, o = {}) {
  const wall = o.night ? '#4a4a46' : COL.wall, roof = o.night ? '#3a3024' : COL.roof;
  let g = R(-46, -40, 92, 40, wall, 2);
  g += P(`M -56 -38 L -16 -92 L 16 -92 L 56 -38 Z`, roof);
  g += L(`M -50 -46 L 50 -46`, 'rgba(0,0,0,.2)', 2);
  g += R(-8, -28, 16, 28, o.night ? '#2a2420' : '#5b3d27', 1);
  const wcol = o.lit ? COL.warm : (o.night ? '#1d2a2e' : '#3e5a63');
  g += R(-36, -30, 16, 14, wcol, 1) + R(20, -30, 16, 14, wcol, 1);
  if (o.lit) g += C(-28, -23, 26, 'url(#gWarm)', 'opacity=".55"') + C(28, -23, 26, 'url(#gWarm)', 'opacity=".55"');
  g += R(16, -100, 8, 18, o.night ? '#3b3530' : '#7a6a5a');
  return G(`translate(${f1(x)},${f1(y)}) scale(${s})`, g);
}
function warft(x, y, w = 260, h = 46, col = '#2f4536') {
  return P(`M ${x - w / 2} ${y} Q ${x - w / 2 + 50} ${y - h} ${x} ${y - h} Q ${x + w / 2 - 50} ${y - h} ${x + w / 2} ${y} Z`, col);
}
function halligFar(x, y, s = 1, o = {}) {
  let g = warft(0, 0, 200, 26, o.col || '#20332a') + house(0, -24, .45, { night: o.night, lit: o.lit });
  return G(`translate(${f1(x)},${f1(y)}) scale(${s})`, g);
}
// Telefon
function phone(x, y, s = 1, inner = '', o = {}) {
  let g = R(-80, -160, 160, 320, '#0f1417', 22) + R(-72, -150, 144, 300, o.screen || '#101c22', 14);
  g += `<clipPath id="pc"><rect x="-72" y="-150" width="144" height="300" rx="14"/></clipPath><g clip-path="url(#pc)">${inner}</g>`;
  g += R(-22, -146, 44, 9, '#0f1417', 5);
  return G(`translate(${f1(x)},${f1(y)}) scale(${s})${o.rot ? ` rotate(${o.rot})` : ''}`, g);
}
// Pfeil
function arrow(x1, y1, x2, y2, col, w = 4) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 10 + w;
  const p1 = [x2 - Math.cos(a - .5) * h, y2 - Math.sin(a - .5) * h], p2 = [x2 - Math.cos(a + .5) * h, y2 - Math.sin(a + .5) * h];
  return L(`M ${f1(x1)} ${f1(y1)} L ${f1(x2 - Math.cos(a) * 4)} ${f1(y2 - Math.sin(a) * 4)}`, col, w) + P(`M ${f1(x2)} ${f1(y2)} L ${f1(p1[0])} ${f1(p1[1])} L ${f1(p2[0])} ${f1(p2[1])} Z`, col);
}
function ringTimer(x, y, r, k, col, label, sub) {
  const a = k * Math.PI * 2, ex = x + Math.sin(a) * r, ey = y - Math.cos(a) * r;
  let g = C(x, y, r, 'none', `stroke="rgba(255,255,255,.12)" stroke-width="10"`);
  if (k > 0.001) g += `<path d="M ${x} ${y - r} A ${r} ${r} 0 ${k > .5 ? 1 : 0} 1 ${f1(ex)} ${f1(ey)}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"/>`;
  g += TX(x, y + 12, label, 34, '#fff', { w: 900 });
  if (sub) g += TX(x, y + 34, sub, 10, 'rgba(255,255,255,.55)', { mono: 1, w: 500, ls: 2 });
  return g;
}
function knockRings(x, y, t, times, col = 'rgba(255,255,255,.7)') {
  let g = '';
  for (const k of times) {
    const p = (t - k) / .6;
    if (p >= 0 && p <= 1) g += C(x, y, 8 + p * 46, 'none', `stroke="${col}" stroke-width="${f1(3 * (1 - p))}" opacity="${f1(1 - p)}"`);
  }
  return g;
}
function soundWaves(x, y, t, n = 3, col = 'rgba(246,168,35,.8)', dir = 1) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const p = ((t * .9 + i / n) % 1);
    const r = 10 + p * 34;
    g += `<path d="M ${f1(x + dir * r * .5)} ${f1(y - r * .8)} Q ${f1(x + dir * r)} ${y} ${f1(x + dir * r * .5)} ${f1(y + r * .8)}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" opacity="${f1(1 - p)}"/>`;
  }
  return g;
}
function bell(x, y, s = 1, o = {}) {
  const body = o.col || '#5f8f6e', rim = '#3e6a52';
  let g = '';
  if (o.glow) g += C(0, 10, 60, 'url(#gWarm)', `opacity="${o.glow}"`);
  g += R(-6, -40, 12, 10, rim, 3);
  g += P(`M -20 -30 Q -24 -30 -24 -18 L -28 14 Q -36 20 -36 26 L 36 26 Q 36 20 28 14 L 24 -18 Q 24 -30 20 -30 Z`, body);
  g += P(`M -36 26 L 36 26 Q 34 32 0 32 Q -34 32 -36 26 Z`, rim);
  g += P(`M -10 -24 Q -14 -6 -16 12`, 'none', 'stroke="rgba(255,255,255,.25)" stroke-width="4" stroke-linecap="round"');
  // Patina-Flecken
  g += E(10, -6, 7, 4, 'rgba(120,200,170,.35)') + E(-14, 8, 5, 3, 'rgba(120,200,170,.35)') + E(18, 16, 6, 3, 'rgba(160,110,60,.35)');
  if (o.clapperGhost) g += L(`M 0 -18 L 0 22`, 'rgba(255,255,255,.55)', 2, 'stroke-dasharray="3 4"') + C(0, 28, 6, 'none', 'stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-dasharray="3 3"');
  return G(`translate(${f1(x)},${f1(y)}) rotate(${o.rot || 0}) scale(${s})`, g);
}
function footprints(pts, col = 'rgba(30,40,45,.55)', size = 1) {
  let g = '';
  pts.forEach((p, i) => {
    const side = i % 2 ? 1 : -1;
    g += G(`translate(${f1(p[0] + side * 4 * size)},${f1(p[1])}) rotate(${f1(p[2] || 0)}) scale(${size})`, E(0, 0, 3, 6, col) + C(0, -8, 2, col));
  });
  return g;
}
