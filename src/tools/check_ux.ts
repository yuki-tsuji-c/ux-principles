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

export async function checkUx(args: {
  target_type: string;
  content: string;
  focus?: string;
}) {
  const { target_type, content, focus = "all" } = args;
  const rules: UxRules = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

  const targetPrinciples =
    focus === "all"
      ? Object.values(rules.principles)
      : [rules.principles[focus]].filter(Boolean);

  if (targetPrinciples.length === 0) {
    throw new Error(`Unknown focus: ${focus}`);
  }

  const results: string[] = [];
  results.push(`# UXチェック結果`);
  results.push(`**対象タイプ:** ${target_type}`);
  results.push(`**チェック原則:** ${focus === "all" ? "全原則" : focus}`);
  results.push("");

  for (const principle of targetPrinciples) {
    results.push(`## ${principle.name}`);
    results.push("");

    for (const rule of principle.rules) {
      const applicableViolations = detectViolations(
        content,
        target_type,
        rule
      );

      const severityIcon =
        rule.severity === "high"
          ? "🔴"
          : rule.severity === "medium"
          ? "🟡"
          : "🟢";

      results.push(`### ${severityIcon} ${rule.id}: ${rule.name}`);
      results.push("");
      results.push("**チェック項目:**");
      rule.checks.forEach((check) => {
        results.push(`- ${check}`);
      });
      results.push("");

      if (applicableViolations.length > 0) {
        results.push("**⚠️ 検出された可能性のある問題:**");
        applicableViolations.forEach((v) => {
          results.push(`- ${v}`);
        });
        results.push(
          `> 改善提案: \`suggest_fix(["${rule.id}"])\` を実行してください`
        );
      } else {
        results.push("**✅ 明確な違反パターンは検出されませんでした**");
        results.push(
          "> ただし、実際の画面での確認を推奨します（自動検出の限界あり）"
        );
      }
      results.push("");
    }
  }

  results.push("---");
  results.push(
    "**注意:** このチェックはパターンマッチングによる一次スクリーニングです。最終判断は人間のUXレビューで行ってください。"
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

function detectViolations(
  content: string,
  targetType: string,
  rule: Rule
): string[] {
  const detected: string[] = [];
  const lower = content.toLowerCase();

  // 共通パターン検出
  const patterns: Record<string, string[]> = {
    n01: ["loading", "spinner", "disabled", "aria-label", "role="],
    n03: ["cancel", "キャンセル", "戻る", "confirm", "確認"],
    n05: ["required", "必須", "placeholder", "pattern=", "validate"],
    n09: ["error", "エラー", "alert", "invalid"],
    g05: ["contrast", "opacity", "rgba", "color:"],
  };

  if (targetType === "html") {
    // HTMLに対するパターン検出
    if (rule.id === "n01") {
      if (!lower.includes("loading") && !lower.includes("disabled")) {
        detected.push("ローディング状態の表示が確認できません");
      }
    }
    if (rule.id === "n05") {
      if (lower.includes("input") && !lower.includes("required")) {
        detected.push("フォームにrequired属性が設定されていない可能性があります");
      }
    }
    if (rule.id === "n09") {
      if (lower.includes("form") && !lower.includes("error")) {
        detected.push("エラーメッセージの表示領域が確認できません");
      }
    }
    if (rule.id === "g04") {
      if (
        (lower.match(/input|select|textarea/g) || []).length > 2 &&
        lower.includes("col-")
      ) {
        detected.push(
          "フォームが複数カラムレイアウトになっている可能性があります"
        );
      }
    }
  }

  if (targetType === "description") {
    // 説明文に対するパターン検出
    if (rule.id === "n02") {
      const techTerms = ["api", "db", "レコード", "インスタンス", "crud"];
      techTerms.forEach((term) => {
        if (lower.includes(term)) {
          detected.push(`技術用語「${term}」がユーザー向け表示に含まれています`);
        }
      });
    }
    if (rule.id === "n08") {
      if (content.length > 500) {
        detected.push(
          "画面の説明が長く、情報過多になっている可能性があります"
        );
      }
    }
  }

  if (targetType === "flow") {
    // フロー図に対するパターン検出
    if (rule.id === "n03") {
      if (!lower.includes("キャンセル") && !lower.includes("戻る")) {
        detected.push("フローにキャンセル・戻るパスが定義されていません");
      }
    }
    if (rule.id === "n05") {
      if (!lower.includes("確認") && !lower.includes("confirm")) {
        detected.push("削除・送信などの重要操作に確認ステップが見当たりません");
      }
    }
  }

  return detected;
}
