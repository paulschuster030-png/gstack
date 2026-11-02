// Kern: Zeitachse -> Frame. window.init(timeline), window.renderAt(t)
const SC = window.SC || (window.SC = {});
let TL = null;
const $ = id => document.getElementById(id);
const PILL_COL = {
  orange: ['#f6a823', '#1d1203'], green: ['#33d17a', '#06210f'], teal: ['#5cc8c8', '#062223'],
  red: ['#ff4d4f', '#fff'], white: ['#f4f4f4', '#0d1114'],
};
const CAP_COL = { red: '#ff4d4f', green: '#33d17a', orange: '#f6a823' };
const HUD_TICKS = {
  PEGEL: ['3,0 M', '2,5 M', '2,0 M', '1,5 M', '1,0 M', '0,5 M'],
  TEMP: ['+4°', '0°', '−4°', '−8°', '−12°', '−16°'],
  FLUT: ['0 MIN', '10', '20', '30', '40', '50'],
  KM: ['0 KM', '2', '4', '6', '8', '10'],
};

window.init = function (tl) { TL = tl; window.TL = tl; };
window.SFXT = (name, from = -1e9, to = 1e9) => (window.TL ? window.TL.sfx.filter(x => x.name === name && x.t >= from && x.t <= to).map(x => x.t) : []);

function beatAt(t) {
  const bs = TL.beats;
  for (let i = bs.length - 1; i >= 0; i--) if (t >= bs[i].t0) return bs[i];
  return bs[0];
}
function hudAt(t) {
  const bs = TL.beats; let v = bs[0].hud;
  for (const b of bs) {
    if (t < b.t0) break;
    const prev = v; v = lerp(prev, b.hud, ease((t - b.t0) / 1.4));
  }
  return v;
}
function sceneCtx(b, t) {
  const lt = t - b.scStart, bt = t - b.t0;
  const strip = z => z.replace(/[^\wäöüßÄÖÜ-]/gi, '').toLowerCase();
  const wt = w => { const x = b.words.find(z => strip(z.text) === strip(w)); return x ? x.t0 - b.scStart : null; };
  // alle Beats dieser Szene (für szenenweite Wort-Suche)
  return { t, lt, bt, b, sp: b.sp || {}, wt, dur: b.t1 - b.t0, sdur: sceneEnd(b) - b.scStart, beatOffset: b.t0 - b.scStart };
}
function sceneEnd(b) {
  const bs = TL.beats; let e = b.t1;
  for (let i = b.i + 1; i < bs.length && bs[i].sc === b.sc; i++) e = bs[i].t1;
  return e;
}
function renderScene(b, t) {
  const fn = SC[b.sc];
  if (!fn) return { svg: bg() + TX(270, 300, 'SCENE ' + b.sc, 20, '#f66'), anchors: {} };
  const r = fn(sceneCtx(b, t));
  return typeof r === 'string' ? { svg: r, anchors: {} } : r;
}

window.renderAt = function (t) {
  const b = beatAt(t);
  let sb = b, protocol = b.sc === 'protocol';
  if (protocol) { // Hintergrund = letzte echte Szene, unscharf
    for (let i = b.i - 1; i >= 0; i--) if (TL.beats[i].sc !== 'protocol') { sb = TL.beats[i]; break; }
  }
  const r = renderScene(sb, protocol ? Math.min(t, sb.t1 + 3) : t);
  // Kamera: langsamer Zoom + kleiner Pop beim Szenenwechsel
  const se = sceneEnd(sb), k = clamp((t - sb.scStart) / Math.max(1, se - sb.scStart));
  const pop = b.scStart === b.t0 || protocol ? (1 - easeOut((t - b.t0) / .35)) * .035 : 0;
  const z = 1 + .045 * ease(k) + pop;
  const cx = 270, cy = 430;
  const cam = `translate(${cx},${cy}) scale(${z.toFixed(4)}) translate(${-cx},${-cy})`;
  const filt = protocol ? 'filter:blur(7px) brightness(.55);' : '';
  $('scene').innerHTML = `<svg viewBox="0 0 540 960" width="540" height="960" style="${filt}">${DEFS}<g transform="${cam}">${r.svg}</g></svg>`;
  const anc = {};
  for (const [kk, [x, y]] of Object.entries(r.anchors || {})) anc[kk] = [cx + (x - cx) * z, cy + (y - cy) * z];

  let ov = '';
  // Label oben
  ov += `<div class="lab">${b.lab}</div>`;
  // Wasserzeichen (wechselt die Ecke)
  ov += `<div class="wm ${b.i % 3 === 1 ? 'wmB' : 'wmT'}">RUNGHOLT · TEIL ${TL.part}/5</div>`;
  // HUD-Skala links
  ov += hudHtml(hudAt(t));
  // Stempel
  if (b.stamp && t >= b.stamp.t) {
    const p = (t - b.stamp.t) / .18;
    const sc = p < 1 ? lerp(1.7, 1, easeOut(p)) : 1, op = clamp(p * 1.4);
    const sh = p >= 1 && p < 2.2 ? Math.sin((p - 1) * 30) * 1.5 * (2.2 - p) : 0;
    const c = b.stamp.color === 'orange' ? '#f6a823' : '#ff4d4f';
    ov += `<div class="stamp" style="color:${c};border-color:${c};opacity:${op};transform:translate(-50%,-50%) rotate(-7deg) scale(${sc}) translateX(${sh}px)">${b.stamp.text}</div>`;
  }
  // Pills
  const pills = [];
  for (const bb of TL.beats) {
    for (const p of bb.pills) {
      const until = p.pos === 'end' ? TL.duration + 1 : bb.t1;
      if (bb === b || (p.pos === 'end' && bb.t0 <= t)) if (t >= p.t && t < until) pills.push(p);
    }
  }
  let stackB = 0;
  for (const p of pills) {
    const pp = clamp((t - p.t) / .22), s = lerp(.5, 1, easeBack(pp));
    const [bgc, fg] = PILL_COL[p.color] || PILL_COL.white;
    let x = 270, y = 668, cls = 'pill';
    if (p.pos === 'bottom') { y = 668 + stackB * 34; stackB++; }
    else if (p.pos === 'bottom2') { y = 702; }
    else if (p.pos === 'under') { y = 672; }
    else if (p.pos === 'end') { y = 880; cls += ' pillEnd'; }
    else if (anc[p.pos]) { [x, y] = anc[p.pos]; }
    else { y = 668 + stackB * 34; stackB++; }
    ov += `<div class="${cls}" style="left:${x}px;top:${y}px;background:${bgc};color:${fg};opacity:${pp};transform:translate(-50%,-50%) scale(${s})">${p.text}</div>`;
  }
  // Protokoll-Karte
  if (b.card) ov += cardHtml(b.card, t - b.t0);
  // Untertitel (ein Wort)
  let w = null;
  for (const x of b.words) if (t >= x.t0 - .02) w = x;
  if (!w && b.i > 0) { const pb = TL.beats[b.i - 1]; if (t - b.t0 < .05) w = pb.words[pb.words.length - 1]; }
  if (w && t < b.t1 + .02 && b.sc !== 'follow') {
    const p = clamp((t - w.t0) / .12), s = lerp(1.18, 1, easeOut(p));
    const fade = b.t1 - b.speechEnd > .7 && t > b.speechEnd + .45 ? clamp(1 - (t - b.speechEnd - .45) / .25) : 1;
    const col = CAP_COL[w.color] || '#fff';
    ov += `<div class="cap" style="color:${col};opacity:${fade};transform:translate(-50%,-50%) scale(${s.toFixed(3)})">${w.text.toUpperCase()}</div>`;
  }
  $('ov').innerHTML = ov;
  // Körnung
  const gx = Math.floor(hash(Math.floor(t * 8)) * 200), gy = Math.floor(hash(Math.floor(t * 8) + 5) * 200);
  $('grain').style.backgroundPosition = `${gx}px ${gy}px`;
};

function hudHtml(v) {
  const ticks = HUD_TICKS[TL.hudLabel] || HUD_TICKS.PEGEL;
  const y0 = 150, y1 = 860;
  let h = `<div class="hud">`;
  for (let i = 0; i <= 30; i++) {
    const y = y0 + (y1 - y0) * i / 30, big = i % 6 === 0;
    h += `<div class="tick${big ? ' big' : ''}" style="top:${y}px"></div>`;
    if (big) h += `<div class="tl" style="top:${y}px">${ticks[i / 6] || ''}</div>`;
  }
  const my = y1 - (y1 - y0) * v;
  h += `<div class="hm" style="top:${my}px"></div><div class="hl">${TL.hudLabel}</div></div>`;
  return h;
}
function cardHtml(card, bt) {
  const p = easeBack(clamp(bt / .3));
  let h = `<div class="card" style="opacity:${clamp(bt / .2)};transform:translate(-50%,-50%) scale(${lerp(.85, 1, p)})">`;
  h += `<div class="ch">PROTOKOLL</div><div class="ct">${card.title}</div>`;
  card.items.forEach((it, i) => {
    const on = bt > .5 + i * .38;
    const pk = clamp((bt - .5 - i * .38) / .15);
    h += `<div class="ci"><span class="cn">${i + 1}</span><span class="cx">${it}</span><span class="cb${on ? ' on' : ''}" style="transform:scale(${on ? lerp(1.4, 1, pk) : 1})">${on ? '✓' : ''}</span></div>`;
  });
  return h + '</div>';
}
