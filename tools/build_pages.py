"""人生工房：サービスごとの詳細ページを生成する。

トップページ（index.html）のヘッダー・フッター・各セクションを部品として使い、
7つの詳細ページ（tour.html など）と、英語の文言（assets/js/i18n-pages.js）を作る。

使い方：python3 tools/build_pages.py
（index.html のヘッダーやセクションを直したら、もう一度実行すると全ページに反映される）
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://shomayamamoto-ai.github.io/jinseikoubo/"
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
EN = {}  # data-i18n のキー → 英語


def t(key, ja, en, tag="span", cls=None, attrs=""):
    """日本語を書き、英語を辞書に登録する"""
    EN[key] = en
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c} data-i18n="{key}"{attrs}>{ja}</{tag}>'


def section(sec_id):
    """index.html から、id の付いたセクションを丸ごと取り出す"""
    m = re.search(rf'    <!-- =====[^\n]*-->\n    <section[^>]*id="{sec_id}"[\s\S]*?</section>\n', INDEX)
    if not m:
        m = re.search(rf'    <section[^>]*id="{sec_id}"[\s\S]*?</section>\n', INDEX)
    assert m, sec_id
    return re.sub(r'\n\s*<a class="more-link"[^\n]*', "", m.group(0))


SERVICES = [
    # id, ページ, 漢字, 英字, 色, イラスト, 和柄, 背景
    ("tour", "tour.html", "旅", "INBOUND TOUR", "--c-tour", "teacup", "seigaiha", "linear-gradient(135deg,#7fb069,#2e5e3e)"),
    ("metaverse", "metaverse.html", "遊", "METAVERSE", "--c-meta", "globe", "kikko", "linear-gradient(135deg,#2f2668,#5a49b8)"),
    ("academy", "academy.html", "学", "ACADEMY", "--c-academy", "kintsugi", "shippo", "linear-gradient(135deg,#2c5a40,#4f8f6a)"),
    ("channel", "channel.html", "発", "CHANNEL", "--c-channel", "camera", "kikko", "linear-gradient(135deg,#6b2420,#b2453a)"),
    ("theater", "theater.html", "観", "THEATER", "--c-theater", "film", "seigaiha", "linear-gradient(135deg,#3a2a12,#8a6420)"),
    ("market", "market.html", "市", "MARKET", "--c-market", "print", "ichimatsu", "linear-gradient(135deg,#22436e,#3c7fb1)"),
    ("fund", "fund.html", "研", "FUTURE RESEARCH FUND", "--c-fund", "solar", "seigaiha", "linear-gradient(135deg,#155a52,#3a9b8f)"),
]
NAMES = {
    "tour": ("インバウンドツアー", "Inbound Tours"), "metaverse": ("メタバース工房", "Metaverse Workshop"),
    "academy": ("アカデミー", "Academy"), "channel": ("工房チャンネル", "Koubo Channel"),
    "theater": ("工房シアター", "Koubo Theater"), "market": ("工房マーケット", "Koubo Market"),
    "fund": ("未来研究ファンド", "Future Research Fund"),
}

# ---------- 各ページの中身（日本語, 英語） ----------
C = {
    "tour": {
        "title": ("日本の「つくる」に会いにいく旅", "Meet the makers of Japan"),
        "lead": ("職人の工房や地域の暮らしに入り込む、訪日客向けの体験型ツアーです。英語などの多言語ガイドが、技の背景まで丁寧に伝えます。",
                 "Hands-on tours for visitors to Japan that take you inside artisan workshops and local life, with multilingual guides who explain the stories behind each craft."),
        "cta": ("ツアーを探す", "Find a tour"),
        "points": [("vase", "職人と、同じ机で", "At the artisan's own bench", "見学で終わらず、ろくろや研ぎなどの工程を、職人の隣で実際に体験します。", "Go beyond watching: try the wheel, the whetstone and more, right beside the artisan."),
                   ("speech", "言葉の壁をなくす", "No language barrier", "英語・中国語などのガイドが同行し、道具の名前や技の意味まで通訳します。", "Guides in English, Chinese and more translate everything from tool names to the meaning of each technique."),
                   ("onsen", "旅のあとも続く", "It continues after the trip", "出会った職人の講座をオンラインで受けたり、作品をマーケットで買ったりできます。", "Take online courses with the artisans you met, or buy their work in the market.")],
        "steps": [("ツアーを選ぶ", "Choose a tour", "地域・日数・体験の内容から選びます。", "Filter by region, length and activity."),
                  ("日程を予約する", "Book a date", "空いている日程と人数を選んで予約します。", "Pick an available date and group size."),
                  ("当日、集合場所へ", "Meet on the day", "ガイドと合流し、職人の工房へ向かいます。", "Meet your guide and head to the workshop."),
                  ("体験を持ち帰る", "Take it home", "作品の海外配送や、続きの講座を選べます。", "Ship your piece overseas or continue with a course.")],
        "faq": [("日本語が話せなくても参加できますか？", "Can I join without speaking Japanese?", "はい。英語などのガイドが同行する前提で企画しています。対応言語は各ツアーに表示します。", "Yes. Tours are planned with guides in English and other languages. Each tour lists its languages."),
                ("作った作品は持ち帰れますか？", "Can I take my work home?", "焼き物など、仕上げに時間がかかる作品は、完成後に海外へ配送する想定です。", "For pieces that need time to finish, such as fired pottery, we plan to ship them overseas once complete."),
                ("子どもも参加できますか？", "Can children join?", "ツアーごとに参加できる年齢を設定する予定です。酒蔵での試飲は20歳以上に限ります。", "Age requirements will be set for each tour. Sake tastings are for ages 20 and over only.")],
    },
    "metaverse": {
        "title": ("遊びながら、世界とつながる", "Play and connect with the world"),
        "lead": ("仮想空間の「工房街」をアバターで歩き、ゲームや交流会、作品の3D展示を楽しめます。旅の前の下見にも、旅のあとの再会にも使えます。",
                 "Walk a virtual workshop town as an avatar and enjoy games, meetups and 3D displays of crafts. Use it to preview a trip, or to reunite after one."),
        "cta": ("工房街を歩いてみる", "Walk the workshop town"),
        "points": [("gamepad", "遊んで学ぶ", "Learn through play", "謎解きやクイズで、工芸や研究のことを楽しく知ることができます。", "Puzzles and quizzes make crafts and research fun to explore."),
                   ("shop", "作品を手に取るように", "See crafts up close", "マーケットの品を3Dで回して見て、そのまま購入ページへ進めます。", "Rotate market items in 3D, then go straight to the product page."),
                   ("classroom", "距離をこえて集まる", "Gather across distance", "講師やツアーで出会った人と、世界のどこからでも集まれます。", "Meet instructors and fellow travelers from anywhere in the world.")],
        "steps": [("アバターをつくる", "Create an avatar", "共通アカウントでログインし、見た目を選びます。", "Sign in with your shared account and choose a look."),
                  ("工房街を歩く", "Explore the town", "エリアを歩き、気になる場所に入ります。", "Walk around and step into any area."),
                  ("イベントに参加する", "Join events", "ゲームや交流会、上映会に参加します。", "Join games, meetups and screenings.")],
        "faq": [("専用の機器は必要ですか？", "Do I need special equipment?", "パソコンやスマホのブラウザで遊べる形を想定しています。VRゴーグルは必須にしない予定です。", "We plan for it to run in a computer or phone browser. VR headsets will not be required."),
                ("料金はかかりますか？", "Is there a fee?", "入場は無料、一部の有料イベントやデジタル商品の購入で料金がかかる想定です。", "Entry is planned to be free, with fees only for some paid events and digital items."),
                ("このページのデモでは何ができますか？", "What can I do in this demo?", "アバターで4つのエリアを歩き、ゲームアリーナのクイズや各サービスのページへ移動できます。", "Walk your avatar through four areas, play the quiz in the Game Arena, and jump to each service.")],
    },
    "academy": {
        "title": ("職人と研究者から、直接学ぶ", "Learn directly from artisans and researchers"),
        "lead": ("金継ぎ・木工・日本酒から、次世代の太陽電池まで。録画の講座でいつでも学べるほか、講師とつながるライブのワークショップも開きます。",
                 "From kintsugi, woodworking and sake to next-generation solar cells. Learn anytime with recorded courses, or connect with instructors in live workshops."),
        "cta": ("講座を探す", "Find a course"),
        "points": [("kintsugi", "本物の作り手が教える", "Taught by real makers", "講師は、現役の職人や研究者です。道具の扱いから考え方まで学べます。", "Instructors are working artisans and researchers, teaching everything from tools to mindset."),
                   ("camera", "録画とライブを選べる", "Recorded or live", "自分のペースで進める録画講座と、質問できるライブを選べます。", "Choose self-paced recorded courses or live sessions where you can ask questions."),
                   ("coin", "学んだことが形に残る", "Learning that lasts", "修了するとデジタル修了証を発行し、工房コインもたまる想定です。", "Earn a digital certificate and Koubo Coins when you finish (planned).")],
        "steps": [("講座を選ぶ", "Choose a course", "録画かライブか、分野や長さで選びます。", "Filter by format, subject and length."),
                  ("受講を始める", "Start learning", "録画はすぐに、ライブは開催日に参加します。", "Recorded courses start now; live ones on their date."),
                  ("作品や成果を共有する", "Share your work", "工房チャンネルで発信したり、講師に見てもらえます。", "Post on the Channel or get feedback from your instructor.")],
        "faq": [("材料や道具は必要ですか？", "Do I need materials or tools?", "講座ごとに必要なものを事前に案内します。道具セットの販売も検討しています。", "Each course lists what you need in advance. We are also considering tool kits."),
                ("英語の講座はありますか？", "Are there courses in English?", "訪日客向けの英語講座から始め、字幕で多言語に広げていく予定です。", "We plan to start with English courses for visitors and expand to more languages with subtitles."),
                ("講師として参加できますか？", "Can I teach?", "職人・研究者・クリエイターの講師登録を、正式公開に合わせて受け付ける予定です。", "We plan to open instructor sign-ups for artisans, researchers and creators at launch.")],
    },
    "channel": {
        "title": ("誰もが、作り手であり発信者", "Everyone is a maker and a creator"),
        "lead": ("職人の手仕事、旅の記録、研究者の解説。だれでも動画を投稿でき、広告やファンからの応援で、発信者に収益が届くしくみを想定しています。",
                 "Artisan craft, travel diaries, research explainers: anyone can post videos, and creators are planned to earn from ads and fans' support."),
        "cta": ("動画を見る", "Watch videos"),
        "points": [("camera", "スマホ1台で発信", "Post with just a phone", "撮影から投稿まで、スマホで完結します。撮り方の講座もあります。", "Film and post entirely on your phone, with courses on how to shoot."),
                   ("coin", "応援が収益になる", "Support becomes income", "広告収益と、ファンからの応援（投げ銭）が、発信者に届きます。", "Ad revenue and fans' tips go to the creator."),
                   ("onsen", "見るだけで終わらない", "More than watching", "動画から、紹介されたツアーや講座、商品へそのまま進めます。", "Go straight from a video to the tour, course or item it features.")],
        "steps": [("見る・探す", "Watch and search", "キーワードやテーマで動画を探します。", "Find videos by keyword or theme."),
                  ("投稿する", "Post", "共通アカウントで、だれでも投稿できます。", "Anyone can post with a shared account."),
                  ("応援する・される", "Support and be supported", "気に入った発信者を、投げ銭で応援できます。", "Tip the creators you enjoy.")],
        "faq": [("投稿に審査はありますか？", "Are posts reviewed?", "利用規約に沿って、不適切な内容を確認するしくみを設ける予定です。", "We plan to review content against our terms of use."),
                ("どのくらい収益になりますか？", "How much can I earn?", "収益の配分率は未定です。正式公開時にお知らせします。", "Revenue shares have not been decided and will be announced at launch."),
                ("海外からも見られますか？", "Can people abroad watch?", "はい。字幕の自動翻訳など、海外の視聴者に届けるしくみを検討しています。", "Yes. We are exploring tools such as automatic subtitle translation.")],
    },
    "theater": {
        "title": ("作り手の物語を、見放題で", "The stories of makers, unlimited"),
        "lead": ("職人や研究者を追ったドキュメンタリー、工房を舞台にしたドラマ、家族で楽しめるアニメ。オリジナル作品を、月額定額で見放題にする配信サービスです。",
                 "Documentaries about artisans and researchers, dramas set in workshops, and anime for the whole family: original titles, unlimited for one monthly fee."),
        "cta": ("作品を見る", "Browse titles"),
        "points": [("film", "ここでしか見られない", "Only here", "人生工房の職人・研究者・旅を題材にした、オリジナル作品です。", "Original titles about our artisans, researchers and journeys."),
                   ("globe", "仲間と同時に見る", "Watch together", "メタバースのシアタールームで、友だちと同じ作品を見られます。", "Watch the same title with friends in the Metaverse Theater Room."),
                   ("solar", "見たあとに支える", "Watch, then support", "作品で知った研究を、そのまま研究ファンドで応援できます。", "Back the research you discover, right from the film.")],
        "steps": [("プランに登録する", "Subscribe", "月額プランに登録します（料金は未定）。", "Sign up for a monthly plan (price to be decided)."),
                  ("作品を選ぶ", "Pick a title", "ランキングやジャンルから選びます。", "Browse rankings and genres."),
                  ("どこでも見る", "Watch anywhere", "スマホ・パソコン・テレビで見られる想定です。", "Planned for phones, computers and TVs.")],
        "faq": [("料金はいくらですか？", "How much does it cost?", "月額料金は未定です。正式公開時にお知らせします。", "The monthly price has not been decided and will be announced at launch."),
                ("字幕はありますか？", "Are there subtitles?", "日本語と英語の字幕から始める予定です。", "We plan to start with Japanese and English subtitles."),
                ("ダウンロードできますか？", "Can I download titles?", "オフライン再生の機能を検討しています。", "We are considering offline playback.")],
    },
    "market": {
        "title": ("手から手へ、価値を手渡す", "Passing value from hand to hand"),
        "lead": ("作品、古道具、旅で出会った品を、個人どうしで売り買いできるマーケットです。「即決購入」と「オークション入札」の2つの買い方を用意します。",
                 "A marketplace where people buy and sell crafts, vintage finds and items discovered on their travels, either at a fixed price or by auction."),
        "cta": ("商品を見る", "Browse items"),
        "points": [("print", "一点ものに出会える", "Find one-of-a-kind pieces", "職人の作品や、旅先でしか手に入らない品が集まります。", "Artisan works and items you can only find on the road."),
                   ("shop", "2つの買い方", "Two ways to buy", "すぐに買える即決価格と、競り合うオークションを選べます。", "Buy instantly at a fixed price, or bid at auction."),
                   ("coin", "売上の一部が未来へ", "Sales that help the future", "売上の一部を研究ファンドに回すしくみを検討しています。", "We are exploring ways to direct part of sales to the research fund.")],
        "steps": [("商品を探す", "Find an item", "形式や価格、終了が近い順で探します。", "Filter by format, price or ending soonest."),
                  ("購入・入札する", "Buy or bid", "即決はカートへ、オークションは入札します。", "Add to cart, or place a bid."),
                  ("受け取って評価する", "Receive and rate", "受け取りを確認すると、出品者に代金が支払われます。", "The seller is paid once you confirm delivery.")],
        "faq": [("海外から買えますか？", "Can I buy from abroad?", "海外発送に対応する出品者から順に、対応を広げる予定です。", "We plan to start with sellers who ship internationally."),
                ("出品に手数料はかかりますか？", "Are there selling fees?", "売れたときに手数料をいただく形を想定しています。率は未定です。", "We plan to charge a fee only when an item sells. The rate has not been decided."),
                ("出品できないものはありますか？", "Is anything prohibited?", "法令で禁止されているものなど、出品できない品のルールを正式公開時に定めます。", "Rules on prohibited items, including those banned by law, will be set at launch.")],
    },
    "fund": {
        "title": ("1万円から、未来の研究を支える", "Back frontier science from ¥10,000"),
        "lead": ("ペロブスカイト太陽電池やフュージョンエネルギーなど、最先端の研究を個人が少額から支援できるしくみです。進み具合はレポートや動画で届きます。",
                 "A way for individuals to back frontier research, such as perovskite solar cells and fusion energy, from small amounts, with progress shared through reports and videos."),
        "cta": ("研究案件を見る", "See projects"),
        "points": [("solar", "最先端の研究に参加", "Take part in frontier research", "これまで大企業や国が中心だった研究に、個人として関われます。", "Get involved in research once led mainly by large companies and governments."),
                   ("camera", "進み具合が見える", "See the progress", "研究室からのレポートや動画、見学会で、成果までを見届けます。", "Follow along with lab reports, videos and tours."),
                   ("coin", "リスクも正直に", "Honest about risk", "案件ごとにリスク区分を示し、お金が戻らない可能性も明記します。", "Each project shows a risk level and states that you may not get your money back.")],
        "steps": [("案件を選ぶ", "Choose a project", "研究内容・リスク・資金の使い道を確認します。", "Review the research, risks and use of funds."),
                  ("口数を決める", "Decide your units", "1口1万円程度から、支援額を決めます。", "Choose how many units, from about ¥10,000 each."),
                  ("進み具合を見届ける", "Follow the progress", "レポートや動画、見学会で成果を見届けます。", "Follow results through reports, videos and lab tours.")],
        "faq": [("お金は増えますか？", "Will my money grow?", "増えるとは限りません。研究は失敗することもあり、支援したお金が戻らない可能性があります。", "Not necessarily. Research can fail, and you may not get your money back."),
                ("いつから始まりますか？", "When does it start?", "法令にもとづく体制を整えてから始めます。まずは購入型（体験などのリターン）から検討しています。", "Only after the legal framework is in place. We are first considering a reward-based model."),
                ("どんな研究が対象ですか？", "What research is eligible?", "次世代エネルギーなど、社会への影響が大きい研究を、審査のうえで掲載する予定です。", "High-impact research such as next-generation energy, listed after review.")],
    },
}


def page(sid):
    _, file, kanji, en_label, color, art, pattern, bg = next(s for s in SERVICES if s[0] == sid)
    c = C[sid]
    name_ja, name_en = NAMES[sid]
    k = f"pg.{sid}"
    points = "\n".join(
        f'''          <li class="point">
            <span class="point__icon" data-icon="{ic}" aria-hidden="true"></span>
            {t(f"{k}.pt{i}", f"<b>{hj}</b><p>{pj}</p>", f"<b>{he}</b><p>{pe}</p>", "div")}
          </li>''' for i, (ic, hj, he, pj, pe) in enumerate(c["points"]))
    steps = "\n".join(
        f'          <li><span>{i + 1}</span>{t(f"{k}.st{i}", f"<strong>{aj}</strong><p>{bj}</p>", f"<strong>{ae}</strong><p>{be}</p>", "div")}</li>'
        for i, (aj, ae, bj, be) in enumerate(c["steps"]))
    faq = "\n".join(
        f'          {t(f"{k}.faq{i}", f"<summary>{qj}</summary><p>{aj}</p>", f"<summary>{qe}</summary><p>{ae}</p>", "details")}'
        for i, (qj, qe, aj, ae) in enumerate(c["faq"]))
    others = "\n".join(
        f'          <li><a class="other" href="{f}" style="--c:var({col})"><span class="other__mark" aria-hidden="true">{kj}</span>{t(f"nav.name.{s}", NAMES[s][0], NAMES[s][1])}<span class="other__arrow" aria-hidden="true">→</span></a></li>'
        for s, f, kj, _, col, *_ in SERVICES if s != sid)
    body_section = section(sid)
    main = f'''<main id="main">
    <section class="page-hero" style="--c:var({color})">
      <div class="container">
        <nav class="crumbs" aria-label="{'パンくずリスト'}">
          <a href="./">{t("crumb.top", "トップ", "Home")}</a><span aria-hidden="true">›</span><span aria-current="page">{t(f"nav.name.{sid}", name_ja, name_en)}</span>
        </nav>
        <div class="page-hero__inner">
          <div class="page-hero__text">
            <p class="section__en"><span class="badge" aria-hidden="true">{kanji}</span>{en_label}</p>
            {t(f"{k}.h1", c["title"][0], c["title"][1], "h1", "page-hero__title")}
            {t(f"{k}.lead", c["lead"][0], c["lead"][1], "p", "page-hero__lead")}
            <div class="page-hero__cta">
              <a class="btn btn--primary" href="#{sid}">{t(f"{k}.cta", c["cta"][0], c["cta"][1])}</a>
              <a class="btn btn--line" href="#join">{t("cta.join", "事前登録する", "Sign up")}</a>
            </div>
          </div>
          <div class="page-hero__art" data-art="{art}" data-pattern="{pattern}" style="--thumb:{bg}"></div>
        </div>
      </div>
    </section>

    <section class="section points-sec">
      <div class="container">
        <header class="section__head">
          <p class="section__en">FEATURES</p>
          {t("h.features", "3つの特長", "Three features", "h2", "section__title")}
        </header>
        <ul class="points">
{points}
        </ul>
      </div>
    </section>

{body_section}
    <section class="section">
      <div class="container">
        <header class="section__head">
          <p class="section__en">HOW IT WORKS</p>
          {t("h.steps", "ご利用の流れ", "How it works", "h2", "section__title")}
        </header>
        <ol class="flow flow--page">
{steps}
        </ol>
        {t("note.concept", "※構想段階の流れです。正式公開までに変わる場合があります。", "* This flow is at the concept stage and may change before launch.", "p", "note")}
      </div>
    </section>

    <section class="section section--tint">
      <div class="container container--narrow">
        <header class="section__head">
          <p class="section__en">FAQ</p>
          {t("h.faq", "よくある質問", "Frequently asked questions", "h2", "section__title")}
        </header>
        <div class="faq">
{faq}
        </div>
      </div>
    </section>

    <section class="section others-sec">
      <div class="container">
        <header class="section__head">
          <p class="section__en">OTHER WORKSHOPS</p>
          {t("h.others", "ほかの工房もみる", "Explore the other workshops", "h2", "section__title")}
        </header>
        <ul class="others">
{others}
        </ul>
      </div>
    </section>

{section("join")}  </main>'''
    return main, file, name_ja, name_en, c


def build():
    head_end = INDEX.index('<main id="main">')
    tail_start = INDEX.index("  </main>") + len("  </main>")
    head, tail = INDEX[:head_end], INDEX[tail_start:]
    # フッターのリンクは、トップページ内の場所を指すので、詳細ページでは「トップの該当箇所」へ
    tail = re.sub(r'href="#(services|why|model|roadmap|faq)"', r'href="./#\1"', tail)
    for sid, *_ in SERVICES:
        main, file, name_ja, name_en, c = page(sid)
        h = head
        h = re.sub(r"<title>[^<]*</title>", f"<title>{name_ja}｜人生工房</title>", h)
        desc = c["lead"][0]
        h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
        h = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{name_ja}｜人生工房">', h)
        h = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', h)
        h = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{SITE_URL}{file}">', h)
        h = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{SITE_URL}{file}">', h)
        h = re.sub(r'<meta name="jk:title-en" content="[^"]*">', "", h)
        h = h.replace("</title>", f'</title>\n  <meta name="jk:title-en" content="{name_en} | Jinsei Koubo">', 1)
        # 今いるページのメニューに印を付ける
        h = h.replace(f'<li><a href="{file}">', f'<li><a href="{file}" aria-current="page">', 1)
        html = h + main + tail
        (ROOT / file).write_text(html, encoding="utf-8")
        print("wrote", file)
    js = ("/* 自動生成：tools/build_pages.py が作成。直接編集しないでください。 */\n"
          "window.JK_I18N_PAGES = " + json.dumps(EN, ensure_ascii=False, indent=2) + ";\n")
    (ROOT / "assets/js/i18n-pages.js").write_text(js, encoding="utf-8")
    print("wrote assets/js/i18n-pages.js", len(EN), "keys")


if __name__ == "__main__":
    build()
