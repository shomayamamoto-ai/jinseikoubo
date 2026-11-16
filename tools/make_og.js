/*
  人生工房：SNS共有画像（1200×630）をページごとに作る

  使い方：node tools/make_og.js
  （Playwright が必要です。作った画像は assets/og/ に保存されます）

  左：サービスの漢字の印・キャッチコピー・サービス名　右：イラスト　下：ロゴ
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets/og');
fs.mkdirSync(OUT, { recursive: true });

// id, 漢字, 英字, 色, イラスト, 和柄, 背景, キャッチコピー, サービス名
const PAGES = [
  ['tour', '旅', 'INBOUND TOUR', '#a35a2a', 'teacup', 'seigaiha', 'linear-gradient(135deg,#7fb069,#2e5e3e)', '日本の「つくる」に<br>会いにいく旅', 'インバウンドツアー'],
  ['metaverse', '遊', 'METAVERSE', '#5a49b8', 'globe', 'kikko', 'linear-gradient(135deg,#2f2668,#5a49b8)', '遊びながら、<br>世界とつながる', 'メタバース工房'],
  ['academy', '学', 'ACADEMY', '#377853', 'kintsugi', 'shippo', 'linear-gradient(135deg,#2c5a40,#4f8f6a)', '職人と研究者から、<br>直接学ぶ', 'アカデミー'],
  ['channel', '発', 'CHANNEL', '#bc453a', 'camera', 'kikko', 'linear-gradient(135deg,#6b2420,#b2453a)', '誰もが、作り手であり<br>発信者', '工房チャンネル'],
  ['theater', '観', 'THEATER', '#89671c', 'film', 'seigaiha', 'linear-gradient(135deg,#3a2a12,#8a6420)', '作り手の物語を、<br>見放題で', '工房シアター'],
  ['market', '市', 'MARKET', '#36719e', 'print', 'ichimatsu', 'linear-gradient(135deg,#22436e,#3c7fb1)', '手から手へ、<br>価値を手渡す', '工房マーケット'],
  ['fund', '研', 'FUTURE RESEARCH FUND', '#29796f', 'solar', 'seigaiha', 'linear-gradient(135deg,#155a52,#3a9b8f)', '1万円から、<br>未来の研究を支える', '未来研究ファンド'],
];

const sprite = fs.readFileSync(path.join(ROOT, 'assets/logo/_sprite.svg'), 'utf8');
const artJs = fs.readFileSync(path.join(ROOT, 'assets/js/art.js'), 'utf8');

const html = ([id, kanji, en, color, art, pattern, bg, catchJa, name]) => `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;900&family=Shippori+Mincho:wght@800&family=IBM+Plex+Mono:wght@600&display=block" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;overflow:hidden;background:#f2f2f0;color:#1d1d1f;font-family:"Noto Sans JP",sans-serif;position:relative}
  .bar{position:absolute;inset:0 0 auto;height:14px;background:${color}}
  .text{position:absolute;left:72px;top:92px;width:560px}
  .en{display:flex;align-items:center;gap:16px;font:600 20px "IBM Plex Mono",monospace;letter-spacing:.2em;color:#5b5b60}
  .seal{display:grid;place-items:center;width:72px;height:72px;border-radius:8px;background:${color};color:#fff;font:800 44px "Shippori Mincho",serif}
  h1{margin-top:34px;font:800 58px/1.32 "Shippori Mincho",serif;letter-spacing:.03em}
  .name{margin-top:26px;font-weight:700;font-size:26px;color:#5b5b60}
  .art{position:absolute;right:64px;top:92px;width:452px;height:390px;border-radius:24px;overflow:hidden;background:${bg};box-shadow:0 10px 30px rgba(0,0,0,.12)}
  .art svg{position:absolute;inset:0;width:100%;height:100%}
  .logo{position:absolute;left:72px;bottom:52px;display:flex;align-items:center;gap:16px;color:#1d1d1f}
  .logo .m{width:54px;height:54px}.logo .k{height:32px;width:${(32 * 4.0802).toFixed(1)}px}
  .url{position:absolute;right:64px;bottom:62px;font:600 18px "IBM Plex Mono",monospace;color:#5b5b60;letter-spacing:.06em}
</style></head><body>
${sprite}
<div class="bar"></div>
<div class="text"><p class="en"><span class="seal">${kanji}</span>${en}</p><h1>${catchJa}</h1><p class="name">${name}｜人生工房</p></div>
<div class="art" data-art="${art}" data-pattern="${pattern}"></div>
<div class="logo"><svg class="m" viewBox="0 0 100 100"><use href="#lg-mark"/></svg><svg class="k" viewBox="0 0 261.11 64"><use href="#lg-kanji"/></svg></div>
<p class="url">JINSEI KOUBO</p>
<script>${artJs}</script>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const pg of PAGES) {
    await p.setContent(html(pg), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    const file = path.join(OUT, `${pg[0]}.png`);
    await p.screenshot({ path: file });
    console.log('wrote', path.relative(ROOT, file));
  }
  await b.close();
})();
