// node cover.js -> final/RUNGHOLT_Cover_Teil_N.jpg
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'engine.html'));
  await page.evaluate(() => document.fonts.ready);
  for (let n = 1; n <= 5; n++) {
    const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'part' + n, 'timeline.json'), 'utf8'));
    const b = tl.beats[0], t = b.stamp.t + .6;
    await page.evaluate(([tl, t, n]) => {
      window.init(tl); window.renderAt(t);
      document.querySelectorAll('.cap,.wm').forEach(e => e.remove());
      const ov = document.getElementById('ov');
      ov.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:0;right:0;top:560px;text-align:center;font-weight:900;font-size:58px;color:#fff;-webkit-text-stroke:9px #0b0f12;paint-order:stroke fill;letter-spacing:.02em;text-shadow:0 6px 24px rgba(0,0,0,.6)">RUNGHOLT</div>
        <div style="position:absolute;left:50%;top:660px;transform:translateX(-50%);white-space:nowrap;background:#f6a823;color:#1d1203;font-weight:900;font-size:17px;letter-spacing:.12em;padding:8px 18px 7px;border-radius:999px;box-shadow:0 0 0 3px rgba(10,14,16,.9)">TEIL ${n}/5 · ${tl.title.toUpperCase()}</div>`);
    }, [tl, t, n]);
    await page.screenshot({ path: path.join(__dirname, 'final', `RUNGHOLT_Cover_Teil_${n}.jpg`), type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 540, height: 960 } });
  }
  await browser.close(); console.log('covers ok');
})();
