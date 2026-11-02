const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 540 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'profile.html')); await p.evaluate(() => document.fonts.ready);
  for (const n of ['junge', 'laterne', 'schrift']) {
    await p.evaluate(n => window.draw(n, false), n);
    await p.screenshot({ path: path.join(__dirname, 'final', `Profilbild_${n}.png`), clip: { x: 0, y: 0, width: 540, height: 540 } });
    await p.evaluate(n => window.draw(n, true), n);
    await p.screenshot({ path: path.join(__dirname, 'previews', `prof_round_${n}.png`), clip: { x: 0, y: 0, width: 540, height: 540 }, omitBackground: true });
  }
  await b.close(); console.log('ok');
})();
