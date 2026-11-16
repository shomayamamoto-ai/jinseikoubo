"""人生工房：中国語（簡体字）・韓国語の翻訳辞書をまとめて、サイト用のファイルを作る。

  使い方：python3 tools/build_i18n.py
  入力：tools/i18n/zhko_*.json（英語 → [中国語, 韓国語]）
  出力：assets/js/i18n-zhko.js
  確認：tools/i18n_strings.json（翻訳が必要な英語の一覧。tools/extract_i18n.js で作成）と照らし合わせ、
        訳し漏れがあれば一覧を表示する。
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
merged = {}
for f in sorted((ROOT / "tools/i18n").glob("zhko_*.json")):
    for en, pair in json.loads(f.read_text(encoding="utf-8")).items():
        assert isinstance(pair, list) and len(pair) == 2, (f.name, en)
        merged[en.strip()] = pair

# 数字や名前が入る文章（{0} など）は、正規表現の型にする
exact, templates = {}, []
for en, (zh, ko) in merged.items():
    if re.search(r"\{\d\}", en):
        parts = re.split(r"(\{\d\})", en)
        rx = "".join("(.*?)" if re.fullmatch(r"\{\d\}", p) else re.escape(p) for p in parts)
        order = [int(p[1]) for p in parts if re.fullmatch(r"\{\d\}", p)]
        templates.append(["^" + rx + "$", order, zh, ko])
    else:
        exact[en] = [zh, ko]

js = ("/* 自動生成：tools/build_i18n.py が作成。翻訳は tools/i18n/zhko_*.json を直してください。 */\n"
      "window.JK_I18N_ZHKO = " + json.dumps({"exact": exact, "templates": templates}, ensure_ascii=False) + ";\n")
(ROOT / "assets/js/i18n-zhko.js").write_text(js, encoding="utf-8")

need = json.loads((ROOT / "tools/i18n_strings.json").read_text(encoding="utf-8"))
ignore = {"pointerleave", "English", "en-US"}  # 言語名「English」は訳さない
missing = [s for s in need if s.strip() not in merged and s not in ignore]
print(f"entries: {len(merged)} (exact {len(exact)}, templates {len(templates)}) | missing: {len(missing)}")
for s in missing:
    print("  MISSING:", s)
