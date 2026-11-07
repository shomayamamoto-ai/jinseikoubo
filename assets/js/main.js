/* =========================================================
   人生工房 ― スクリプト
   ここにあるデータはすべてデモ用のサンプルです。
   本番では、APIやデータベースから取得する想定です。

   言語切り替え（日本語／English）
   ・HTMLには日本語を書き、英語は下の I18N_STATIC から差し替えます。
   ・商品や講座などのデータは、各項目に英語（en）を持たせています。
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 言語の決定 ---------- */
  const LANG_KEY = "jinseikoubo-lang";
  let lang = "ja";
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ja" || saved === "en") lang = saved;
    else if (!(navigator.language || "ja").toLowerCase().startsWith("ja")) lang = "en"; // 海外からの訪問者は英語で表示
  } catch (_) { /* 保存不可の環境では日本語 */ }
  const tr = (ja, en) => (lang === "en" ? en : ja);

  /* ---------- トースト通知 ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2600);
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-toast]");
    if (t) { e.preventDefault(); toast(t.dataset.toast); }
  });
  const T = {
    demoBook: () => tr("予約はデモのため利用できません", "Booking is not available in this demo"),
    demoEnroll: () => tr("受講申込はデモのため利用できません", "Enrollment is not available in this demo"),
    demoPlay: () => tr("デモのため再生できません", "Playback is not available in this demo"),
    demoBuy: () => tr("購入はデモのため利用できません", "Purchasing is not available in this demo"),
  };

  /* ---------- ナビゲーション（スマホ用メニュー） ---------- */
  const navToggle = $(".nav-toggle");
  const nav = $("#nav");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? tr("メニューを閉じる", "Close menu") : tr("メニューを開く", "Open menu"));
  };
  navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* =======================================================
     01 インバウンドツアー
     ======================================================= */
  const tours = [
    { area: "kyoto", emoji: "🍵", bg: "linear-gradient(135deg,#7fb069,#2e5e3e)", price: 28000, lang: ["EN", "中文"],
      ja: { title: "京都・宇治で茶師と過ごす一日", text: "茶畑の見学から、茶師と一緒に行う手もみ体験、最後はお茶会まで。", days: "日帰り" },
      en: { title: "A day with a tea master in Uji, Kyoto", text: "Walk the tea fields, hand-roll tea leaves with a tea master, and finish with a tea ceremony.", days: "Day trip" } },
    { area: "kyoto", emoji: "🏺", bg: "linear-gradient(135deg,#d4a373,#7f4f24)", price: 18000, lang: ["EN", "FR"],
      ja: { title: "清水焼の窯元でつくる自分だけの器", text: "職人の手ほどきでろくろを体験。焼き上げた器は海外へ配送します。", days: "半日" },
      en: { title: "Make your own Kiyomizu-yaki pottery", text: "Try the potter's wheel with an artisan. We ship your fired piece to your home overseas.", days: "Half day" } },
    { area: "tokyo", emoji: "🔪", bg: "linear-gradient(135deg,#8d99ae,#2b2d42)", price: 22000, lang: ["EN", "ES"],
      ja: { title: "東京・下町の刃物職人をたずねて", text: "研ぎの技を間近で見学し、自分の包丁を研ぐ体験ができます。", days: "半日" },
      en: { title: "Visit a knife maker in old Tokyo", text: "Watch expert sharpening up close, then sharpen a knife of your own.", days: "Half day" } },
    { area: "tokyo", emoji: "🎐", bg: "linear-gradient(135deg,#90e0ef,#0077b6)", price: 16000, lang: ["EN", "한국어"],
      ja: { title: "江戸切子と夜の下町さんぽ", text: "ガラス工房でのカット体験のあと、ガイドと夜の路地を歩きます。", days: "夕方〜夜" },
      en: { title: "Edo Kiriko glass and an evening walk", text: "Cut glass at a local studio, then stroll the old-town alleys at night with a guide.", days: "Evening" } },
    { area: "local", emoji: "🏔️", bg: "linear-gradient(135deg,#a8dadc,#457b9d)", price: 98000, lang: ["EN", "中文"],
      ja: { title: "雪国の古民家に泊まる3日間", text: "かやぶき屋根の宿に泊まり、わら細工や郷土料理づくりを体験します。", days: "2泊3日" },
      en: { title: "Three days in a snow-country farmhouse", text: "Stay under a thatched roof and learn straw crafts and local home cooking.", days: "3 days, 2 nights" } },
    { area: "local", emoji: "🌾", bg: "linear-gradient(135deg,#f4d35e,#ee964b)", price: 54000, lang: ["EN", "DE"],
      ja: { title: "棚田の米づくりと酒蔵めぐり", text: "田植え・稲刈りの季節限定。酒蔵での試飲（20歳以上）付き。", days: "1泊2日" },
      en: { title: "Rice terraces and sake breweries", text: "Planting and harvest seasons only. Includes a brewery tasting (ages 20 and over).", days: "2 days, 1 night" } },
  ];
  let tourArea = "all";
  const renderTours = () => {
    $("#tourList").innerHTML = tours
      .filter((t) => tourArea === "all" || t.area === tourArea)
      .map((t) => { const d = t[lang]; return `
        <article class="card reveal">
          <div class="card__thumb" style="--thumb:${t.bg}"><span aria-hidden="true">${t.emoji}</span><span class="card__label">${esc(d.days)}</span></div>
          <div class="card__body">
            <h3 class="card__title">${esc(d.title)}</h3>
            <p class="card__text">${esc(d.text)}</p>
            <div class="lang" aria-label="${tr("対応言語", "Guide languages")}">${t.lang.map((l) => `<span>${esc(l)}</span>`).join("")}</div>
            <div class="card__foot">
              <p class="price">${yen(t.price)}<small>${tr("／人〜", " / person")}</small></p>
              <button class="btn btn--primary btn--sm" data-toast="${T.demoBook()}">${tr("予約する", "Book now")}</button>
            </div>
          </div>
        </article>`; }).join("");
    observeReveal();
  };
  $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-filter]").forEach((x) => x.classList.toggle("is-active", x === b));
    tourArea = b.dataset.filter;
    renderTours();
  }));

  /* =======================================================
     03 アカデミー
     ======================================================= */
  const courses = [
    { type: "video", emoji: "🪵", bg: "linear-gradient(135deg,#bc6c25,#606c38)", price: 9800, rate: 4.8,
      ja: { title: "はじめての木工：箸と器をつくる", teacher: "木工作家 A", time: "全12回・約6時間" },
      en: { title: "Intro to woodworking: chopsticks and bowls", teacher: "Woodworker A", time: "12 lessons · about 6 hrs" } },
    { type: "live", emoji: "🧵", bg: "linear-gradient(135deg,#ffafcc,#cdb4db)", price: 6500, rate: 4.9,
      ja: { title: "金継ぎライブワークショップ", teacher: "漆芸家 B", time: "11/23（土）14:00〜" },
      en: { title: "Kintsugi live workshop", teacher: "Lacquer artist B", time: "Sat, Nov 23, 14:00 JST" } },
    { type: "video", emoji: "☀️", bg: "linear-gradient(135deg,#ffd166,#ef476f)", price: 0, rate: 4.7,
      ja: { title: "高校生でもわかる次世代太陽電池", teacher: "研究者 C", time: "全8回・約3時間" },
      en: { title: "Next-generation solar cells, made simple", teacher: "Researcher C", time: "8 lessons · about 3 hrs" } },
    { type: "live", emoji: "🗣️", bg: "linear-gradient(135deg,#8ecae6,#219ebc)", price: 4000, rate: 4.6,
      ja: { title: "訪日ガイドのための英会話実践", teacher: "通訳ガイド D", time: "毎週水曜 20:00〜" },
      en: { title: "Practical English for tour guides", teacher: "Licensed guide D", time: "Wednesdays, 20:00 JST" } },
    { type: "video", emoji: "🎥", bg: "linear-gradient(135deg,#adb5bd,#343a40)", price: 7800, rate: 4.5,
      ja: { title: "スマホで撮る！職人ドキュメンタリー入門", teacher: "映像作家 E", time: "全10回・約4時間" },
      en: { title: "Film an artisan documentary on your phone", teacher: "Filmmaker E", time: "10 lessons · about 4 hrs" } },
    { type: "video", emoji: "🧊", bg: "linear-gradient(135deg,#b8c0ff,#5e60ce)", price: 12800, rate: 4.6,
      ja: { title: "メタバース空間デザインの基礎", teacher: "3Dデザイナー F", time: "全15回・約8時間" },
      en: { title: "Metaverse space design basics", teacher: "3D designer F", time: "15 lessons · about 8 hrs" } },
    { type: "live", emoji: "🍶", bg: "linear-gradient(135deg,#e9edc9,#a3b18a)", price: 5500, rate: 4.8,
      ja: { title: "酒蔵と学ぶ日本酒の楽しみ方", teacher: "杜氏 G", time: "12/7（土）19:00〜" },
      en: { title: "Enjoying sake, with a brewery", teacher: "Master brewer G", time: "Sat, Dec 7, 19:00 JST" } },
    { type: "video", emoji: "💹", bg: "linear-gradient(135deg,#95d5b2,#1b4332)", price: 0, rate: 4.4,
      ja: { title: "研究を応援する前に知っておきたいお金の基礎", teacher: "ファイナンシャルプランナー H", time: "全6回・約2時間" },
      en: { title: "Money basics before you back research", teacher: "Financial planner H", time: "6 lessons · about 2 hrs" } },
  ];
  let courseType = "all";
  const renderCourses = () => {
    $("#courseList").innerHTML = courses
      .filter((c) => courseType === "all" || c.type === courseType)
      .map((c) => { const d = c[lang]; return `
        <article class="card reveal">
          <div class="card__thumb" style="--thumb:${c.bg}"><span aria-hidden="true">${c.emoji}</span>
            <span class="card__label ${c.type === "live" ? "card__label--live" : ""}">${c.type === "live" ? "● LIVE" : tr("録画講座", "On demand")}</span></div>
          <div class="card__body">
            <h3 class="card__title">${esc(d.title)}</h3>
            <p class="card__meta"><span>👤 ${esc(d.teacher)}</span><span>🕒 ${esc(d.time)}</span></p>
            <p class="stars" aria-label="${tr("評価", "Rating")} ${c.rate}">★ ${c.rate.toFixed(1)}</p>
            <div class="card__foot">
              <p class="price">${c.price === 0 ? tr("無料", "Free") : yen(c.price)}</p>
              <button class="btn btn--primary btn--sm" data-toast="${T.demoEnroll()}">${c.type === "live" ? tr("参加する", "Join") : tr("受講する", "Enroll")}</button>
            </div>
          </div>
        </article>`; }).join("");
    observeReveal();
  };
  $$(".tab").forEach((b) => b.addEventListener("click", () => {
    $$(".tab").forEach((x) => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
    courseType = b.dataset.type;
    renderCourses();
  }));

  /* =======================================================
     04 工房チャンネル（動画投稿）
     ======================================================= */
  const videos = [
    { emoji: "🏺", bg: "linear-gradient(135deg,#d4a373,#7f4f24)", av: "🏺", time: "10:24",
      ja: { title: "【ろくろ1本勝負】京都の陶芸家が10分で湯のみをつくる", ch: "窯元チャンネル", views: "12万回視聴", ago: "3日前", tags: "陶芸 京都 職人" },
      en: { title: "[One take] A Kyoto potter throws a teacup in 10 minutes", ch: "Kiln Channel", views: "120K views", ago: "3 days ago", tags: "pottery kyoto artisan" } },
    { emoji: "⚛️", bg: "linear-gradient(135deg,#0f2027,#2c5364)", av: "🔬", time: "5:12",
      ja: { title: "フュージョンエネルギーって何？ 5分でざっくり解説", ch: "未来ラボ", views: "8.4万回視聴", ago: "1週間前", tags: "研究 フュージョン 解説" },
      en: { title: "What is fusion energy? A 5-minute overview", ch: "Future Lab", views: "84K views", ago: "1 week ago", tags: "research fusion science" } },
    { emoji: "🗾", bg: "linear-gradient(135deg,#ff9a8b,#ff6a88)", av: "🧳", time: "18:40",
      ja: { title: "海外の友だちと行く、はじめての地方の温泉旅", ch: "旅する工房", views: "3.1万回視聴", ago: "2日前", tags: "旅 温泉 地方 インバウンド" },
      en: { title: "A first countryside hot-spring trip with friends from abroad", ch: "Traveling Koubo", views: "31K views", ago: "2 days ago", tags: "travel onsen countryside japan" } },
    { emoji: "☀️", bg: "linear-gradient(135deg,#f7971e,#ffd200)", av: "🔬", time: "14:03",
      ja: { title: "ペロブスカイト太陽電池を研究室でつくってみた", ch: "未来ラボ", views: "5.6万回視聴", ago: "5日前", tags: "研究 ペロブスカイト 太陽電池" },
      en: { title: "We made a perovskite solar cell in the lab", ch: "Future Lab", views: "56K views", ago: "5 days ago", tags: "research perovskite solar" } },
    { emoji: "🔪", bg: "linear-gradient(135deg,#8d99ae,#2b2d42)", av: "🔪", time: "30:00",
      ja: { title: "包丁研ぎの音だけを30分聞く動画", ch: "下町の刃物屋", views: "21万回視聴", ago: "1か月前", tags: "職人 東京 ASMR" },
      en: { title: "30 minutes of knife-sharpening sounds", ch: "Shitamachi Knives", views: "210K views", ago: "1 month ago", tags: "artisan tokyo asmr knife" } },
    { emoji: "🌐", bg: "linear-gradient(135deg,#6c5ce7,#a29bfe)", av: "工", time: "22:17",
      ja: { title: "メタバース工房 β版を先行プレイ！", ch: "工房公式", views: "1.9万回視聴", ago: "12時間前", tags: "メタバース ゲーム 公式" },
      en: { title: "First look: Metaverse Workshop beta", ch: "Koubo Official", views: "19K views", ago: "12 hours ago", tags: "metaverse game official" } },
  ];
  const renderVideos = () => {
    const words = $("#videoSearch").value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    // 日本語・英語のどちらで検索しても見つかるようにする
    const hay = (v) => [v.ja.title, v.ja.ch, v.ja.tags, v.en.title, v.en.ch, v.en.tags].join(" ").toLowerCase();
    const list = videos.filter((v) => words.every((w) => hay(v).includes(w)));
    $("#videoList").innerHTML = list.map((v) => { const d = v[lang]; return `
      <button class="video reveal" type="button" data-toast="${T.demoPlay()}">
        <div class="video__thumb" style="--thumb:${v.bg}"><span aria-hidden="true">${v.emoji}</span><span class="video__time">${v.time}</span></div>
        <div class="video__info">
          <span class="video__avatar" aria-hidden="true">${v.av}</span>
          <div>
            <p class="video__title">${esc(d.title)}</p>
            <p class="video__sub">${esc(d.ch)}<br>${esc(d.views)}・${esc(d.ago)}</p>
          </div>
        </div>
      </button>`; }).join("");
    $("#videoEmpty").hidden = list.length > 0;
    observeReveal();
  };
  $("#videoSearch").addEventListener("input", renderVideos);

  /* =======================================================
     05 工房シアター（定額配信）
     ======================================================= */
  const rows = [
    { ja: "今日のTOP5", en: "Top 5 today", rank: true, items: [
      ["太陽を編む人びと", "Weavers of the Sun", "☀️", "linear-gradient(160deg,#f5b041,#c0392b)"],
      ["最後の宮大工", "The Last Temple Carpenter", "🏯", "linear-gradient(160deg,#7f5539,#1b1b1b)"],
      ["メタバース探偵団", "Metaverse Detectives", "🕵️", "linear-gradient(160deg,#6c5ce7,#120b33)"],
      ["星を閉じこめる炉", "The Furnace That Holds a Star", "⚛️", "linear-gradient(160deg,#00b4d8,#03045e)"],
      ["旅する職人", "The Traveling Artisan", "🧳", "linear-gradient(160deg,#ff6a88,#3a0ca3)"],
    ]},
    { ja: "工房オリジナル", en: "Koubo Originals", items: [
      ["糸と針の物語", "A Tale of Thread and Needle", "🧵", "linear-gradient(160deg,#ffafcc,#6a0572)", true],
      ["窯の火が消えるまで", "Until the Kiln Goes Cold", "🔥", "linear-gradient(160deg,#ff7b00,#370617)"],
      ["棚田の四季", "Four Seasons on the Terraces", "🌾", "linear-gradient(160deg,#f4d35e,#386641)", true],
      ["刃の声を聞く", "Listening to the Blade", "🔪", "linear-gradient(160deg,#adb5bd,#212529)"],
      ["研究室の夜明け", "Dawn in the Lab", "🔬", "linear-gradient(160deg,#48cae4,#023e8a)"],
      ["雪国のわら細工", "Straw Crafts of Snow Country", "❄️", "linear-gradient(160deg,#caf0f8,#0077b6)"],
    ]},
    { ja: "家族で楽しめるアニメ", en: "Anime for the whole family", items: [
      ["こうぼうのコウちゃん", "Kou-chan of the Workshop", "🐻", "linear-gradient(160deg,#ffd166,#f77f00)", true],
      ["ロボと金継ぎ", "The Robot and Kintsugi", "🤖", "linear-gradient(160deg,#90e0ef,#5e60ce)"],
      ["おむすび宇宙船", "The Rice Ball Spaceship", "🍙", "linear-gradient(160deg,#fefae0,#283618)"],
      ["森の音楽隊", "The Forest Band", "🎻", "linear-gradient(160deg,#95d5b2,#081c15)"],
      ["きつねの宿", "The Fox Inn", "🦊", "linear-gradient(160deg,#f4a261,#264653)"],
    ]},
  ];
  const renderTheater = () => {
    $("#theaterRows").innerHTML = rows.map((r) => `
      <div class="row">
        <h3 class="row__title">${esc(r[lang])}</h3>
        <div class="row__track" tabindex="0" aria-label="${esc(r[lang])}${tr("（横にスクロールできます）", " (scroll sideways)")}">
          ${r.items.map(([ja, en, e, bg, isNew], i) => { const t = tr(ja, en); return `
            <button class="poster" type="button" style="--thumb:${bg}" data-toast="${esc(tr(`「${t}」はデモのため再生できません`, `"${t}" can't be played in this demo`))}">
              <span class="poster__emoji" aria-hidden="true">${e}</span>
              ${r.rank ? `<span class="poster__rank" aria-hidden="true">${i + 1}</span>` : ""}
              ${isNew ? `<span class="poster__new">${tr("新作", "NEW")}</span>` : ""}
              <span class="poster__title">${esc(t)}</span>
            </button>`; }).join("")}
        </div>
      </div>`).join("");
  };

  /* =======================================================
     06 工房マーケット（C2C・オークション）
     ======================================================= */
  const now = Date.now();
  const H = 3600 * 1000;
  const items = [
    { id: 1, kind: "auction", emoji: "🏺", bg: "linear-gradient(135deg,#d4a373,#7f4f24)", ja: "清水焼 一点ものの茶碗", en: "One-of-a-kind Kiyomizu-yaki tea bowl", seller: "kyoto_kama", price: 12000, bids: 8, end: now + 2.5 * H },
    { id: 2, kind: "buy", emoji: "🔪", bg: "linear-gradient(135deg,#8d99ae,#2b2d42)", ja: "職人手打ち 三徳包丁 170mm", en: "Hand-forged santoku knife, 170 mm", seller: "shitamachi_hamono", price: 24800, end: now + 72 * H },
    { id: 3, kind: "auction", emoji: "📻", bg: "linear-gradient(135deg,#e9c46a,#264653)", ja: "昭和レトロ 真空管ラジオ（動作品）", en: "Vintage Showa-era tube radio (working)", seller: "retro_garage", price: 8500, bids: 14, end: now + 0.8 * H },
    { id: 4, kind: "buy", emoji: "🧣", bg: "linear-gradient(135deg,#ffafcc,#a2d2ff)", ja: "手織りのストール 藍染め", en: "Hand-woven indigo-dyed stole", seller: "ai_zome_studio", price: 6800, end: now + 120 * H },
    { id: 5, kind: "auction", emoji: "🎴", bg: "linear-gradient(135deg,#e63946,#1d3557)", ja: "木版画「雪の工房街」限定10枚", en: "Woodblock print \"Snowy Workshop Town\" (edition of 10)", seller: "hanga_works", price: 30000, bids: 5, end: now + 26 * H },
    { id: 6, kind: "buy", emoji: "🍵", bg: "linear-gradient(135deg,#7fb069,#2e5e3e)", ja: "宇治の新茶 100g×3袋", en: "Uji first-flush green tea, 100 g × 3", seller: "uji_chashi", price: 4200, end: now + 240 * H },
    { id: 7, kind: "auction", emoji: "📷", bg: "linear-gradient(135deg,#adb5bd,#343a40)", ja: "フィルムカメラ（レンズ付き）", en: "Film camera with lens", seller: "camera_kobo", price: 15500, bids: 21, end: now + 5 * H },
    { id: 8, kind: "buy", emoji: "🪆", bg: "linear-gradient(135deg,#f4a261,#e76f51)", ja: "メタバース工房 限定アバター衣装（デジタル）", en: "Metaverse Workshop avatar outfit (digital, limited)", seller: "koubo_official", price: 1200, end: now + 400 * H },
  ];
  let mFilter = "all";
  // お気に入りは、この端末のブラウザにだけ保存（使えない環境では保存しない）
  const WATCH_KEY = "jinseikoubo-watch";
  let watched = new Set();
  try { watched = new Set(JSON.parse(localStorage.getItem(WATCH_KEY) || "[]")); } catch (_) { /* 保存不可の環境 */ }
  const saveWatch = () => {
    try { localStorage.setItem(WATCH_KEY, JSON.stringify([...watched])); } catch (_) { /* 保存不可の環境 */ }
    $("#watchCount").textContent = watched.size;
  };
  const pad2 = (n) => String(n).padStart(2, "0");
  const remain = (end) => {
    const ms = end - Date.now();
    if (ms <= 0) return tr("終了", "Ended");
    const h = Math.floor(ms / H), m = Math.floor((ms % H) / 60000), s = Math.floor((ms % 60000) / 1000);
    if (h >= 48) { const d = Math.floor(h / 24); return tr(`残り${d}日`, `${d} days left`); }
    return tr(`残り${h}時間${pad2(m)}分${pad2(s)}秒`, `${h}h ${pad2(m)}m ${pad2(s)}s left`);
  };
  const bidStep = (p) => (p < 10000 ? 500 : p < 30000 ? 1000 : 2000);
  const renderMarket = () => {
    const sort = $("#marketSort").value;
    const list = items
      .filter((i) => mFilter === "all" || i.kind === mFilter)
      .sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : a.end - b.end);
    $("#marketList").innerHTML = list.map((i) => { const title = i[lang]; const on = watched.has(i.id); return `
      <article class="card">
        <div class="card__thumb" style="--thumb:${i.bg}"><span aria-hidden="true">${i.emoji}</span>
          <button class="watch" type="button" data-watch="${i.id}" aria-pressed="${on}" aria-label="${esc(tr(`「${title}」をお気に入りに${on ? "登録済み" : "追加"}`, on ? `Remove "${title}" from watchlist` : `Add "${title}" to watchlist`))}">${on ? "♥" : "♡"}</button></div>
        <div class="card__body">
          <p class="${i.kind === "auction" ? "tag-auction" : "tag-buy"}">${i.kind === "auction" ? tr("オークション", "Auction") : tr("即決価格", "Buy It Now")}</p>
          <h3 class="card__title">${esc(title)}</h3>
          <p class="card__meta"><span>${tr("出品者：", "Seller: ")}${esc(i.seller)}</span></p>
          <p class="price">${yen(i.price)}</p>
          ${i.kind === "auction"
            ? `<p class="bids">${tr(`入札 ${i.bids}件`, `${i.bids} bids`)}・<span class="ends${i.end - Date.now() < H ? " is-soon" : ""}" data-end="${i.id}">${remain(i.end)}</span></p>`
            : `<p class="bids">${tr("送料込み・匿名配送対応", "Shipping included · anonymous delivery")}</p>`}
          <div class="card__foot">
            ${i.kind === "auction"
              ? `<button class="btn btn--primary btn--sm btn--block" data-bid="${i.id}">${tr(`＋${yen(bidStep(i.price))} で入札（デモ）`, `Bid +${yen(bidStep(i.price))} (demo)`)}</button>`
              : `<button class="btn btn--primary btn--sm btn--block" data-toast="${T.demoBuy()}">${tr("購入する", "Buy now")}</button>`}
          </div>
        </div>
      </article>`; }).join("");
  };
  $$("[data-mfilter]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-mfilter]").forEach((x) => x.classList.toggle("is-active", x === b));
    mFilter = b.dataset.mfilter;
    renderMarket();
  }));
  $("#marketSort").addEventListener("change", renderMarket);
  $("#marketList").addEventListener("click", (e) => {
    const w = e.target.closest("[data-watch]");
    if (w) {
      const id = Number(w.dataset.watch);
      if (watched.has(id)) { watched.delete(id); toast(tr("お気に入りから外しました", "Removed from your watchlist")); }
      else { watched.add(id); toast(tr("お気に入りに追加しました", "Added to your watchlist")); }
      saveWatch();
      renderMarket();
      return;
    }
    const b = e.target.closest("[data-bid]");
    if (!b) return;
    const item = items.find((i) => i.id === Number(b.dataset.bid));
    if (item.end <= Date.now()) { toast(tr("このオークションは終了しました", "This auction has ended")); return; }
    item.price += bidStep(item.price);
    item.bids += 1;
    renderMarket();
    toast(tr(`${yen(item.price)} で入札しました（デモ・保存されません）`, `You bid ${yen(item.price)} (demo, not saved)`));
  });
  setInterval(() => {
    items.forEach((i) => {
      const el = $(`[data-end="${i.id}"]`);
      if (el) { el.textContent = remain(i.end); el.classList.toggle("is-soon", i.end - Date.now() < H && i.end > Date.now()); }
    });
  }, 1000);

  /* =======================================================
     07 未来研究ファンド
     ======================================================= */
  const UNIT = 10000;
  const projects = [
    { id: "pv", field: "PEROVSKITE SOLAR", bg: "linear-gradient(135deg,#f7971e,#d35400)", goal: 30000000, raised: 21450000, backers: 1832, days: 24, risk: "mid",
      ja: { title: "曲がる太陽電池を、窓や壁に。", text: "薄くて軽いペロブスカイト太陽電池の耐久性を高め、建物の窓や外壁に貼れる実用化をめざす研究（架空のサンプル案件）。" },
      en: { title: "Flexible solar cells for windows and walls", text: "Making thin, light perovskite solar cells durable enough to be applied to building windows and walls (fictional sample project)." } },
    { id: "fusion", field: "FUSION ENERGY", bg: "linear-gradient(135deg,#00b4d8,#03045e)", goal: 50000000, raised: 18200000, backers: 1407, days: 41, risk: "high",
      ja: { title: "地上に小さな太陽をつくる", text: "フュージョン（核融合）炉の部品に使う、高温に耐える新素材を開発する研究（架空のサンプル案件）。" },
      en: { title: "Building a small sun on Earth", text: "Developing new heat-resistant materials for fusion reactor components (fictional sample project)." } },
    { id: "battery", field: "NEXT-GEN BATTERY", bg: "linear-gradient(135deg,#2a9d8f,#264653)", goal: 20000000, raised: 17600000, backers: 2210, days: 9, risk: "mid",
      ja: { title: "燃えにくく長持ちする電池", text: "再生可能エネルギーをためておくための、安全性の高い次世代蓄電池の研究（架空のサンプル案件）。" },
      en: { title: "Safer, longer-lasting batteries", text: "Researching safer next-generation batteries for storing renewable energy (fictional sample project)." } },
  ];
  const riskLabel = { mid: ["中", "Medium"], high: ["高", "High"] };
  const renderFund = () => {
    $("#fundList").innerHTML = projects.map((p) => {
      const d = p[lang];
      const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
      return `
      <article class="fund reveal">
        <div class="fund__head" style="--thumb:${p.bg}">
          <p class="fund__field">${p.field}</p>
          <h3 class="fund__title">${esc(d.title)}</h3>
        </div>
        <div class="fund__body">
          <p class="fund__text">${esc(d.text)}</p>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${tr("達成率", "Funded")}">
            <div class="progress__bar" style="width:${pct}%"></div>
          </div>
          <div class="fund__nums">
            <div><strong>${pct}%</strong><span>${tr("達成率", "Funded")}</span></div>
            <div><strong>${p.backers.toLocaleString("ja-JP")}${tr("人", "")}</strong><span>${tr("支援者", "Backers")}</span></div>
            <div><strong>${p.days}${tr("日", "")}</strong><span>${tr("残り", "Days left")}</span></div>
          </div>
          <p class="card__meta"><span>${tr("集まった金額", "Raised")} ${yen(p.raised)}</span><span>${tr("目標", "Goal")} ${yen(p.goal)}</span></p>
          <p class="fund__risk">${tr("リスク区分", "Risk level")} <b data-r="${riskLabel[p.risk][0]}">${tr(...riskLabel[p.risk])}</b></p>
          <a class="btn btn--primary btn--sm" href="#simProject" data-pick="${p.id}">${tr(`1口 ${yen(UNIT)} から支援`, `Back from ${yen(UNIT)} per unit`)}</a>
        </div>
      </article>`;
    }).join("");
    const cur = $("#simProject").value;
    $("#simProject").innerHTML = projects.map((p) => `<option value="${p.id}">${esc(p[lang].title)}</option>`).join("");
    if (cur) $("#simProject").value = cur;
    observeReveal();
  };
  const simUnits = $("#simUnits");
  const updateSim = () => {
    const p = projects.find((x) => x.id === $("#simProject").value) || projects[0];
    const amount = Number(simUnits.value) * UNIT;
    $("#simUnitsOut").textContent = simUnits.value;
    $("#simTotal").textContent = yen(amount);
    $("#simShare").textContent = ((amount / p.goal) * 100).toFixed(2) + "%";
    $("#simRemain").textContent = yen(Math.max(0, p.goal - p.raised - amount));
  };
  simUnits.addEventListener("input", updateSim);
  $("#simProject").addEventListener("change", updateSim);
  $("#fundList").addEventListener("click", (e) => {
    const a = e.target.closest("[data-pick]");
    if (a) { $("#simProject").value = a.dataset.pick; updateSim(); }
  });

  /* =======================================================
     02 メタバース工房（ミニデモ）
     ======================================================= */
  const canvas = $("#metaCanvas");
  const ctx = canvas.getContext("2d");
  const W = 720, Hh = 420; // 論理サイズ（座標計算はこの大きさで行う）
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = Hh * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const visited = new Set();
  const zones = [
    { id: "game", x: 20, y: 20, w: 200, h: 130, color: "#e17055", icon: "🎮",
      ja: { name: "ゲームアリーナ", desc: "謎解きやミニゲームで遊べるエリア。ランキング上位には工房コインをプレゼントする想定です。" },
      en: { name: "Game Arena", desc: "Play puzzles and mini-games. Top players could earn Koubo Coins." } },
    { id: "market", x: W - 220, y: 20, w: 200, h: 130, color: "#0984e3", icon: "🏪",
      ja: { name: "マーケット展示館", desc: "マーケットの出品物を3Dで手に取るように見られる展示エリアです。" },
      en: { name: "Market Gallery", desc: "See market items in 3D, almost as if you were holding them." } },
    { id: "class", x: 20, y: Hh - 150, w: 200, h: 130, color: "#00b894", icon: "🎓",
      ja: { name: "ライブ教室", desc: "講師のアバターと一緒に、リアルタイムでワークショップに参加できる教室です。" },
      en: { name: "Live Classroom", desc: "Join real-time workshops alongside your instructor's avatar." } },
    { id: "theater", x: W - 220, y: Hh - 150, w: 200, h: 130, color: "#fdcb6e", icon: "🎬",
      ja: { name: "シアタールーム", desc: "友だちと同じ作品を同時に見ながら、感想を語り合える上映室です。" },
      en: { name: "Theater Room", desc: "Watch the same title with friends and share reactions as you go." } },
  ];
  const plaza = {
    ja: { name: "工房広場", desc: "中央の広場です。4つのエリアに歩いていくと、それぞれの説明が表示されます。" },
    en: { name: "Workshop Plaza", desc: "The central plaza. Walk into any of the four areas to learn about it." },
  };
  const npcs = [
    { x: 300, y: 120, vx: 0.6, vy: 0.4, c: "#fd79a8" },
    { x: 420, y: 300, vx: -0.5, vy: 0.3, c: "#55efc4" },
    { x: 520, y: 200, vx: 0.4, vy: -0.6, c: "#ffeaa7" },
  ];
  const me = { x: W / 2, y: Hh / 2, r: 14, speed: 3 };
  const keys = new Set();
  let target = null;
  let currentZone = null;
  const showZoneInfo = () => {
    const info = (currentZone || plaza)[lang];
    $("#metaZone").textContent = info.name;
    $("#metaDesc").textContent = info.desc;
    $("#metaVisited").textContent = `${visited.size} / ${zones.length}`;
  };

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function avatar(x, y, r, c, outline) {
    ctx.beginPath(); ctx.ellipse(x, y + r + 2, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    if (outline) { ctx.strokeStyle = "#a29bfe"; ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 1; }
    ctx.fillStyle = "#1a1636";
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.15, r * 0.13, 0, Math.PI * 2); ctx.arc(x + r * 0.35, y - r * 0.15, r * 0.13, 0, Math.PI * 2); ctx.fill();
  }
  const draw = (t) => {
    ctx.fillStyle = "#1a1636";
    ctx.fillRect(0, 0, W, Hh);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, Hh); ctx.stroke(); }
    for (let y = 0; y < Hh; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(W / 2, Hh / 2, 80, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(162,155,254,0.12)"; ctx.fill();
    ctx.strokeStyle = "rgba(162,155,254,0.4)"; ctx.stroke();
    zones.forEach((z) => {
      const active = z === currentZone;
      ctx.fillStyle = z.color + (active ? "55" : "22");
      ctx.strokeStyle = z.color;
      ctx.lineWidth = active ? 3 : 1.5;
      roundRect(z.x, z.y, z.w, z.h, 14); ctx.fill(); ctx.stroke();
      ctx.font = "34px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(z.icon, z.x + z.w / 2, z.y + z.h / 2 - 12);
      ctx.font = "bold 17px 'Zen Kaku Gothic New', sans-serif"; ctx.fillStyle = "#fff";
      ctx.fillText(z[lang].name, z.x + z.w / 2, z.y + z.h / 2 + 26);
    });
    ctx.lineWidth = 1;
    npcs.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 240 || n.x > W - 240) n.vx *= -1;
      if (n.y < 40 || n.y > Hh - 40) n.vy *= -1;
      avatar(n.x, n.y, 11, n.c);
    });
    avatar(me.x, me.y + Math.sin(t / 200) * 1.5, me.r, "#ffffff", true);
    ctx.font = "bold 14px 'Zen Kaku Gothic New', sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.fillText(tr("あなた", "You"), me.x, me.y - me.r - 10);
  };
  const update = () => {
    let dx = 0, dy = 0;
    if (keys.has("left")) dx -= 1;
    if (keys.has("right")) dx += 1;
    if (keys.has("up")) dy -= 1;
    if (keys.has("down")) dy += 1;
    if (dx || dy) { target = null; }
    else if (target) {
      const tx = target.x - me.x, ty = target.y - me.y, d = Math.hypot(tx, ty);
      if (d < me.speed) target = null; else { dx = tx / d; dy = ty / d; }
    }
    const len = Math.hypot(dx, dy) || 1;
    me.x = Math.max(me.r, Math.min(W - me.r, me.x + (dx / len) * me.speed));
    me.y = Math.max(me.r, Math.min(Hh - me.r, me.y + (dy / len) * me.speed));
    const z = zones.find((z) => me.x > z.x && me.x < z.x + z.w && me.y > z.y && me.y < z.y + z.h) || null;
    if (z !== currentZone) {
      currentZone = z;
      if (z && !visited.has(z.id)) {
        visited.add(z.id);
        if (visited.size === zones.length) toast(tr("全エリアを訪問しました！（デモ）", "You visited every area! (demo)"));
      }
      showZoneInfo();
    }
  };
  let running = false;
  const loop = (t) => { update(); draw(t); if (running) requestAnimationFrame(loop); };
  const keyMap = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
  let metaVisible = false;
  document.addEventListener("keydown", (e) => {
    const k = keyMap[e.key];
    if (!k || !metaVisible) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.key.startsWith("Arrow")) e.preventDefault();
    keys.add(k);
  });
  document.addEventListener("keyup", (e) => { const k = keyMap[e.key]; if (k) keys.delete(k); });
  $$(".meta__pad button").forEach((b) => {
    const d = b.dataset.dir;
    const on = (e) => { e.preventDefault(); keys.add(d); };
    const off = () => keys.delete(d);
    b.addEventListener("pointerdown", on);
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, off));
  });
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    target = { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * Hh };
  });
  // 画面に見えている間だけ動かす（省電力）
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      metaVisible = en.isIntersecting;
      if (metaVisible && !running) { running = true; requestAnimationFrame(loop); }
      else if (!metaVisible) { running = false; keys.clear(); }
    }, { threshold: 0.2 }).observe(canvas);
  }

  /* ---------- 事前登録フォーム ---------- */
  $("#joinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#joinEmail");
    const msg = $("#joinMsg");
    if (!input.value || !input.checkValidity()) {
      msg.textContent = tr("メールアドレスの形式をご確認ください。", "Please check that your email address is correct.");
      input.focus();
      return;
    }
    msg.textContent = tr("ありがとうございます！（デモのため、実際には送信・保存されていません）", "Thank you! (This is a demo, so nothing was sent or saved.)");
    input.value = "";
  });

  /* =======================================================
     英語の固定テキスト
     [セレクター, 英語のHTML] または [セレクター, 英語の値, 属性名]
     ======================================================= */
  const I18N_STATIC = [
    [".skip", "Skip to content"],
    [".demo-bar", "This is a concept demo. All products, courses, projects and prices are samples. No real bookings, payments or investments can be made."],
    [".header .logo", "Jinsei Koubo home", "aria-label"],
    ["#nav", "Main menu", "aria-label"],
    ['#nav a[href="#tour"]', '<i aria-hidden="true">旅</i>Tours'],
    ['#nav a[href="#metaverse"]', '<i aria-hidden="true">遊</i>Metaverse'],
    ['#nav a[href="#academy"]', '<i aria-hidden="true">学</i>Courses'],
    ['#nav a[href="#channel"]', '<i aria-hidden="true">発</i>Channel'],
    ['#nav a[href="#theater"]', '<i aria-hidden="true">観</i>Theater'],
    ['#nav a[href="#market"]', '<i aria-hidden="true">市</i>Market'],
    ['#nav a[href="#fund"]', '<i aria-hidden="true">研</i>Research'],
    ["#nav .btn", "Sign up free"],

    [".hero__eyebrow", "Travel. Learn. Play. Make.<br class=\"sp\"> Back the future."],
    [".hero__title", "A place to <em>craft</em><br>your own life."],
    [".hero__lead", "Jinsei Koubo means “Life Workshop.” We connect real-world travel and digital spaces, learning and play, and even frontier research, all through a single account."],
    ['.hero__cta a[href="#services"]', "Explore 7 services"],
    ['.hero__cta a[href="#fund"]', "Back research from ¥10,000"],
    [".hero__stats", "Planned scale (targets)", "aria-label"],
    [".hero__stats li:nth-child(1) span", "Services"],
    [".hero__stats li:nth-child(2) span", "Shared account"],
    [".hero__stats li:nth-child(3) span", "Minimum support"],

    ["#services .section__title", "Seven workshops, one platform"],
    ["#services .section__lead", "Start anywhere and everything connects. Meet an artisan on a tour, take their course, buy their work in the market, and part of the sales goes to future research."],
    ['.svc[href="#tour"] h3', "Inbound Tours"],
    ['.svc[href="#tour"] p', "Hands-on tours for visitors to Japan, inside artisan workshops and local life."],
    ['.svc[href="#metaverse"] h3', "Metaverse Workshop"],
    ['.svc[href="#metaverse"] p', "Gather, play and create as an avatar in a shared virtual world."],
    ['.svc[href="#academy"] h3', "Academy"],
    ['.svc[href="#academy"] p', "Learn skills and know-how through online courses and live workshops."],
    ['.svc[href="#channel"] h3', "Koubo Channel"],
    ['.svc[href="#channel"] p', "A video space where anyone can post and share their work."],
    ['.svc[href="#theater"] h3', "Koubo Theater"],
    ['.svc[href="#theater"] p', "A subscription service for unlimited original films and series."],
    ['.svc[href="#market"] h3', "Koubo Market"],
    ['.svc[href="#market"] p', "Buy and sell person to person, by auction or fixed price."],
    ['.svc[href="#fund"] h3', "Future Research Fund"],
    ['.svc[href="#fund"] p', "Back research such as perovskite solar cells and fusion energy,<br class=\"pc\"> starting from around ¥10,000 per unit."],

    ["#tour .section__title", "Meet the makers of Japan"],
    ["#tour .section__lead", "Go beyond sightseeing. Step inside artisan workshops and local life on hands-on tours designed for visitors to Japan, with guides in English, Chinese and more."],
    ["#tour .filter", "Filter tours by region", "aria-label"],
    ['[data-filter="all"]', "All"],
    ['[data-filter="kyoto"]', "Kyoto"],
    ['[data-filter="tokyo"]', "Tokyo"],
    ['[data-filter="local"]', "Countryside"],

    ["#metaverse .section__title", "Play and connect in the Metaverse Workshop"],
    ["#metaverse .section__lead", "Walk through a virtual “workshop town” as an avatar and join games and events. In the mini demo below, use the arrow keys, or click or tap where you want to walk. Try entering each area."],
    ["#metaCanvas", "Metaverse Workshop mini demo. Move your avatar to visit each area.", "aria-label"],
    [".meta__pad", "Movement buttons", "aria-label"],
    ['.meta__pad [data-dir="up"]', "Up", "aria-label"],
    ['.meta__pad [data-dir="left"]', "Left", "aria-label"],
    ['.meta__pad [data-dir="down"]', "Down", "aria-label"],
    ['.meta__pad [data-dir="right"]', "Right", "aria-label"],
    [".meta__label", "YOU ARE IN"],
    [".meta__visited", 'Areas visited <b id="metaVisited">0 / 4</b>'],
    [".meta__features li:nth-child(1)", "Mini-games and puzzle events"],
    [".meta__features li:nth-child(2)", "Meetups with tour guests and instructors"],
    [".meta__features li:nth-child(3)", "3D displays of market items"],
    [".meta__features li:nth-child(4)", "Watch-party rooms for Theater titles"],

    ["#academy .section__title", "Online courses and workshops"],
    ["#academy .section__lead", "Learn anytime with recorded courses, or connect with instructors in live workshops. Digital certificates of completion are planned."],
    ["#academy .tabs", "Course type", "aria-label"],
    ['.tab[data-type="all"]', "All"],
    ['.tab[data-type="video"]', "On demand"],
    ['.tab[data-type="live"]', "Live"],

    ["#channel .section__title", "Koubo Channel: everyone can be a creator"],
    ["#channel .section__lead", "Artisan craft, travel diaries, research explainers: anyone can post videos. Creators are planned to earn from ads and from fans' tips."],
    ["#videoSearch", "Search videos (e.g. pottery, Kyoto, research)", "placeholder"],
    ["#videoSearch", "Search videos", "aria-label"],
    ["#videoEmpty", "No videos match your search."],

    ["#theater .section__title", "Koubo Theater: unlimited originals"],
    ["#theater .section__lead", "Original documentaries, dramas and anime, all you can watch for one monthly fee."],
    [".theater__tag", "ORIGINAL DOCUMENTARY"],
    [".theater__hero h3", "Weavers of the Sun"],
    [".theater__hero p:not(.theater__tag)", "A six-part series following researchers who have devoted their lives to next-generation solar cells, and the projects backed by our research fund."],
    [".theater__btns .btn--light", "▶ Play"],
    [".theater__btns .btn--light", "Playback is not available in this demo", "data-toast"],
    [".theater__btns .btn--glass", "+ My List"],
    [".theater__btns .btn--glass", "Added to My List (demo)", "data-toast"],

    ["#market .section__title", "Koubo Market: buy and sell person to person"],
    ["#market .section__lead", "A marketplace where anyone can list crafts, vintage finds and souvenirs from their travels. Buy instantly at a fixed price, or place a bid at auction."],
    ["#market .filter", "Filter by listing type", "aria-label"],
    ['[data-mfilter="all"]', "All"],
    ['[data-mfilter="auction"]', "Auction"],
    ['[data-mfilter="buy"]', "Buy It Now"],
    [".watch-count", 'Watchlist <b id="watchCount">0</b>'],
    [".select span", "Sort by"],
    ['#marketSort option[value="end"]', "Ending soonest"],
    ['#marketSort option[value="low"]', "Price: low to high"],
    ['#marketSort option[value="high"]', "Price: high to low"],

    ["#fund .section__title", "Future Research Fund:<br class=\"sp\"> back frontier science from ¥10,000"],
    ["#fund .section__lead", "Frontier research has long been funded mainly by large companies and governments. Here, individuals can take part with small amounts, receive progress reports and videos, and follow the results together."],
    [".flow", "How backing works", "aria-label"],
    [".flow li:nth-child(1)", "<span>1</span><strong>Choose a project</strong><p>Review the research,<br>risks and use of funds</p>"],
    [".flow li:nth-child(2)", "<span>2</span><strong>Back from one unit</strong><p>About ¥10,000<br>per unit (planned)</p>"],
    [".flow li:nth-child(3)", "<span>3</span><strong>Follow the progress</strong><p>Reports, videos<br>and lab tours</p>"],
    [".flow li:nth-child(4)", "<span>4</span><strong>Receive the outcome</strong><p>Rewards vary<br>by project</p>"],
    [".sim__title", "Backing simulator"],
    [".sim__note", "Choose a project and number of units to see your total and its share of the goal (demo calculation)."],
    ['label[for="simProject"]', "Project"],
    ['label[for="simUnits"]', 'Units: <output id="simUnitsOut" for="simUnits">1</output> (¥10,000 each)'],
    [".sim__total", 'Your total<strong id="simTotal">¥10,000</strong>'],
    [".sim__share:nth-of-type(2)", 'Share of the goal <b id="simShare">0.03%</b>'],
    [".sim__share:nth-of-type(3)", 'Remaining to reach the goal <b id="simRemain">¥0</b>'],
    [".sim__out .btn", "Back this project (demo)"],
    [".sim__out .btn", "Backing is not available in this demo", "data-toast"],
    [".risk h3", "Please note (concept stage)"],
    [".risk li:nth-child(1)", "Research and development is never guaranteed to succeed. You may not get your money back."],
    [".risk li:nth-child(2)", "If the fund offers financial returns such as dividends, registration under Japan's Financial Instruments and Exchange Act may be required. We will consult experts and the relevant authorities before any official launch."],
    [".risk li:nth-child(3)", "All projects, amounts and progress on this page are fictional samples."],

    ["#ecosystem .section__title", "One account,<br class=\"sp\"> everything connected"],
    [".cycle", "An example of the Jinsei Koubo cycle", "aria-label"],
    [".cycle li:nth-child(1) span", "Meet an artisan<br>on a tour"],
    [".cycle li:nth-child(2) span", "Take that artisan's<br>course"],
    [".cycle li:nth-child(3) span", "Buy their work<br>in the market"],
    [".cycle li:nth-child(4) span", "Part of the sales<br>backs research"],
    [".eco__item:nth-child(1)", "<strong>Shared points: Koubo Coins</strong><p>Earn coins by joining tours and finishing courses, then spend them in the Market or Theater (planned).</p>"],
    [".eco__item:nth-child(2)", "<strong>One experience leads to the next</strong><p>We design each service so that what you discover in one becomes a doorway to another.</p>"],
    [".eco__item:nth-child(3)", "<strong>Part of every sale goes to the future</strong><p>We are exploring ways to direct a share of each service's sales to the research fund.</p>"],

    ["#roadmap .section__title", "Roadmap to the<br class=\"sp\"> full vision (draft)"],
    ["#roadmap .section__lead", "Rather than launching everything at once, we plan to grow step by step."],
    [".roadmap li:nth-child(1) h3", "Open the doors"],
    [".roadmap li:nth-child(1) p", "Inbound Tours / Online courses / Koubo Channel"],
    [".roadmap li:nth-child(2) h3", "Sell and watch"],
    [".roadmap li:nth-child(2) p", "Koubo Market / Koubo Theater"],
    [".roadmap li:nth-child(3) h3", "Gather"],
    [".roadmap li:nth-child(3) p", "Metaverse Workshop (events, games, 3D displays)"],
    [".roadmap li:nth-child(4) h3", "Back the future"],
    [".roadmap li:nth-child(4) p", "Future Research Fund (once the legal framework is in place)"],

    ["#faq .section__title", "Frequently asked questions"],
    [".faq details:nth-child(1)", "<summary>Can I use any services today?</summary><p>Not yet. Jinsei Koubo is still at the concept stage. Sign up below to hear when services launch.</p>"],
    [".faq details:nth-child(2)", "<summary>Do I need a separate account for each service?</summary><p>No. The plan is for one shared account to work across all seven services.</p>"],
    [".faq details:nth-child(3)", "<summary>If I put ¥10,000 into the research fund, will my money grow?</summary><p>Not necessarily. Research can fail, and you may not get your money back. Rewards (progress reports, lab tours, financial returns and so on) will vary by project. Any financial returns will only start once the required legal framework is in place.</p>"],
    [".faq details:nth-child(4)", "<summary>Can I book a tour from outside Japan?</summary><p>Yes. The tours are designed for visitors to Japan, so we plan to support booking and guidance in English and other languages.</p>"],
    [".faq details:nth-child(5)", "<summary>What do I need to sell in the market?</summary><p>We plan to let individuals sell with a shared account and identity verification. Rules on prohibited items will be announced at launch.</p>"],

    [".join__title", "Be one of the first<br class=\"sp\"> members of Jinsei Koubo"],
    [".join__inner > p:not(.join__msg)", "Get launch news and early-access invitations."],
    ['label[for="joinEmail"]', "Email address"],
    ["#joinEmail", "Email address", "placeholder"],
    [".join__form .btn", "Sign up"],

    [".footer__copy", "Travel. Learn. Play. Make. Back the future."],
    ['.footer__links a[href="#services"]', "All services"],
    ['.footer__links a[href="#roadmap"]', "Roadmap"],
    ['.footer__links a[href="#faq"]', "FAQ"],
    ['.footer__links a[href="#join"]', "Sign up"],
    [".footer__links li:nth-child(5) span", "Company info (coming soon)"],
    [".footer__links li:nth-child(6) span", "Legal notice under the Act on Specified Commercial Transactions (coming soon)"],
    [".footer__links li:nth-child(7) span", "Privacy policy (coming soon)"],
    [".footer__bottom", "© Jinsei Koubo · Concept demo site"],
    ["#toTop", "Back to top", "aria-label"],
  ];
  // 日本語の元の状態を記憶しておく（日本語に戻すときに使う）
  const I18N_JA = I18N_STATIC.map(([sel, , attr]) => {
    const el = $(sel);
    if (!el) { console.warn("i18n: not found", sel); return null; }
    return attr ? el.getAttribute(attr) : el.innerHTML;
  });
  const TITLE = { ja: document.title, en: "Jinsei Koubo | Travel, learn, play and back the future" };

  const applyLang = () => {
    I18N_STATIC.forEach(([sel, en, attr], i) => {
      const el = $(sel);
      if (!el || I18N_JA[i] == null) return;
      const v = lang === "en" ? en : I18N_JA[i];
      if (attr) el.setAttribute(attr, v); else el.innerHTML = v;
    });
    document.documentElement.lang = lang;
    document.title = TITLE[lang];
    const btn = $("#langToggle");
    btn.textContent = lang === "en" ? "日本語" : "EN";
    btn.setAttribute("lang", lang === "en" ? "ja" : "en");
    btn.setAttribute("aria-label", lang === "en" ? "日本語に切り替える" : "Switch to English");
    setNav(nav.classList.contains("is-open"));
    renderTours();
    renderCourses();
    renderVideos();
    renderTheater();
    renderMarket();
    renderFund();
    updateSim();
    saveWatch();
    showZoneInfo();
    draw(0);
  };
  $("#langToggle").addEventListener("click", () => {
    lang = lang === "en" ? "ja" : "en";
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* 保存不可の環境 */ }
    applyLang();
    toast(tr("日本語に切り替えました", "Switched to English"));
  });

  /* ---------- スクロール時の表示アニメーション ----------
     要素は最初から見えている状態。画面に入ったときに軽く動かすだけ。 */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = !reduce && "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-anim");
      io.unobserve(en.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }) : null;
  function observeReveal() {
    if (!io) return;
    $$(".reveal:not(.is-anim):not(.is-seen)").forEach((el) => {
      el.classList.add("is-seen");
      // すでに画面内にあるものは動かさない（最初の表示をそのまま見せる）
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      io.observe(el);
    });
  }
  $$(".svc, .eco__item, .roadmap li, .flow li").forEach((el) => el.classList.add("reveal"));

  /* ---------- ページ先頭へ戻るボタン ---------- */
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("is-show", window.scrollY > 800), { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  applyLang();
})();
