// node cover.js -> final/RUNGHOLT_Cover_Teil_N.jpg (1080x1920)
// Text sitzt im mittleren 3:4-Bereich, damit er im TikTok-Profilraster nicht abgeschnitten wird.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const HOOK = { 1: 'LAUF NICHT LOS.', 2: 'MACH NICHT AUF.', 3: 'LAUF NICHT HIN.', 4: 'ZIEH NICHT.', 5: 'LEG DICH NICHT HIN.' };
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'engine.html'));
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(__dirname, 'final'), { recursive: true });
  for (let n = 1; n <= 5; n++) {
    const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'part' + n, 'timeline.json'), 'utf8'));
    const b = tl.beats[0], t = b.stamp.t + .6;
    await page.evaluate(([tl, t, n, hook]) => {
      window.init(tl); window.renderAt(t);
      document.querySelectorAll('.cap,.wm,.stamp,.hud,.lab').forEach(e => e.remove());
      const stroke = 'paint-order:stroke fill;-webkit-text-stroke:';
      document.getElementById('ov').insertAdjacentHTML('beforeend', `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,.55) 52%,rgba(0,0,0,.55) 72%,rgba(0,0,0,.1) 100%)"></div>
        <div style="position:absolute;left:0;right:0;top:205px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;letter-spacing:.42em;color:rgba(230,238,240,.85)">GRUSELGESCHICHTE</div>
        <div style="position:absolute;left:50%;top:470px;transform:translate(-50%,-50%) rotate(-5deg);white-space:nowrap;font-weight:900;font-size:24px;letter-spacing:.04em;color:#ff4d4f;border:4px solid #ff4d4f;border-radius:7px;padding:6px 14px 4px;background:rgba(10,14,16,.45)">${hook}</div>
        <div style="position:absolute;left:0;right:0;top:520px;text-align:center;font-weight:900;font-size:${n === 5 ? 74 : 92}px;line-height:1;color:#f6a823;${stroke}11px #0b0f12;text-shadow:0 8px 28px rgba(0,0,0,.6)">${n === 5 ? 'FINALE' : 'TEIL ' + n}</div>
        <div style="position:absolute;left:0;right:0;top:628px;text-align:center;font-weight:900;font-size:50px;line-height:1;color:#fff;${stroke}9px #0b0f12;letter-spacing:.03em;text-shadow:0 6px 22px rgba(0,0,0,.6)">RUNGHOLT</div>
        <div style="position:absolute;left:50%;top:705px;transform:translateX(-50%);white-space:nowrap;background:rgba(244,244,244,.95);color:#0d1114;font-weight:900;font-size:13px;letter-spacing:.14em;padding:7px 16px 6px;border-radius:999px;box-shadow:0 0 0 3px rgba(10,14,16,.9)">TEIL ${n}/5 · ${tl.title.toUpperCase()}</div>`);
    }, [tl, t, n, HOOK[n]]);
    await page.screenshot({ path: path.join(__dirname, 'final', `RUNGHOLT_Cover_Teil_${n}.jpg`), type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 540, height: 960 } });
  }
  await browser.close(); console.log('covers ok');
})();
