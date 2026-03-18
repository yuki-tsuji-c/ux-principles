# UX Principles — AI が読める UX チェッカー

**人間にも、AI にも、使いやすさを判定できる UX 原則集。**

## Overview

UX Principles は、AI エージェントが生成した UI を UX 観点で自動チェックするための MCP サーバーです。ニールセンの 10 原則とゲシュタルト原則をベースに、HTML・コンポーネント・ユーザーフロー・画面説明文を評価し、改善提案まで行います。

[melta UI](https://github.com/tsubotax/melta-ui) が **UI（見た目の一貫性）** を担保するのに対し、このリポジトリは **UX（使いやすさ）** を担保します。両方を通過した UI が「見た目も使い勝手も良い」状態です。

## Core Architecture

| Layer | Format | Reader | Purpose |
|-------|--------|--------|---------|
| UX 原則 | Markdown (2 files) | Humans | ニールセン 10 原則・ゲシュタルト 7 原則の詳細解説 |
| エントリーポイント | CLAUDE.md | Humans + AI | クイックリファレンス・タスクベース読み込みガイド |
| UX ルール | ux-rules.json | AI | 17 原則の機械可読ルール（SSOT） |
| チェック観点 | Markdown (2 files) | AI | HTML・フロー等のチェック基準 |
| MCP サーバー | TypeScript | AI agents | `check_ux()`, `get_principle()`, `suggest_fix()` |

## AI Readability Features

**Staged Loading**: `CLAUDE.md` だけで基本的な UX 判定が可能。詳細は必要に応じて段階的に読み込み。

**Structured Data**: `ux-rules.json` に全原則を機械可読な JSON で定義。曖昧さのない判定基準を提供。

**MCP Integration**: AI エージェントが `check_ux()` → `suggest_fix()` のワークフローで UX チェックと改善提案を自動実行。

**melta UI 連携**: UI チェック（`check_rule()`）と UX チェック（`check_ux()`）を組み合わせて包括的な品質担保。

## UX 原則

### ニールセンの 10 原則

| ID | 原則 | 重要度 |
|----|------|--------|
| n01 | システム状態の可視性 | 🔴高 |
| n03 | ユーザーコントロールと自由 | 🔴高 |
| n04 | 一貫性と標準 | 🔴高 |
| n05 | エラーの防止 | 🔴高 |
| n09 | エラーの認識・診断・回復 | 🔴高 |
| n02 | 実世界との一致 | 🟡中 |
| n06 | 記憶の最小化 | 🟡中 |
| n08 | 美的で最小限のデザイン | 🟡中 |
| n07 | 柔軟性と効率性 | 🟢低 |
| n10 | ヘルプとドキュメント | 🟢低 |

### ゲシュタルト原則

| ID | 原則 | 重要度 |
|----|------|--------|
| g01 | 近接 | 🔴高 |
| g02 | 類似 | 🔴高 |
| g05 | 図と地 | 🔴高 |
| g04 | 連続 | 🟡中 |
| g07 | プレグナンツ | 🟡中 |
| g03 | 閉合 | 🟢低 |
| g06 | 共通運命 | 🟢低 |

## Quick Start

### MCP サーバー

```bash
npm install && npm run build
claude mcp add ux-principles node ./dist/index.js
```

### MCP ツール

```bash
# UX 原則を取得
get_principle("nielsen")        # ニールセンの 10 原則
get_principle("gestalt")        # ゲシュタルト原則

# UX チェック
check_ux("html", <content>)         # HTML の UX チェック
check_ux("component", <content>)    # コンポーネント単位のチェック
check_ux("flow", <content>)         # ユーザーフローのチェック
check_ux("description", <content>)  # 画面説明文のチェック

# 改善提案
suggest_fix(["n01", "g05"])     # 違反への改善提案
```

### melta UI との組み合わせ

```bash
check_ux("html", <content>)        # UX 観点のチェック（このリポジトリ）
check_rule("shadow-lg text-black")  # UI 観点のチェック（melta UI）
```

## File Structure

```
ux-principles/
├── CLAUDE.md                  ← AI エントリーポイント
├── README.md                  ← このファイル
├── principles/
│   ├── nielsen-10.md          ← ニールセンの 10 原則（詳細）
│   └── gestalt.md             ← ゲシュタルト原則（詳細）
├── checks/
│   ├── html.md                ← HTML チェック観点
│   └── flow.md                ← フローチェック観点
├── tokens/
│   └── ux-rules.json          ← 機械可読 UX ルール（SSOT）
└── src/                       ← MCP サーバー（TypeScript）
    └── index.ts
```

## License

MIT
