/* =========================================================
   人生工房 ― スクリプト
   ここにあるデータはすべてデモ用のサンプルです。
   本番では、APIやデータベースから取得する想定です。
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

  /* ---------- ナビゲーション（スマホ用メニュー） ---------- */
  const navToggle = $(".nav-toggle");
  const nav = $("#nav");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  };
  navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* =======================================================
     01 インバウンドツアー
     ======================================================= */
  const tours = [
    { area: "kyoto", emoji: "🍵", bg: "linear-gradient(135deg,#7fb069,#2e5e3e)", title: "京都・宇治で茶師と過ごす一日", text: "茶畑の見学から、茶師と一緒に行う手もみ体験、最後はお茶会まで。", days: "日帰り", price: 28000, lang: ["EN", "中文"] },
    { area: "kyoto", emoji: "🏺", bg: "linear-gradient(135deg,#d4a373,#7f4f24)", title: "清水焼の窯元でつくる自分だけの器", text: "職人の手ほどきでろくろを体験。焼き上げた器は海外へ配送します。", days: "半日", price: 18000, lang: ["EN", "FR"] },
    { area: "tokyo", emoji: "🔪", bg: "linear-gradient(135deg,#8d99ae,#2b2d42)", title: "東京・下町の刃物職人をたずねて", text: "研ぎの技を間近で見学し、自分の包丁を研ぐ体験ができます。", days: "半日", price: 22000, lang: ["EN", "ES"] },
    { area: "tokyo", emoji: "🎐", bg: "linear-gradient(135deg,#90e0ef,#0077b6)", title: "江戸切子と夜の下町さんぽ", text: "ガラス工房でのカット体験のあと、ガイドと夜の路地を歩きます。", days: "夕方〜夜", price: 16000, lang: ["EN", "한국어"] },
    { area: "local", emoji: "🏔️", bg: "linear-gradient(135deg,#a8dadc,#457b9d)", title: "雪国の古民家に泊まる3日間", text: "かやぶき屋根の宿に泊まり、わら細工や郷土料理づくりを体験します。", days: "2泊3日", price: 98000, lang: ["EN", "中文"] },
    { area: "local", emoji: "🌾", bg: "linear-gradient(135deg,#f4d35e,#ee964b)", title: "棚田の米づくりと酒蔵めぐり", text: "田植え・稲刈りの季節限定。酒蔵での試飲（20歳以上）付き。", days: "1泊2日", price: 54000, lang: ["EN", "DE"] },
  ];
  const renderTours = (area = "all") => {
    $("#tourList").innerHTML = tours
      .filter((t) => area === "all" || t.area === area)
      .map((t) => `
        <article class="card reveal">
          <div class="card__thumb" style="--thumb:${t.bg}"><span aria-hidden="true">${t.emoji}</span><span class="card__label">${esc(t.days)}</span></div>
          <div class="card__body">
            <h3 class="card__title">${esc(t.title)}</h3>
            <p class="card__text">${esc(t.text)}</p>
            <div class="lang" aria-label="対応言語">${t.lang.map((l) => `<span>${esc(l)}</span>`).join("")}</div>
            <div class="card__foot">
              <p class="price">${yen(t.price)}<small>／人〜</small></p>
              <button class="btn btn--primary btn--sm" data-toast="予約はデモのため利用できません">予約する</button>
            </div>
          </div>
        </article>`).join("");
    observeReveal();
  };
  $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-filter]").forEach((x) => x.classList.toggle("is-active", x === b));
    renderTours(b.dataset.filter);
  }));

  /* =======================================================
     03 アカデミー
     ======================================================= */
  const courses = [
    { type: "video", emoji: "🪵", bg: "linear-gradient(135deg,#bc6c25,#606c38)", title: "はじめての木工：箸と器をつくる", teacher: "木工作家 A", time: "全12回・約6時間", price: 9800, rate: 4.8 },
    { type: "live", emoji: "🧵", bg: "linear-gradient(135deg,#ffafcc,#cdb4db)", title: "金継ぎライブワークショップ", teacher: "漆芸家 B", time: "11/23（土）14:00〜", price: 6500, rate: 4.9 },
    { type: "video", emoji: "☀️", bg: "linear-gradient(135deg,#ffd166,#ef476f)", title: "高校生でもわかる次世代太陽電池", teacher: "研究者 C", time: "全8回・約3時間", price: 0, rate: 4.7 },
    { type: "live", emoji: "🗣️", bg: "linear-gradient(135deg,#8ecae6,#219ebc)", title: "訪日ガイドのための英会話実践", teacher: "通訳ガイド D", time: "毎週水曜 20:00〜", price: 4000, rate: 4.6 },
    { type: "video", emoji: "🎥", bg: "linear-gradient(135deg,#adb5bd,#343a40)", title: "スマホで撮る！職人ドキュメンタリー入門", teacher: "映像作家 E", time: "全10回・約4時間", price: 7800, rate: 4.5 },
    { type: "video", emoji: "🧊", bg: "linear-gradient(135deg,#b8c0ff,#5e60ce)", title: "メタバース空間デザインの基礎", teacher: "3Dデザイナー F", time: "全15回・約8時間", price: 12800, rate: 4.6 },
    { type: "live", emoji: "🍶", bg: "linear-gradient(135deg,#e9edc9,#a3b18a)", title: "酒蔵と学ぶ日本酒の楽しみ方", teacher: "杜氏 G", time: "12/7（土）19:00〜", price: 5500, rate: 4.8 },
    { type: "video", emoji: "💹", bg: "linear-gradient(135deg,#95d5b2,#1b4332)", title: "研究を応援する前に知っておきたいお金の基礎", teacher: "ファイナンシャルプランナー H", time: "全6回・約2時間", price: 0, rate: 4.4 },
  ];
  const renderCourses = (type = "all") => {
    $("#courseList").innerHTML = courses
      .filter((c) => type === "all" || c.type === type)
      .map((c) => `
        <article class="card reveal">
          <div class="card__thumb" style="--thumb:${c.bg}"><span aria-hidden="true">${c.emoji}</span>
            <span class="card__label ${c.type === "live" ? "card__label--live" : ""}">${c.type === "live" ? "● LIVE" : "録画講座"}</span></div>
          <div class="card__body">
            <h3 class="card__title">${esc(c.title)}</h3>
            <p class="card__meta"><span>👤 ${esc(c.teacher)}</span><span>🕒 ${esc(c.time)}</span></p>
            <p class="stars" aria-label="評価 ${c.rate}">★ ${c.rate.toFixed(1)}</p>
            <div class="card__foot">
              <p class="price">${c.price === 0 ? "無料" : yen(c.price)}</p>
              <button class="btn btn--primary btn--sm" data-toast="受講申込はデモのため利用できません">${c.type === "live" ? "参加する" : "受講する"}</button>
            </div>
          </div>
        </article>`).join("");
    observeReveal();
  };
  $$(".tab").forEach((b) => b.addEventListener("click", () => {
    $$(".tab").forEach((x) => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
    renderCourses(b.dataset.type);
  }));

  /* =======================================================
     04 工房チャンネル（動画投稿）
     ======================================================= */
  const videos = [
    { emoji: "🏺", bg: "linear-gradient(135deg,#d4a373,#7f4f24)", title: "【ろくろ1本勝負】京都の陶芸家が10分で湯のみをつくる", ch: "窯元チャンネル", av: "🏺", views: "12万回", ago: "3日前", time: "10:24", tags: "陶芸 京都 職人" },
    { emoji: "⚛️", bg: "linear-gradient(135deg,#0f2027,#2c5364)", title: "フュージョンエネルギーって何？ 5分でざっくり解説", ch: "未来ラボ", av: "🔬", views: "8.4万回", ago: "1週間前", time: "5:12", tags: "研究 フュージョン 解説" },
    { emoji: "🗾", bg: "linear-gradient(135deg,#ff9a8b,#ff6a88)", title: "海外の友だちと行く、はじめての地方の温泉旅", ch: "旅する工房", av: "🧳", views: "3.1万回", ago: "2日前", time: "18:40", tags: "旅 温泉 地方 インバウンド" },
    { emoji: "☀️", bg: "linear-gradient(135deg,#f7971e,#ffd200)", title: "ペロブスカイト太陽電池を研究室でつくってみた", ch: "未来ラボ", av: "🔬", views: "5.6万回", ago: "5日前", time: "14:03", tags: "研究 ペロブスカイト 太陽電池" },
    { emoji: "🔪", bg: "linear-gradient(135deg,#8d99ae,#2b2d42)", title: "包丁研ぎの音だけを30分聞く動画", ch: "下町の刃物屋", av: "🔪", views: "21万回", ago: "1か月前", time: "30:00", tags: "職人 東京 ASMR" },
    { emoji: "🌐", bg: "linear-gradient(135deg,#6c5ce7,#a29bfe)", title: "メタバース工房 β版を先行プレイ！", ch: "工房公式", av: "工", views: "1.9万回", ago: "12時間前", time: "22:17", tags: "メタバース ゲーム 公式" },
  ];
  const renderVideos = (q = "") => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = videos.filter((v) => words.every((w) => (v.title + v.ch + v.tags).toLowerCase().includes(w)));
    $("#videoList").innerHTML = list.map((v) => `
      <button class="video reveal" type="button" data-toast="デモのため再生できません">
        <div class="video__thumb" style="--thumb:${v.bg}"><span aria-hidden="true">${v.emoji}</span><span class="video__time">${v.time}</span></div>
        <div class="video__info">
          <span class="video__avatar" aria-hidden="true">${v.av}</span>
          <div>
            <p class="video__title">${esc(v.title)}</p>
            <p class="video__sub">${esc(v.ch)}<br>${v.views}視聴・${v.ago}</p>
          </div>
        </div>
      </button>`).join("");
    $("#videoEmpty").hidden = list.length > 0;
    observeReveal();
  };
  $("#videoSearch").addEventListener("input", (e) => renderVideos(e.target.value));

  /* =======================================================
     05 工房シアター（定額配信）
     ======================================================= */
  const rows = [
    { title: "今日のTOP5", rank: true, items: [
      ["太陽を編む人びと", "☀️", "linear-gradient(160deg,#f5b041,#c0392b)"],
      ["最後の宮大工", "🏯", "linear-gradient(160deg,#7f5539,#1b1b1b)"],
      ["メタバース探偵団", "🕵️", "linear-gradient(160deg,#6c5ce7,#120b33)"],
      ["星を閉じこめる炉", "⚛️", "linear-gradient(160deg,#00b4d8,#03045e)"],
      ["旅する職人", "🧳", "linear-gradient(160deg,#ff6a88,#3a0ca3)"],
    ]},
    { title: "工房オリジナル", items: [
      ["糸と針の物語", "🧵", "linear-gradient(160deg,#ffafcc,#6a0572)", true],
      ["窯の火が消えるまで", "🔥", "linear-gradient(160deg,#ff7b00,#370617)"],
      ["棚田の四季", "🌾", "linear-gradient(160deg,#f4d35e,#386641)", true],
      ["刃の声を聞く", "🔪", "linear-gradient(160deg,#adb5bd,#212529)"],
      ["研究室の夜明け", "🔬", "linear-gradient(160deg,#48cae4,#023e8a)"],
      ["雪国のわら細工", "❄️", "linear-gradient(160deg,#caf0f8,#0077b6)"],
    ]},
    { title: "家族で楽しめるアニメ", items: [
      ["こうぼうのコウちゃん", "🐻", "linear-gradient(160deg,#ffd166,#f77f00)", true],
      ["ロボと金継ぎ", "🤖", "linear-gradient(160deg,#90e0ef,#5e60ce)"],
      ["おむすび宇宙船", "🍙", "linear-gradient(160deg,#fefae0,#283618)"],
      ["森の音楽隊", "🎻", "linear-gradient(160deg,#95d5b2,#081c15)"],
      ["きつねの宿", "🦊", "linear-gradient(160deg,#f4a261,#264653)"],
    ]},
  ];
  $("#theaterRows").innerHTML = rows.map((r) => `
    <div class="row">
      <h3 class="row__title">${esc(r.title)}</h3>
      <div class="row__track" tabindex="0" aria-label="${esc(r.title)}（横にスクロールできます）">
        ${r.items.map(([t, e, bg, isNew], i) => `
          <button class="poster" type="button" style="--thumb:${bg}" data-toast="「${esc(t)}」はデモのため再生できません">
            <span class="poster__emoji" aria-hidden="true">${e}</span>
            ${r.rank ? `<span class="poster__rank" aria-hidden="true">${i + 1}</span>` : ""}
            ${isNew ? `<span class="poster__new">新作</span>` : ""}
            <span class="poster__title">${esc(t)}</span>
          </button>`).join("")}
      </div>
    </div>`).join("");

  /* =======================================================
     06 工房マーケット（C2C・オークション）
     ======================================================= */
  const now = Date.now();
  const H = 3600 * 1000;
  const items = [
    { id: 1, kind: "auction", emoji: "🏺", bg: "linear-gradient(135deg,#d4a373,#7f4f24)", title: "清水焼 一点ものの茶碗", seller: "kyoto_kama", price: 12000, bids: 8, end: now + 2.5 * H },
    { id: 2, kind: "buy", emoji: "🔪", bg: "linear-gradient(135deg,#8d99ae,#2b2d42)", title: "職人手打ち 三徳包丁 170mm", seller: "shitamachi_hamono", price: 24800, end: now + 72 * H },
    { id: 3, kind: "auction", emoji: "📻", bg: "linear-gradient(135deg,#e9c46a,#264653)", title: "昭和レトロ 真空管ラジオ（動作品）", seller: "retro_garage", price: 8500, bids: 14, end: now + 0.8 * H },
    { id: 4, kind: "buy", emoji: "🧣", bg: "linear-gradient(135deg,#ffafcc,#a2d2ff)", title: "手織りのストール 藍染め", seller: "ai_zome_studio", price: 6800, end: now + 120 * H },
    { id: 5, kind: "auction", emoji: "🎴", bg: "linear-gradient(135deg,#e63946,#1d3557)", title: "木版画「雪の工房街」限定10枚", seller: "hanga_works", price: 30000, bids: 5, end: now + 26 * H },
    { id: 6, kind: "buy", emoji: "🍵", bg: "linear-gradient(135deg,#7fb069,#2e5e3e)", title: "宇治の新茶 100g×3袋", seller: "uji_chashi", price: 4200, end: now + 240 * H },
    { id: 7, kind: "auction", emoji: "📷", bg: "linear-gradient(135deg,#adb5bd,#343a40)", title: "フィルムカメラ（レンズ付き）", seller: "camera_kobo", price: 15500, bids: 21, end: now + 5 * H },
    { id: 8, kind: "buy", emoji: "🪆", bg: "linear-gradient(135deg,#f4a261,#e76f51)", title: "メタバース工房 限定アバター衣装（デジタル）", seller: "koubo_official", price: 1200, end: now + 400 * H },
  ];
  let mFilter = "all";
  const remain = (end) => {
    const ms = end - Date.now();
    if (ms <= 0) return "終了";
    const h = Math.floor(ms / H), m = Math.floor((ms % H) / 60000), s = Math.floor((ms % 60000) / 1000);
    if (h >= 48) return `残り${Math.floor(h / 24)}日`;
    return `残り${h}時間${String(m).padStart(2, "0")}分${String(s).padStart(2, "0")}秒`;
  };
  const renderMarket = () => {
    const sort = $("#marketSort").value;
    const list = items
      .filter((i) => mFilter === "all" || i.kind === mFilter)
      .sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : a.end - b.end);
    $("#marketList").innerHTML = list.map((i) => `
      <article class="card reveal is-in">
        <div class="card__thumb" style="--thumb:${i.bg}"><span aria-hidden="true">${i.emoji}</span></div>
        <div class="card__body">
          <p class="${i.kind === "auction" ? "tag-auction" : "tag-buy"}">${i.kind === "auction" ? "オークション" : "即決価格"}</p>
          <h3 class="card__title">${esc(i.title)}</h3>
          <p class="card__meta"><span>出品者：${esc(i.seller)}</span></p>
          <p class="price" data-price="${i.id}">${yen(i.price)}</p>
          ${i.kind === "auction"
            ? `<p class="bids">入札 <span data-bids="${i.id}">${i.bids}</span>件・<span class="ends" data-end="${i.id}">${remain(i.end)}</span></p>`
            : `<p class="bids">送料込み・匿名配送対応</p>`}
          <div class="card__foot">
            ${i.kind === "auction"
              ? `<button class="btn btn--primary btn--sm btn--block" data-bid="${i.id}">＋${yen(bidStep(i.price))} で入札（デモ）</button>`
              : `<button class="btn btn--primary btn--sm btn--block" data-toast="購入はデモのため利用できません">購入する</button>`}
          </div>
        </div>
      </article>`).join("");
  };
  function bidStep(p) { return p < 10000 ? 500 : p < 30000 ? 1000 : 2000; }
  $$("[data-mfilter]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-mfilter]").forEach((x) => x.classList.toggle("is-active", x === b));
    mFilter = b.dataset.mfilter;
    renderMarket();
  }));
  $("#marketSort").addEventListener("change", renderMarket);
  $("#marketList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-bid]");
    if (!b) return;
    const item = items.find((i) => i.id === Number(b.dataset.bid));
    if (item.end <= Date.now()) { toast("このオークションは終了しました"); return; }
    item.price += bidStep(item.price);
    item.bids += 1;
    renderMarket();
    toast(`${yen(item.price)} で入札しました（デモ・保存されません）`);
  });
  setInterval(() => {
    items.forEach((i) => { const el = $(`[data-end="${i.id}"]`); if (el) el.textContent = remain(i.end); });
  }, 1000);

  /* =======================================================
     07 未来研究ファンド
     ======================================================= */
  const UNIT = 10000;
  const projects = [
    { id: "pv", field: "PEROVSKITE SOLAR", bg: "linear-gradient(135deg,#f7971e,#d35400)", title: "曲がる太陽電池を、窓や壁に。", text: "薄くて軽いペロブスカイト太陽電池の耐久性を高め、建物の窓や外壁に貼れる実用化をめざす研究（架空のサンプル案件）。", goal: 30000000, raised: 21450000, backers: 1832, days: 24, risk: "中" },
    { id: "fusion", field: "FUSION ENERGY", bg: "linear-gradient(135deg,#00b4d8,#03045e)", title: "地上に小さな太陽をつくる", text: "フュージョン（核融合）炉の部品に使う、高温に耐える新素材を開発する研究（架空のサンプル案件）。", goal: 50000000, raised: 18200000, backers: 1407, days: 41, risk: "高" },
    { id: "battery", field: "NEXT-GEN BATTERY", bg: "linear-gradient(135deg,#2a9d8f,#264653)", title: "燃えにくく長持ちする電池", text: "再生可能エネルギーをためておくための、安全性の高い次世代蓄電池の研究（架空のサンプル案件）。", goal: 20000000, raised: 17600000, backers: 2210, days: 9, risk: "中" },
  ];
  $("#fundList").innerHTML = projects.map((p) => {
    const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
    return `
      <article class="fund reveal">
        <div class="fund__head" style="--thumb:${p.bg}">
          <p class="fund__field">${p.field}</p>
          <h3 class="fund__title">${esc(p.title)}</h3>
        </div>
        <div class="fund__body">
          <p class="fund__text">${esc(p.text)}</p>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="達成率">
            <div class="progress__bar" data-w="${pct}"></div>
          </div>
          <div class="fund__nums">
            <div><strong>${pct}%</strong><span>達成率</span></div>
            <div><strong>${p.backers.toLocaleString("ja-JP")}人</strong><span>支援者</span></div>
            <div><strong>${p.days}日</strong><span>残り</span></div>
          </div>
          <p class="card__meta"><span>集まった金額 ${yen(p.raised)}</span><span>目標 ${yen(p.goal)}</span></p>
          <p class="fund__risk">リスク区分 <b>${p.risk}</b></p>
          <a class="btn btn--primary btn--sm" href="#simProject" data-pick="${p.id}">1口 ${yen(UNIT)} から支援</a>
        </div>
      </article>`;
  }).join("");

  const simProject = $("#simProject");
  const simUnits = $("#simUnits");
  simProject.innerHTML = projects.map((p) => `<option value="${p.id}">${esc(p.title)}</option>`).join("");
  const updateSim = () => {
    $("#simUnitsOut").textContent = simUnits.value;
    $("#simTotal").textContent = yen(Number(simUnits.value) * UNIT);
  };
  simUnits.addEventListener("input", updateSim);
  $("#fundList").addEventListener("click", (e) => {
    const a = e.target.closest("[data-pick]");
    if (a) { simProject.value = a.dataset.pick; }
  });
  updateSim();

  /* =======================================================
     02 メタバース工房（ミニデモ）
     ======================================================= */
  const canvas = $("#metaCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, Hh = canvas.height;
  const zones = [
    { name: "ゲームアリーナ", desc: "謎解きやミニゲームで遊べるエリア。ランキング上位には工房コインをプレゼントする想定です。", x: 20, y: 20, w: 200, h: 130, color: "#e17055", icon: "🎮" },
    { name: "マーケット展示館", desc: "マーケットの出品物を3Dで手に取るように見られる展示エリアです。", x: W - 220, y: 20, w: 200, h: 130, color: "#0984e3", icon: "🏪" },
    { name: "ライブ教室", desc: "講師のアバターと一緒に、リアルタイムでワークショップに参加できる教室です。", x: 20, y: Hh - 150, w: 200, h: 130, color: "#00b894", icon: "🎓" },
    { name: "シアタールーム", desc: "友だちと同じ作品を同時に見ながら、感想を語り合える上映室です。", x: W - 220, y: Hh - 150, w: 200, h: 130, color: "#fdcb6e", icon: "🎬" },
  ];
  const plaza = { name: "工房広場", desc: "中央の広場です。4つのエリアに歩いていくと、それぞれの説明が表示されます。" };
  const npcs = [
    { x: 300, y: 120, vx: 0.6, vy: 0.4, c: "#fd79a8" },
    { x: 420, y: 300, vx: -0.5, vy: 0.3, c: "#55efc4" },
    { x: 520, y: 200, vx: 0.4, vy: -0.6, c: "#ffeaa7" },
  ];
  const me = { x: W / 2, y: Hh / 2, r: 14, speed: 3 };
  const keys = new Set();
  let target = null;
  let currentZone = null;

  const draw = (t) => {
    ctx.fillStyle = "#1a1636";
    ctx.fillRect(0, 0, W, Hh);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, Hh); ctx.stroke(); }
    for (let y = 0; y < Hh; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // 広場
    ctx.beginPath(); ctx.arc(W / 2, Hh / 2, 80, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(162,155,254,0.12)"; ctx.fill();
    ctx.strokeStyle = "rgba(162,155,254,0.4)"; ctx.stroke();
    // エリア
    zones.forEach((z) => {
      const active = z === currentZone;
      ctx.fillStyle = z.color + (active ? "55" : "22");
      ctx.strokeStyle = z.color;
      ctx.lineWidth = active ? 3 : 1.5;
      roundRect(z.x, z.y, z.w, z.h, 14); ctx.fill(); ctx.stroke();
      ctx.font = "34px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(z.icon, z.x + z.w / 2, z.y + z.h / 2 - 12);
      ctx.font = "bold 15px 'Noto Sans JP', sans-serif"; ctx.fillStyle = "#fff";
      ctx.fillText(z.name, z.x + z.w / 2, z.y + z.h / 2 + 26);
    });
    ctx.lineWidth = 1;
    // NPC
    npcs.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 240 || n.x > W - 240) n.vx *= -1;
      if (n.y < 40 || n.y > Hh - 40) n.vy *= -1;
      avatar(n.x, n.y, 11, n.c);
    });
    // 自分
    avatar(me.x, me.y + Math.sin(t / 200) * 1.5, me.r, "#ffffff", true);
    ctx.font = "bold 12px 'Noto Sans JP', sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.fillText("あなた", me.x, me.y - me.r - 10);
  };
  function avatar(x, y, r, c, outline) {
    ctx.beginPath(); ctx.ellipse(x, y + r + 2, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    if (outline) { ctx.strokeStyle = "#a29bfe"; ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 1; }
    ctx.fillStyle = "#1a1636";
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.15, r * 0.13, 0, Math.PI * 2); ctx.arc(x + r * 0.35, y - r * 0.15, r * 0.13, 0, Math.PI * 2); ctx.fill();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
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
      const info = z || plaza;
      $("#metaZone").textContent = info.name;
      $("#metaDesc").textContent = info.desc;
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
  new IntersectionObserver(([en]) => {
    metaVisible = en.isIntersecting;
    if (metaVisible && !running) { running = true; requestAnimationFrame(loop); }
    else if (!metaVisible) { running = false; keys.clear(); }
  }, { threshold: 0.2 }).observe(canvas);
  draw(0);

  /* ---------- 事前登録フォーム ---------- */
  $("#joinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#joinEmail");
    const msg = $("#joinMsg");
    if (!input.value || !input.checkValidity()) {
      msg.textContent = "メールアドレスの形式をご確認ください。";
      input.focus();
      return;
    }
    msg.textContent = "ありがとうございます！（デモのため、実際には送信・保存されていません）";
    input.value = "";
  });

  /* ---------- スクロール時のふわっと表示 ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      $$(".progress__bar", en.target).forEach((b) => { b.style.width = b.dataset.w + "%"; });
      io.unobserve(en.target);
    });
  }, { threshold: 0.12 }) : null;
  function observeReveal() {
    $$(".reveal:not(.is-in)").forEach((el) => io ? io.observe(el) : el.classList.add("is-in"));
    if (!io) $$(".progress__bar").forEach((b) => { b.style.width = b.dataset.w + "%"; });
  }
  $$(".svc, .eco__item, .roadmap li, .flow li").forEach((el) => el.classList.add("reveal"));

  renderTours();
  renderCourses();
  renderVideos();
  renderMarket();
  observeReveal();
})();
