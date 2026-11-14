/* =========================================================
   人生工房 ― イラスト（SVG）
   絵文字の仮置きをやめ、すべてのサムネイルを同じ描き方でそろえる。
   ・光は左上から、影は右下へ（光の向きと色温度を統一）
   ・本体は生成り色、細部は墨色、差し色は金と朱
   ・背景には和柄（青海波・七宝・市松・亀甲）を薄く重ねる
   ========================================================= */
(() => {
  "use strict";
  const CREAM = "#fbf6ec", INK = "#2a2622", GOLD = "#d9a441", SHU = "#c33e25";

  /* ---------- 和柄（ページに1度だけ定義する） ---------- */
  const PATTERNS = `
    <pattern id="jk-p-seigaiha" width="40" height="20" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#fff" stroke-width="1.4">
        <circle cx="20" cy="20" r="18"/><circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="6"/>
        <circle cx="0" cy="10" r="18"/><circle cx="0" cy="10" r="12"/><circle cx="40" cy="10" r="18"/><circle cx="40" cy="10" r="12"/>
      </g>
    </pattern>
    <pattern id="jk-p-shippo" width="32" height="32" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#fff" stroke-width="1.4"><circle cx="0" cy="0" r="16"/><circle cx="32" cy="0" r="16"/><circle cx="0" cy="32" r="16"/><circle cx="32" cy="32" r="16"/><circle cx="16" cy="16" r="16"/></g>
    </pattern>
    <pattern id="jk-p-ichimatsu" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="#fff"/><rect x="14" y="14" width="14" height="14" fill="#fff"/>
    </pattern>
    <pattern id="jk-p-kikko" width="30" height="52" patternUnits="userSpaceOnUse">
      <path d="M15 0 L30 9 V26 L15 35 L0 26 V9 Z M15 35 V52 M0 26 L-15 35 M30 26 L45 35" fill="none" stroke="#fff" stroke-width="1.4"/>
    </pattern>`;

  /* ---------- 絵柄（100×100 の格子で描く） ---------- */
  // 各要素：[パス, 塗り, 不透明度?, 線?]
  const I = {
    teacup: [
      ["M18 50H82C80 72 66 84 50 84C34 84 20 72 18 50Z", CREAM],
      ["M18 50A32 6 0 0 1 82 50A32 6 0 0 1 18 50Z", "#7fae5e"],
      ["M38 84H62V89H38Z", CREAM],
      ["M42 40C37 32 47 27 42 18M56 40C51 32 61 27 56 18", "none", 0.85, CREAM],
    ],
    vase: [
      ["M38 16H62V25C62 30 76 36 78 54C80 72 67 86 50 86C33 86 20 72 22 54C24 36 38 30 38 25Z", CREAM],
      ["M26 56C40 63 60 63 74 56", "none", 0.55, INK],
      ["M30 68C42 74 58 74 70 68", "none", 0.35, INK],
      ["M36 14H64V19H36Z", "#c9a86a"],
    ],
    knife: [
      ["M40 45H84C91 45 94 52 89 59L40 62Z", "#eef1f4"],
      ["M40 58L89 57", "none", 0.35, INK],
      ["M12 47H40V61H12C9 61 8 59 8 54C8 49 9 47 12 47Z", "#6b4a2b"],
      ["M38 45H43V63H38Z", "#c9b27a"],
    ],
    kiriko: [
      ["M28 24H72L65 86H35Z", "rgba(255,255,255,.88)"],
      ["M31 40L50 56L69 40M33 58L50 72L67 58M50 26V86M30 32L70 32", "none", 0.75, "#2f6fb5"],
    ],
    farmhouse: [
      ["M12 56L50 20L88 56Z", "#c9a86a"],
      ["M21 48L50 20L79 48C70 45 60 47 50 42C40 47 30 45 21 48Z", "#fff"],
      ["M22 56H78V84H22Z", CREAM],
      ["M44 64H56V84H44Z", INK, 0.75],
      ["M28 62H38V70H28ZM62 62H72V70H62Z", "#e8b34a", 0.9],
    ],
    rice: [
      ["M50 88C50 64 54 44 68 24M40 88C40 70 36 54 26 40M60 88C62 72 70 60 82 52", "none", 0.95, "#f2d16b"],
      ["M64 30a4 7 30 1 0 1 0ZM60 40a4 7 30 1 0 1 0ZM56 50a4 7 30 1 0 1 0ZM30 46a4 7-30 1 0 1 0ZM34 56a4 7-30 1 0 1 0ZM74 56a4 7 60 1 0 1 0ZM68 62a4 7 60 1 0 1 0Z", "#f2d16b"],
    ],
    woodwork: [
      ["M20 56H80C78 74 66 84 50 84C34 84 22 74 20 56Z", "#b07a45"],
      ["M20 56A30 5 0 0 1 80 56A30 5 0 0 1 20 56Z", "#d39b62"],
      ["M30 16L66 52M40 14L72 48", "none", 1, "#7a4f27"],
    ],
    kintsugi: [
      ["M16 50H84C82 72 67 84 50 84C33 84 18 72 16 50Z", CREAM],
      ["M16 50A34 6 0 0 1 84 50A34 6 0 0 1 16 50Z", "#e9e2d4"],
      ["M38 52L44 62L40 70L50 82M60 54L58 64L66 72", "none", 1, GOLD],
    ],
    solar: [
      ["M72 26m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0", "#ffd36b"],
      ["M14 60L58 50L86 70L40 82Z", "#22315a"],
      ["M25 58L52 77M36 55L64 74M47 53L75 72M19 66L64 56M28 73L73 63", "none", 0.6, CREAM],
    ],
    speech: [
      ["M12 22H58C62 22 64 24 64 28V48C64 52 62 54 58 54H30L20 64V54H12C8 54 6 52 6 48V28C6 24 8 22 12 22Z", CREAM],
      ["M42 46H88C92 46 94 48 94 52V72C94 76 92 78 88 78H80V88L70 78H42C38 78 36 76 36 72V52C36 48 38 46 42 46Z", "#ffd36b"],
      ["M18 34H52M18 42H42M48 58H82M48 66H72", "none", 0.6, INK],
    ],
    camera: [
      ["M26 28H44L48 36H80C84 36 86 38 86 42V76C86 80 84 82 80 82H20C16 82 14 80 14 76V42C14 38 16 36 20 36H22Z", CREAM],
      ["M50 59m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0", INK],
      ["M50 59m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0", "#6aa9c9"],
      ["M70 44H78V50H70Z", SHU],
    ],
    cube: [
      ["M50 16L82 34L50 52L18 34Z", "#ffffff"],
      ["M18 34L50 52V88L18 70Z", "#dcd6f7"],
      ["M82 34L50 52V88L82 70Z", "#9d92e0"],
    ],
    sake: [
      ["M44 14H56V22C56 27 72 40 72 60C72 76 63 86 50 86C37 86 28 76 28 60C28 40 44 27 44 22Z", CREAM],
      ["M33 58H67", "none", 0.5, "#2f6fb5"],
      ["M74 70H92L88 86H78Z", CREAM],
    ],
    coin: [
      ["M50 52m-32 0a32 32 0 1 0 64 0a32 32 0 1 0-64 0", GOLD],
      ["M50 52m-24 0a24 24 0 1 0 48 0a24 24 0 1 0-48 0", "none", 0.6, "#fff3c4"],
      ["M38 36L50 52L62 36M50 52V70M40 56H60M40 63H60", "none", 1, "#7a5a12"],
    ],
    atom: [
      ["M50 50m-34 0a34 13 0 1 0 68 0a34 13 0 1 0-68 0", "none", 0.95, CREAM],
      ["M50 50m-34 0a34 13 0 1 0 68 0a34 13 0 1 0-68 0", "none", 0.95, CREAM, "rotate(60 50 50)"],
      ["M50 50m-34 0a34 13 0 1 0 68 0a34 13 0 1 0-68 0", "none", 0.95, CREAM, "rotate(-60 50 50)"],
      ["M50 50m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0", "#ffd36b"],
    ],
    onsen: [
      ["M14 72C14 62 32 58 50 58C68 58 86 62 86 72C86 80 68 86 50 86C32 86 14 80 14 72Z", "#9fd3e6"],
      ["M36 52C30 44 42 38 36 28M50 52C44 42 56 36 50 22M64 52C58 44 70 38 64 28", "none", 1, CREAM],
    ],
    globe: [
      ["M50 50m-34 0a34 34 0 1 0 68 0a34 34 0 1 0-68 0", "rgba(255,255,255,.18)"],
      ["M50 50m-34 0a34 34 0 1 0 68 0a34 34 0 1 0-68 0M50 16C36 30 36 70 50 84M50 16C64 30 64 70 50 84M16 50H84M22 32H78M22 68H78", "none", 1, CREAM],
    ],
    radio: [
      ["M14 36H86C88 36 90 38 90 40V80C90 82 88 84 86 84H14C12 84 10 82 10 80V40C10 38 12 36 14 36Z", "#c9a86a"],
      ["M34 60m-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0", INK, 0.8],
      ["M58 48H82V58H58Z", CREAM],
      ["M60 66H80M60 72H80", "none", 0.6, INK],
      ["M30 36L64 14", "none", 1, INK],
    ],
    stole: [
      ["M12 30C30 20 44 40 60 30C72 22 82 24 90 30V54C82 48 72 46 60 54C44 64 30 44 12 54Z", "#3c5c9a"],
      ["M12 62C30 52 44 72 60 62C72 54 82 56 90 62V76C82 70 72 68 60 76C44 86 30 66 12 76Z", "#5a7cc0"],
      ["M20 36V48M32 32V46M46 36V52M70 32V48M80 30V44", "none", 0.6, CREAM],
    ],
    print: [
      ["M14 16H86V84H14Z", CREAM],
      ["M20 22H80V78H20Z", "#dfe8f1"],
      ["M20 78L40 46L52 60L62 48L80 78Z", "#2f4f7a"],
      ["M36 52L40 46L44 52Z", "#fff"],
      ["M66 32m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0", SHU],
    ],
    kimono: [
      ["M30 20L50 30L70 20L88 38L76 50L70 46V86H30V46L24 50L12 38Z", SHU],
      ["M30 54H70V62H30Z", GOLD],
      ["M50 30L42 54H58Z", CREAM],
    ],
    gamepad: [
      ["M24 36H76C86 36 92 46 90 60C88 74 80 80 72 72L64 64H36L28 72C20 80 12 74 10 60C8 46 14 36 24 36Z", CREAM],
      ["M26 50H40M33 43V57", "none", 1, INK],
      ["M66 47m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M74 55m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0", SHU],
    ],
    shop: [
      ["M14 40L22 22H78L86 40Z", SHU],
      ["M18 40H82V84H18Z", CREAM],
      ["M30 54H48V84H30Z", INK, 0.75],
      ["M56 54H72V68H56Z", "#9fd3e6"],
    ],
    classroom: [
      ["M10 38L50 20L90 38L50 56Z", CREAM],
      ["M26 46V64C26 70 38 76 50 76C62 76 74 70 74 64V46L50 56Z", "#e9e2d4"],
      ["M86 40V64", "none", 1, GOLD],
      ["M86 66m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0", GOLD],
    ],
    film: [
      ["M14 30H86V80H14Z", CREAM],
      ["M42 44L62 55L42 66Z", SHU],
      ["M14 22L86 22L84 30H16Z", INK, 0.85],
      ["M24 22L30 30M40 22L46 30M56 22L62 30M72 22L78 30", "none", 1, CREAM],
    ],
    battery: [
      ["M22 30H74V82H22Z", CREAM],
      ["M38 22H58V30H38Z", CREAM],
      ["M52 38L38 58H50L44 76L62 52H50Z", "#2f8c80"],
    ],
  };
  // 絵文字 → 絵柄（データの書きかえを最小にするための対応表）
  const EMOJI = {
    "🍵": "teacup", "🏺": "vase", "🔪": "knife", "🎐": "kiriko", "🏔️": "farmhouse", "🌾": "rice",
    "🪵": "woodwork", "🧵": "kintsugi", "☀️": "solar", "🗣️": "speech", "🎥": "camera", "🧊": "cube",
    "🍶": "sake", "💹": "coin", "⚛️": "atom", "🗾": "onsen", "🌐": "globe", "📻": "radio", "🧣": "stole",
    "🎴": "print", "📷": "camera", "🪆": "kimono", "🔬": "atom", "🧳": "onsen", "🎮": "gamepad",
    "🏪": "shop", "🎓": "classroom", "🎬": "film", "🔋": "battery",
  };
  const keyOf = (k) => EMOJI[k] || k;

  const draw = (key) => (I[keyOf(key)] || I.globe).map(([d, fill, op = 1, stroke, tf]) =>
    `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"` : ""}${op < 1 ? ` opacity="${op}"` : ""}${tf ? ` transform="${tf}"` : ""}/>`).join("");

  /** サムネイル：和柄＋左上からの光＋絵柄＋右下への影 */
  const thumb = (key, { pattern = "seigaiha", ratio = "16 / 10" } = {}) => {
    const [w, h] = ratio === "2 / 3" ? [200, 300] : ratio === "16 / 9" ? [320, 180] : [320, 200];
    const s = Math.min(w, h) * 0.56, x = (w - s) / 2, y = (h - s) / 2 - h * 0.02;
    return `<svg class="art" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="${w}" height="${h}" fill="url(#jk-p-${pattern})" opacity=".13"/>
      <circle cx="${w * 0.12}" cy="${h * 0.04}" r="${Math.max(w, h) * 0.55}" fill="#fff" opacity=".12"/>
      <ellipse cx="${w / 2 + s * 0.08}" cy="${y + s * 0.93}" rx="${s * 0.42}" ry="${s * 0.07}" fill="#000" opacity=".22"/>
      <g transform="translate(${x} ${y}) scale(${s / 100})">${draw(key)}</g>
    </svg>`;
  };
  /** 絵柄だけ（アイコンとして小さく使う） */
  const icon = (key, size = 24) => `<svg class="art-icon" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${draw(key)}</svg>`;
  /** キャンバス用のパス（メタバースのデモで使う） */
  const paths = (key) => (I[keyOf(key)] || I.globe).map(([d, fill, op = 1, stroke, tf]) => ({ d, fill, op, stroke, tf }));
  /** 和柄だけの背景（シアターのポスターなど） */
  const patternBg = (pattern = "seigaiha", w = 200, h = 300) =>
    `<svg class="art" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="${w}" height="${h}" fill="url(#jk-p-${pattern})" opacity=".14"/><circle cx="${w * 0.15}" cy="0" r="${h * 0.7}" fill="#fff" opacity=".1"/></svg>`;

  // 和柄の定義を body の先頭に1度だけ置く
  const mount = () => {
    if (document.getElementById("jk-patterns")) return;
    document.body.insertAdjacentHTML("afterbegin", `<svg id="jk-patterns" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${PATTERNS}</defs></svg>`);
    document.querySelectorAll("[data-art]").forEach((el) => { el.innerHTML = thumb(el.dataset.art, { pattern: el.dataset.pattern || "seigaiha" }); });
    document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon, 40); });
  };
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  window.JKArt = { thumb, icon, paths, patternBg, keyOf };
})();
