import * as fs from "fs";
import * as path from "path";

const RULES_PATH = path.join(__dirname, "../../tokens/ux-rules.json");

interface Rule {
  id: string;
  name: string;
  severity: string;
  checks: string[];
  violations: string[];
}

interface Principle {
  id: string;
  name: string;
  rules: Rule[];
}

interface UxRules {
  principles: Record<string, Principle>;
}

const fixSuggestions: Record<string, string[]> = {
  n01: [
    "ボタンに`disabled`属性とローディングスピナーを追加する",
    "操作後にトースト通知（成功/失敗）を表示する",
    "パンくずリストまたはアクティブなナビゲーションを追加する",
    "例: `<button disabled><span class='spinner'></span>処理中...</button>`",
  ],
  n02: [
    "専門用語をユーザーが普段使う言葉に置き換える",
    "例: 「レコードを保存」→「保存する」、「削除フラグ」→「削除済み」",
    "アイコンにはaria-labelかツールチップを必ず付ける",
  ],
  n03: [
    "すべてのモーダル・ダイアログにキャンセルボタンとESCキー対応を追加する",
    "削除・送信前に確認ダイアログを表示する",
    "例: `<button onclick='confirmDelete()'>削除</button>`",
    "フォームの途中離脱時は入力内容を保持する（localStorage活用）",
  ],
  n04: [
    "ボタンラベルを統一する（「保存する」に統一など）",
    "プライマリボタンは常に右側・下側に配置する",
    "デザインシステム（melta UI）のコンポーネント仕様に従う",
  ],
  n05: [
    "inputにrequired・pattern属性を追加する",
    "日付はtext inputではなくdate pickerを使う",
    "プレースホルダーで入力例を示す（例: `placeholder='例: 2024-01-01'`）",
    "フォーム送信前にリアルタイムバリデーションを実装する",
  ],
  n06: [
    "前ステップの入力値を次ステップに引き継ぐ",
    "よく使う選択肢をデフォルト値として設定する",
    "ページタイトル・パンくずで現在のコンテキストを常に表示する",
  ],
  n07: [
    "よく使う操作にキーボードショートカットを追加する",
    "一覧画面にフィルタ・ソート・一括操作を追加する",
    "ナビゲーションにショートカットリンク（お気に入り・最近使った項目）を追加する",
  ],
  n08: [
    "1画面に表示する情報を絞り込む（詳細は別画面・展開式に）",
    "使用頻度の低い機能は折りたたみ・詳細設定に移動する",
    "情報の視覚的な重みを統一する（フォントサイズ・色の階層を整理）",
  ],
  n09: [
    "エラーメッセージを日本語で具体的に書く",
    "例: 「入力エラー」→「メールアドレスの形式が正しくありません（例: user@example.com）」",
    "エラーのあるフィールドを赤枠でハイライトする",
    "エラー解決策を明示する（「○○してください」形式）",
  ],
  n10: [
    "フォームフィールドにplaceholderとツールチップを追加する",
    "複雑な操作には「？」アイコン付きのインラインヘルプを追加する",
    "よくある質問（FAQ）を操作画面の近くに配置する",
  ],
  g01: [
    "関連する要素のgapを8px以下に、グループ間は24px以上にする",
    "ラベルとフィールドの間隔は4〜8px（melta UIのspacing-1〜2を使用）",
    "キャンセルと破壊的アクションのボタンは離して配置する",
  ],
  g02: [
    "リンクには色（primary-500）＋下線で視覚的に区別する",
    "プライマリ・セカンダリ・デンジャーボタンのスタイルを明確に差別化する",
    "クリック不可の要素は`cursor: default`とグレーアウトで区別する",
  ],
  g03: [
    "アイコンはLucideなど標準ライブラリから選び、意味を統一する",
    "ボーダーを省略する場合は余白（padding 16px以上）でグループを区切る",
  ],
  g04: [
    "フォームフィールドは単一カラムに統一する",
    "CTAボタンはコンテンツの最後・自然な視線の終点に配置する",
    "F字・Z字の視線パターンに合わせて重要情報を左上に配置する",
  ],
  g05: [
    "テキストと背景のコントラスト比を4.5:1以上に保つ（WCAG AA）",
    "モーダル背景には`rgba(0,0,0,0.5)`のオーバーレイを使用する",
    "アクティブ状態は背景色変更＋境界線の両方で示す",
  ],
  g06: [
    "アコーディオンの開閉には同一方向のアニメーション（slide-down）を使う",
    "関連する複数要素は同時に更新し、バラバラに動かさない",
  ],
  g07: [
    "8pxグリッドに揃えてレイアウトを整理する",
    "装飾（グラデーション・シャドウ・カラーバー）を最小限にする",
    "melta UIの禁止パターンに従い、`shadow-lg`や`border-l-4`カラーバーを避ける",
  ],
  w01: [
    "テキストと背景のコントラスト比を4.5:1以上にする（Chrome DevToolsで確認可能）",
    "色だけでなくアイコンやテキストでも状態を伝える（例: エラーは赤色＋「!」アイコン＋テキスト）",
    "薄いグレー（`#999`以上明るい色）を白背景で使わない",
  ],
  w02: [
    "`<img>`に意味を伝える`alt`属性を追加する（例: `alt=\"売上推移グラフ\"`）",
    "装飾的な画像は`alt=\"\"`で読み飛ばす（空文字のaltは必要）",
    "アイコンボタンに`aria-label`を追加する（例: `<button aria-label=\"検索\"><i class=\"icon-search\"></i></button>`）",
  ],
  w03: [
    "`<div onclick>`を`<button>`に置き換える（キーボード操作・スクリーンリーダー対応が自動で得られる）",
    "`tabindex`の正の値を使わず、DOM順序でフォーカス順を制御する",
    "カスタムUIには`onkeydown`でEnter/Spaceキーのハンドラを追加する",
  ],
  w04: [
    "`outline: none`を使う場合は`box-shadow`や`border`で代替フォーカススタイルを用意する",
    "例: `:focus-visible { box-shadow: 0 0 0 2px var(--primary-500); outline: none; }`",
    "`:focus`ではなく`:focus-visible`を使うと、マウスクリック時はリングが出ずキーボード操作時のみ表示される",
  ],
  w05: [
    "`<input>`に`<label for=\"fieldId\">`を関連付ける",
    "`placeholder`はラベルの代わりにならない（入力開始で消えるため）",
    "例: `<label for=\"email\">メールアドレス</label><input id=\"email\" type=\"email\">`",
  ],
  w06: [
    "エラーフィールドに`aria-invalid=\"true\"`を設定する",
    "エラーメッセージを`aria-describedby`でフィールドに紐付ける",
    "例: `<input aria-invalid=\"true\" aria-describedby=\"email-error\"><span id=\"email-error\">メールアドレスの形式が正しくありません</span>`",
  ],
  w07: [
    "見出しレベルを飛ばさない（h1→h2→h3の順で使う）",
    "ページにh1は1つだけにする",
    "見た目のサイズ調整はCSSで行い、意味的な見出しレベルを正しく保つ",
  ],
  w08: [
    "ナビゲーションは`<nav>`、メインコンテンツは`<main>`で囲む",
    "リストは`<ul>`/`<ol>`で、データテーブルは`<table>`でマークアップする",
    "`<div class=\"button\">`ではなく`<button>`を使う（WAI-ARIAよりネイティブHTMLを優先）",
  ],
};

export async function suggestFix(args: {
  violation_ids: string[];
  context?: string;
}) {
  const { violation_ids, context } = args;
  const rules: UxRules = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

  const results: string[] = [];
  results.push("# UX改善提案");
  results.push("");

  if (context) {
    results.push(`**コンテキスト:** ${context}`);
    results.push("");
  }

  for (const violationId of violation_ids) {
    // 対応するルールを検索
    let foundRule: Rule | null = null;
    let foundPrinciple: Principle | null = null;

    for (const principle of Object.values(rules.principles)) {
      const rule = principle.rules.find((r) => r.id === violationId);
      if (rule) {
        foundRule = rule;
        foundPrinciple = principle;
        break;
      }
    }

    if (!foundRule || !foundPrinciple) {
      results.push(`### ⚠️ ${violationId}: 不明な違反ID`);
      results.push("");
      continue;
    }

    const severityLabel =
      foundRule.severity === "high"
        ? "高（早急に対応）"
        : foundRule.severity === "medium"
        ? "中（次のイテレーションで対応）"
        : "低（余裕があれば対応）";

    const severityIcon =
      foundRule.severity === "high"
        ? "🔴"
        : foundRule.severity === "medium"
        ? "🟡"
        : "🟢";

    results.push(
      `### ${severityIcon} ${violationId}: ${foundRule.name}（${foundPrinciple.name}）`
    );
    results.push(`**優先度:** ${severityLabel}`);
    results.push("");

    results.push("**典型的な違反パターン:**");
    foundRule.violations.forEach((v) => {
      results.push(`- ${v}`);
    });
    results.push("");

    const suggestions = fixSuggestions[violationId];
    if (suggestions) {
      results.push("**具体的な改善策:**");
      suggestions.forEach((s, i) => {
        results.push(`${i + 1}. ${s}`);
      });
    }
    results.push("");
  }

  results.push("---");
  results.push(
    "**melta UIとの組み合わせ:** UIの実装時はmelta UIの`check_rule()`も合わせて実行し、デザインシステム準拠も確認してください。"
  );

  return {
    content: [
      {
        type: "text",
        text: results.join("\n"),
      },
    ],
  };
}
