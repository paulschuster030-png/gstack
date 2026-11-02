// node preview.js <part> [times...]  -> previews/p<part>_<i>.png ; ohne Zeiten: Mitte jedes Beats
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const part = +process.argv[2];
  const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'part' + part, 'timeline.json'), 'utf8'));
  let times = process.argv.slice(3).map(Number);
  if (!times.length) times = tl.beats.map(b => b.stamp ? Math.min(b.t1 - .05, b.stamp.t + .5) : (b.t0 + Math.min(b.t1 - b.t0 - .1, (b.speechEnd - b.t0) * .7)));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, 'engine.html'));
  await page.evaluate(tl => { window.init(tl); }, tl);
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(__dirname, 'previews'), { recursive: true });
  for (let i = 0; i < times.length; i++) {
    try { await page.evaluate(t => window.renderAt(t), times[i]); } catch (e) { errs.push(`t=${times[i]}: ${e}`); }
    await page.screenshot({ path: path.join(__dirname, 'previews', `p${part}_${String(i).padStart(2, '0')}.png`), clip: { x: 0, y: 0, width: 540, height: 960 } });
  }
  await browser.close();
  if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].join('\n'));
  console.log('ok', times.length);
})();
