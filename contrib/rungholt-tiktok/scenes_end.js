// Ende jedes Teils: Teaser auf den nächsten Teil + Folgen-Karte (Plus -> Haken -> verschwindet)
(function () {
  SC.teaser = c => {
    const fn = SC[c.sp.scene];
    const r = fn ? fn(Object.assign({}, c, { sp: {} })) : bg();
    const svg = typeof r === 'string' ? r : r.svg;
    // kurzes Flackern beim Einstieg, wie ein alter Projektor
    const fl = c.bt < .45 ? (hash(Math.floor(c.t * 24)) > .55 ? .35 : .9) : 1;
    let s = O(fl, svg);
    s += R(0, 0, W, H, 'rgba(3,7,10,.3)') + R(0, 0, W, H, 'rgba(110,20,20,.08)');
    for (let i = 0; i < 48; i++) s += R(0, i * 20, W, 2, 'rgba(0,0,0,.18)');
    return { svg: s };
  };

  SC.follow = c => {
    const { bt, sp, t } = c;
    const nxt = sp.next || 0;
    let s = bg() + C(270, 320, 260, 'url(#gWarm)', 'opacity=".16"');
    const ax = 270, ay = 300, ar = 64;
    // Profilbild (Laterne als Serien-Logo)
    const ap = easeBack(clamp(bt / .35));
    let av = C(ax, ay, ar + 5, '#f4f4f4') + C(ax, ay, ar, '#0f2a33') + C(ax, ay + 8, ar - 6, 'url(#gWarm)', 'opacity=".55"');
    av += lantern(ax, ay - 40, 1.75, 1, Math.sin(t * 2) * 5, 0);
    s += G(`translate(${ax},${ay}) scale(${f1(ap * 100) / 100}) translate(${-ax},${-ay})`, av);
    // Plus-Badge -> Haken -> weg
    const TAP = .55, bx = ax, by = ay + ar;
    const out = clamp((bt - 1.55) / .35);
    const bs = (bt < TAP ? 1 + Math.sin(bt * 14) * .05 : (bt < TAP + .12 ? lerp(.82, 1.12, (bt - TAP) / .12) : lerp(1.12, 1, clamp((bt - TAP - .12) / .15)))) * (1 - easeOut(out)) * ap;
    if (bs > .01) {
      const k = clamp((bt - TAP) / .25); // Morph Plus -> Haken
      let b = C(0, 0, 18, '#fe2c55') + C(0, 0, 18, 'none', 'stroke="#fff" stroke-width="3"');
      if (k < 1) b += G(`rotate(${f1(k * 90)})`, R(-8, -2.2, 16, 4.4, '#fff', 2) + R(-2.2, -8, 4.4, 16, '#fff', 2), `opacity="${f1((1 - k) * 100) / 100}"`);
      if (k > 0) b += `<path d="M -7 0 L -2 5 L 8 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24" stroke-dashoffset="${f1(24 * (1 - k))}"/>`;
      s += G(`translate(${bx},${by}) scale(${f1(bs * 100) / 100})`, b, `opacity="${f1((1 - out) * 100) / 100}"`);
    }
    // Finger-Tipp
    const fk = clamp((bt - .15) / (TAP - .15));
    if (bt < TAP + .35) {
      const fx = lerp(370, bx + 6, easeOut(fk)), fy = lerp(470, by + 8, easeOut(fk));
      const press = bt > TAP - .06 && bt < TAP + .14 ? .8 : 1;
      s += C(fx, fy, 15 * press, 'rgba(255,255,255,.35)', 'stroke="rgba(255,255,255,.8)" stroke-width="2"') + `<g opacity="${f1(clamp(1 - (bt - TAP) / .35) * 100) / 100}"></g>`;
    }
    const rp = (bt - TAP) / .45;
    if (rp > 0 && rp < 1) s += C(bx, by, 18 + rp * 40, 'none', `stroke="rgba(255,255,255,${f1((1 - rp) * .8 * 100) / 100})" stroke-width="3"`);
    // Texte
    const tk = easeBack(clamp((bt - .2) / .3));
    s += G(`translate(270,470) scale(${f1(tk * 100) / 100})`,
      TX(0, 0, 'FOLGT FÜR', 32, '#fff', { w: 900, ex: 'stroke="#0b0f12" stroke-width="7" paint-order="stroke"' }) +
      TX(0, 62, nxt === 5 ? 'DAS FINALE' : nxt ? `TEIL ${nxt}` : 'MEHR GRUSEL', 54, COL.orange, { w: 900, ex: 'stroke="#0b0f12" stroke-width="8" paint-order="stroke"' }));
    const sk = clamp((bt - .7) / .3);
    s += O(sk, TX(270, 600, nxt ? `RUNGHOLT · TEIL ${nxt}/5` : 'RUNGHOLT · ENDE', 11, 'rgba(214,226,230,.7)', { mono: 1, w: 500, ls: 3 }));
    return { svg: s };
  };
})();
