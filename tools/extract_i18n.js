/*
  人生工房：翻訳が必要な英語の文章を、コードからもれなく抜き出す

  使い方：node tools/extract_i18n.js <acorn のフォルダ>
  出力：tools/i18n_strings.json（英語の文章の一覧）

  ・tr("日本語", "英語") の英語（`…${x}…` は {0} {1} … に置きかえる）
  ・データの en: { … } と、["日本語", "英語", …] の組
  ・英語の固定テキスト（I18N_STATIC）と、詳細ページの英語（i18n-pages.js）
  ・ゲームページ（game.html）の文章
*/
const fs = require('fs');
const path = require('path');
const modDir = process.argv[2];
const acorn = require(path.join(modDir, 'acorn'));
const walk = require(path.join(modDir, 'acorn-walk'));
const ROOT = path.resolve(__dirname, '..');
const JA = /[ぁ-んァ-ヶ一-龠]/;
const out = new Set();

const tmpl = (node) => {
  // テンプレート文字列を「固定部分＋ {0} {1} …」の形にする
  let s = '';
  node.quasis.forEach((q, i) => { s += q.value.cooked; if (i < node.expressions.length) s += `{${i}}`; });
  return s;
};
const strOf = (n) => {
  if (!n) return [];
  if (n.type === 'Literal' && typeof n.value === 'string') return [n.value];
  if (n.type === 'TemplateLiteral') return [tmpl(n)];
  if (n.type === 'ConditionalExpression') return [...strOf(n.consequent), ...strOf(n.alternate)];
  if (n.type === 'BinaryExpression' && n.operator === '+') {
    const l = strOf(n.left), r = strOf(n.right);
    if (l.length === 1 && r.length === 1) return [l[0] + r[0]];
    return [...l, ...r];
  }
  return [];
};
const add = (s) => {
  s = s.trim();
  // 漢字の印（<i>旅</i> や <span class="mark">旅</span>）は飾りなので、判定から外す
  const bare = s.replace(/<(i|span)[^>]*>[一-龠]<\/\1>/g, '');
  if (!s || JA.test(bare) || !/[A-Za-z]{2}/.test(bare)) return;
  if (/^(#|\.|\[[a-z-]+[=\]]|--|data-|aria-|linear-gradient|https?:|var\(|rotate|[a-z-]+\.html)/.test(s)) return;
  out.add(s);
};

const scan = (code, label) => {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
  walk.full(ast, (n) => {
    // tr("ja", "en")
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'tr' && n.arguments.length >= 2) strOf(n.arguments[1]).forEach(add);
    // 英語の辞書（I18N_KEYS = { "キー": "英語", … }）
    if (n.type === 'VariableDeclarator' && n.id.name === 'I18N_KEYS' && n.init && n.init.type === 'ObjectExpression') n.init.properties.forEach((p) => strOf(p.value).forEach(add));
    // en: { … } / en: "…"
    if (n.type === 'Property' && ((n.key.name || n.key.value) === 'en')) {
      if (n.value.type === 'ObjectExpression') n.value.properties.forEach((p) => { if ((p.key.name || p.key.value) !== 'tags') strOf(p.value).forEach(add); });
      else strOf(n.value).forEach(add);
    }
    // ["日本語", "英語", …]
    if (n.type === 'ArrayExpression' && n.elements.length >= 2) {
      const a = strOf(n.elements[0]), b = strOf(n.elements[1]);
      if (a.length === 1 && b.length === 1 && JA.test(a[0])) add(b[0]);
      // I18N_STATIC：[セレクター, 英語, 属性?]
      if (a.length === 1 && b.length === 1 && /^[#.\[a-z:]/.test(a[0]) && !JA.test(a[0]) && !JA.test(b[0].replace(/<(i|span)[^>]*>[一-龠]<\/\1>/g, '')) && (n.elements.length === 2 || n.elements.length === 3)) add(b[0]);
    }
  });
};

scan(fs.readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8'), 'main.js');
const game = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
[...game.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m) => { try { scan(m[1], 'game.html'); } catch (e) { /* 短い初期化スクリプトなど */ } });
const pagesJs = fs.readFileSync(path.join(ROOT, 'assets/js/i18n-pages.js'), 'utf8');
const pages = JSON.parse(pagesJs.slice(pagesJs.indexOf('{'), pagesJs.lastIndexOf('}') + 1));
Object.values(pages).forEach(add);

const list = [...out].sort();
fs.writeFileSync(path.join(__dirname, 'i18n_strings.json'), JSON.stringify(list, null, 1));
console.log('strings:', list.length, '| chars:', list.join('').length);
