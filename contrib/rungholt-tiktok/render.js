// node render.js <part> [workers] [maxSeconds]  -> build/part<N>/video_noaudio.mp4 (1080x1920, 30 fps)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30;

async function worker(browser, tl, f0, f1, out) {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: +(process.env.DPR || 2) });
  page.on('pageerror', e => console.error('pageerror', String(e)));
  await page.goto('file://' + path.join(__dirname, 'engine.html'));
  await page.evaluate(tl => window.init(tl), tl);
  await page.evaluate(() => document.fonts.ready);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'faster', '-crf', '20', '-maxrate', '7M', '-bufsize', '14M', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 540, height: 960 } });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 300 === 0) console.log(`  [${out.split('/').pop()}] ${f - f0}/${f1 - f0}`);
  }
  ff.stdin.end();
  await done;
  await page.close();
}

(async () => {
  const part = +process.argv[2], N = +(process.argv[3] || 4), maxS = +(process.argv[4] || 0);
  const dir = path.join(__dirname, 'build', 'part' + part);
  const tl = JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8'));
  const total = Math.ceil((maxS || tl.duration) * FPS);
  const browser = await chromium.launch();
  const t0 = Date.now();
  const segs = [];
  const jobs = [];
  for (let i = 0; i < N; i++) {
    const a = Math.floor(total * i / N), b = Math.floor(total * (i + 1) / N);
    const out = path.join(dir, `seg${i}.mp4`); segs.push(out);
    jobs.push(worker(browser, tl, a, b, out));
  }
  await Promise.all(jobs);
  await browser.close();
  fs.writeFileSync(path.join(dir, 'segs.txt'), segs.map(s => `file '${s}'`).join('\n'));
  await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'segs.txt'), '-c', 'copy', path.join(dir, 'video_noaudio.mp4')], { stdio: 'inherit' }).on('close', c => c === 0 ? res() : rej(c)));
  segs.forEach(s => fs.unlinkSync(s));
  console.log(`Teil ${part}: ${total} Frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
