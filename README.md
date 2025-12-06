# YouTubeリサーチ - 非属人型YouTube運用支援システム

YouTube動画のリサーチ、分析、台本生成を自動化するシステムです。

## 概要

このシステムは以下の機能を提供します:

- 指定ジャンルの伸びているYouTube動画の自動リサーチ
- 動画分析による「伸びる要素」の抽出
- 非属人型（顔出し不要）の動画台本の自動生成
- 顧客リスト獲得用のCTA（Call To Action）の自動生成

詳細は [YouTubeリサーチ　要件定義書.md](./YouTubeリサーチ　要件定義書.md) を参照してください。

## 開発環境のセットアップ

このプロジェクトは、AIT42、Git WorkTree、TMUXを組み合わせた効率的な開発環境を提供します。

### 必要な環境

- macOS (またはLinux)
- Git
- TMUX
- Node.js (v14以上)
- Claude Code

### クイックスタート

#### 1. TMUXのインストール

TMUXがまだインストールされていない場合:

```bash
# Homebrewをインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# TMUXをインストール
brew install tmux
```

詳細は [TMUX_INSTALL_GUIDE.md](./TMUX_INSTALL_GUIDE.md) を参照してください。

#### 2. 依存関係のインストール

```bash
npm install
```

#### 3. AIT42のセットアップ

```bash
bash scripts/setup-ait42-priority.sh
```

#### 4. 開発環境の起動

```bash
./start-dev-environment.sh
```

起動モードを選択できます:
- **基本モード**: TMUXセッションのみ
- **開発モード**: TMUX + WorkTree統合
- **フルモード**: TMUX + WorkTree + AIT42自動起動

## 開発環境の構成

### AIT42（AI Task Automation）

AIT42は、複雑な開発タスクを自動化するClaude Code用のエージェントシステムです。
Coordinatorエージェントが自動的に最優先で選択され、効率的なタスク実行をサポートします。

### Git WorkTree

複数のブランチを同時にチェックアウトして作業できる環境を提供します。
詳細は [WORKTREE_GUIDE.md](./WORKTREE_GUIDE.md) を参照してください。

```bash
# WorkTreeの一覧を表示
git worktree list

# 新しいWorkTreeを作成
git worktree add ../YouTubeリサーチ-feature/新機能 -b feature/新機能
```

### TMUX

ターミナルマルチプレクサーで、複数のペインとウィンドウを管理します。

基本操作:
- プレフィックスキー: `Ctrl-a`
- ペイン移動: `Ctrl-a` + `h/j/k/l`
- ウィンドウ切替: `Ctrl-a` + `番号`
- ペイン分割（横）: `Ctrl-a` + `|`
- ペイン分割（縦）: `Ctrl-a` + `-`
- デタッチ: `Ctrl-a` + `d`

## プロジェクト構造

```
YouTubeリサーチ/
├── .claude/
│   └── agents/
│       └── 00-ait42-coordinator.md  # AIT42 Coordinator
├── scripts/
│   ├── setup-ait42-priority.sh      # AIT42セットアップスクリプト
│   ├── cleanup.sh                   # クリーンアップスクリプト
│   └── optimize-agents-simple.sh    # エージェント最適化
├── .tmux.conf                       # TMUX設定ファイル
├── start-dev-environment.sh         # 開発環境起動スクリプト
├── package.json                     # Node.js依存関係
├── TMUX_INSTALL_GUIDE.md           # TMUXインストールガイド
├── WORKTREE_GUIDE.md               # WorkTreeガイド
└── YouTubeリサーチ　要件定義書.md   # 詳細な要件定義
```

## 開発ワークフロー

### 基本的なワークフロー

1. 開発環境を起動
   ```bash
   ./start-dev-environment.sh
   ```

2. TMUXセッションで作業
   - ウィンドウ1 (main): メインブランチでの作業
   - ウィンドウ2 (develop): 開発ブランチでの作業
   - ウィンドウ3 (git): Git操作
   - ウィンドウ4 (logs): ログ監視

3. Claude Codeでタスクを実行
   ```
   # AIT42 Coordinatorが自動的に選択されます
   "新機能を実装して"
   ```

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発統合ブランチ
- `feature/機能名`: 個別機能開発
- `hotfix/修正内容`: 緊急修正

## トラブルシューティング

### TMUXセッションが残っている場合

```bash
# セッション一覧を表示
tmux list-sessions

# セッションを削除
tmux kill-session -t youtube-research-dev
```

### WorkTreeの削除

```bash
# WorkTreeディレクトリを削除
rm -rf ../YouTubeリサーチ-develop

# Gitから登録を解除
git worktree prune
```

### AIT42の再セットアップ

```bash
# .claudeディレクトリを削除
rm -rf .claude

# 再度セットアップ
bash scripts/setup-ait42-priority.sh
```

## ライセンス

[ライセンス情報を記載]

## 貢献

[貢献ガイドラインを記載]

## サポート

問題が発生した場合は、Issuesセクションで報告してください。
