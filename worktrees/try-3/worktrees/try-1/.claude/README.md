# .claude/ - YouTube自動システム Claude Code設定

このディレクトリには、YouTube自動リサーチ・分析・台本生成システムでClaude Codeによる開発を最適化するための設定ファイルとツールが含まれています。

## 📁 ディレクトリ構造

```
.claude/
├── README.md                    # このファイル
├── settings.example.json        # 設定テンプレート
├── settings.local.json          # ローカル設定（Git管理外）
├── mcp.json                     # MCPサーバー設定
│
├── agents/                      # Agent定義（66種類）
│   ├── coordinator-agent.md
│   ├── frontend-developer.md
│   ├── backend-developer.md
│   ├── code-reviewer.md
│   └── ... (62 more agents)
│
├── commands/                    # スラッシュコマンド（70種類）
│   ├── test.md
│   ├── deploy.md
│   ├── gwt-init.md
│   ├── gwt-run.md
│   └── ... (66 more commands)
│
├── hooks/                       # Claude Hooks
│   ├── auto-format.sh
│   ├── log-commands.sh
│   └── validate-typescript.sh
│
└── mcp-servers/                 # MCPサーバー設定
    └── youtube-automation.js
```

## 🤖 利用可能なAgent（66種類）

### コア開発
- **coordinator-agent** - タスク分解・並行実行制御
- **frontend-developer** - フロントエンド開発
- **backend-developer** - バックエンド開発
- **database-developer** - データベース設計・開発
- **api-developer** - API開発

### 品質保証
- **code-reviewer** - コードレビュー
- **test-generator** - テスト生成
- **qa-validator** - 品質検証
- **security-scanner** - セキュリティスキャン
- **performance-tester** - パフォーマンステスト

### インフラ・DevOps
- **devops-engineer** - DevOps管理
- **cloud-architect** - クラウドアーキテクチャ
- **cicd-manager** - CI/CD管理
- **container-specialist** - コンテナ管理
- **deployment-agent** - デプロイ自動化

### その他（46種類）
完全なリストは `agents/` ディレクトリを参照してください。

## 🎯 スラッシュコマンド（70種類）

### WorkTree管理
```bash
/gwt-init [N]        # N個のworktreeを作成（デフォルト: 3）
/gwt-run [target]    # worktreeでタスクを並列実行
/gwt-status          # worktreeとTMUXのステータス確認
/gwt-attach          # TMUXセッションに接続
/gwt-cleanup         # worktreeとセッションをクリーンアップ
/gwt-merge <name>    # worktreeの変更をmainにマージ
```

### 開発タスク
```bash
/test                # テスト実行
/deploy              # デプロイ
/verify              # 動作確認
/agent-run           # Agent実行
```

### 開発支援
```bash
/develop-frontend    # フロントエンド開発
/develop-backend     # バックエンド開発
/develop-api         # API開発
/design-database     # データベース設計
```

### 品質管理
```bash
/review-code         # コードレビュー
/generate-tests      # テスト生成
/security-scan       # セキュリティスキャン
/test-performance    # パフォーマンステスト
```

### その他（56種類）
完全なリストは `commands/` ディレクトリを参照してください。

## 🔌 MCPサーバー

### youtube-automation
YouTube自動システム専用のMCPサーバー

**提供機能:**
- チャンネルリサーチ
- 動画文字起こし
- Claude AI分析
- ナレッジ生成
- 台本自動生成

**必要な環境変数:**
```bash
YOUTUBE_API_KEY      # YouTube Data API v3
CLAUDE_API_KEY       # Claude API
WHISPER_API_KEY      # Whisper API (文字起こし)
```

### その他のMCPサーバー
- **ide-integration** - VS Code診断、Jupyter実行
- **github-enhanced** - Issue/PR管理
- **project-context** - プロジェクト情報
- **filesystem** - ファイルアクセス

## 🪝 Hooks

### auto-format.sh
コミット前に自動フォーマット（ESLint, Prettier）

### log-commands.sh
すべてのコマンドを `.ai/logs/` に記録

### validate-typescript.sh
TypeScriptコンパイルエラーをチェック

## 🚀 使い方

### 1. 初期設定

```bash
# 設定ファイルコピー
cp .claude/settings.example.json .claude/settings.local.json

# 環境変数設定
cp .env.example .env
vim .env  # API keysを設定
```

### 2. WorkTreeの使い方

```bash
# 3つのworktreeを作成
/gwt-init 3

# 全worktreeで並列実行
/gwt-run all

# 特定のworktreeで実行
/gwt-run try-1

# ステータス確認
/gwt-status

# TMUXセッションに接続
/gwt-attach

# クリーンアップ
/gwt-cleanup
```

### 3. TMUXの操作

接続後のキー操作:
- `Ctrl+a` → `n` : 次のウィンドウへ
- `Ctrl+a` → `p` : 前のウィンドウへ
- `Ctrl+a` → `0-9` : 指定番号のウィンドウへ
- `Ctrl+a` → `d` : デタッチ（終了せずに抜ける）
- `Ctrl+a` → `|` : 縦分割
- `Ctrl+a` → `-` : 横分割

### 4. Agentの実行

```bash
# スラッシュコマンドで実行
/agent-run

# 自然言語で実行
"frontend-developerエージェントを使ってUIを作成して"
```

## 📊 システム統計

- **Agents**: 66種類
- **Commands**: 70種類
- **MCP Servers**: 5個
- **Hooks**: 3個

## 🛠 開発フロー例

### YouTube動画分析システムの開発

1. **WorkTree準備**
```bash
/gwt-init 3  # 3つの並列環境を作成
```

2. **並列開発開始**
```bash
/gwt-run all  # 全環境でTMUX起動
```

3. **各環境で異なるアプローチを試す**
- try-1: Claude APIベースの実装
- try-2: Gemini APIベースの実装
- try-3: ハイブリッド実装

4. **評価・マージ**
```bash
/gwt-status           # 進捗確認
/gwt-merge try-1      # 最良の実装をマージ
/gwt-cleanup          # クリーンアップ
```

## 🔐 セキュリティ

**重要**: 以下のファイルは `.gitignore` で除外されています:
- `.claude/settings.local.json`
- `.env`
- `.env.local`

## 📚 関連ドキュメント

- [YouTube 自動システム 要件定義書.md](../YouTube%20自動システム%20要件定義書%20.md)
- [.tmux.conf](../.tmux.conf) - TMUX設定
- [tools/gwt](../tools/gwt) - WorkTreeツール

---

**最終更新**: 2025-11-28
**管理**: YouTube Automation System with AI42

🤖 Generated with [Claude Code](https://claude.com/claude-code)
