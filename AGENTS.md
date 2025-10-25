# 基本的なガイドライン

- 回答は必ず日本語で

# Repository Guidelines

## プロジェクト構成 / モジュール
- ルート: pnpm モノレポ（ワークスペース `packages/*`, `apps/*`）。
- アプリ: `apps/basic` — Vite + TypeScript + Three.js。ソースは `src/`、静的ファイルは `public/`。
- GLSL パッケージ: `packages/glsl` — `.glsl` を ESM の export map で公開（ビルド不要）。
- スクリプト: `scripts/new-package.mjs` で `packages/<name>` を雛形生成。

## ビルド / テスト / 開発コマンド
- `pnpm dev`: すべてのアプリを開発モードで起動（Vite）。
- `pnpm -r build`: 各ワークスペースの `build` を実行（例: `apps/basic` は `tsc && vite build`）。
- `pnpm -F basic preview`: ビルド済みアプリのローカルプレビュー。
- `pnpm -F basic fix`: Biome による整形 + リント（アプリ内）。
- `pnpm new:pkg <name>`: `@fluid/<name>` を `packages/` に作成（TypeScript ビルド設定付き）。

## コーディング規約 / 命名
- インデント: 2 スペース、行幅 100（`apps/basic/biome.json`）。
- 言語: TypeScript（厳格設定）。GLSL は `packages/glsl/src` に配置。
- ファイル名: TS は `camelCase.ts`、GLSL ヘルパは `src/utils/camelCase.glsl`。
- モジュール: ESM（`type: module`）。明示的エクスポートと相対インポートを推奨。

## テスト指針
- 現状フレームワーク未設定。提案: Vitest。
- 配置: `src/**/*.test.ts` に併置。
- 実行: ルート/各ワークスペースに `"test": "vitest"` を追加し、`pnpm -r test`。
- カバレッジ: 新規コードは 80%+ を目標。GLSL ヘルパは振る舞い中心に検証。

## コミット / PR ガイド
- コミット: 簡潔な命令形。Conventional Commits 推奨（例: `feat: add velocity advection shader`）。
- PR: 説明、関連 Issue、見た目の変更はスクショ/GIF、実行確認（`pnpm dev`, `pnpm -r build`, `pnpm -F basic fix`）。

## セキュリティ / 設定メモ
- `pnpm >= 8`、Node 18+ を推奨。
- GLSL は生のシェーダを公開。利用側で入力検証を行い、信頼できないソースを避ける。
- `new:pkg` で作る TS パッケージはルートに `tsconfig.base.json` を想定する場合あり。必要なら追加。
