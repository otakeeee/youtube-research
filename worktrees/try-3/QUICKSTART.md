# クイックスタートガイド

AIT42、WorkTree、TMUXを使った開発環境を5分で起動する方法

## ステップ1: TMUXのインストール

TMUXがまだインストールされていない場合、以下のコマンドを実行してください:

```bash
# Homebrewがない場合は先にインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# TMUXをインストール
brew install tmux
```

インストール後、バージョンを確認:

```bash
tmux -V
```

`tmux 3.x` のようなバージョン情報が表示されればOKです。

## ステップ2: 開発環境の起動

プロジェクトルートで以下のコマンドを実行:

```bash
./start-dev-environment.sh
```

モード選択画面が表示されます:
- `1` - 基本モード（TMUXのみ）
- `2` - 開発モード（TMUX + WorkTree）
- `3` - フルモード（TMUX + WorkTree + AIT42）

初めての場合は `3` (フルモード) を推奨します。

## ステップ3: TMUXの基本操作

起動後、以下の操作でTMUXを使いこなせます:

### プレフィックスキー
すべてのTMUXコマンドは `Ctrl-a` から始まります。

### よく使うコマンド

| 操作 | コマンド |
|------|----------|
| ペイン分割（横） | `Ctrl-a` + `\|` |
| ペイン分割（縦） | `Ctrl-a` + `-` |
| ペイン移動 | `Ctrl-a` + `h/j/k/l` |
| ウィンドウ切替 | `Ctrl-a` + `0-9` |
| ウィンドウ作成 | `Ctrl-a` + `c` |
| セッションから離脱 | `Ctrl-a` + `d` |
| セッションに再接続 | `tmux attach -t youtube-research-dev` |

## ステップ4: Claude Codeの使用

TMUXセッション内で、Claude Codeを使ってタスクを実行できます:

```bash
# Claude Codeを起動（既に起動している場合はスキップ）
claude code

# タスクを実行
# AIT42 Coordinatorが自動的に選択されます
"新機能を実装して"
```

## ステップ5: WorkTreeの確認

開発モードまたはフルモードで起動した場合、以下のコマンドでWorkTreeを確認できます:

```bash
git worktree list
```

出力例:
```
/Users/take/Desktop/dev/YouTubeリサーチ           f9ce958 [main]
/Users/take/Desktop/dev/YouTubeリサーチ-develop   f9ce958 [develop]
```

## レイアウトの説明

### フルモードのウィンドウ構成

1. **ウィンドウ1 (main)**: メインブランチ
   - ペイン0: メイン作業エリア
   - ペイン1: ログ監視
   - ペイン2: サブ作業エリア

2. **ウィンドウ2 (develop)**: 開発ブランチ
   - ペイン0: 開発作業エリア
   - ペイン1: テスト実行
   - ペイン2: サブ作業エリア

3. **ウィンドウ3 (git)**: Git操作専用

4. **ウィンドウ4 (logs)**: ログとモニタリング

## トラブルシューティング

### セッションが既に存在する

```bash
# 既存セッションを削除
tmux kill-session -t youtube-research-dev

# または既存セッションに接続
tmux attach -t youtube-research-dev
```

### TMUXが見つからない

```bash
# Homebrewのパスを確認
brew --version

# パスが通っていない場合
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

### WorkTreeが作成されない

```bash
# 手動でdevelopブランチを作成
git branch develop

# 手動でWorkTreeを作成
git worktree add ../YouTubeリサーチ-develop develop
```

## 次のステップ

開発環境が起動したら:

1. [README.md](./README.md) で詳細な使い方を確認
2. [YouTubeリサーチ　要件定義書.md](./YouTubeリサーチ　要件定義書.md) でプロジェクトの全体像を把握
3. [WORKTREE_GUIDE.md](./WORKTREE_GUIDE.md) でWorkTreeの活用方法を学習

## 便利なTips

### セッション名を変更

```bash
# セッション内で
tmux rename-session 新しい名前
```

### ペインのレイアウト保存

現在のレイアウトを保存したい場合:

```bash
# レイアウト情報を表示
tmux list-windows
```

### すべてのペインで同じコマンドを実行

```bash
# セッション内で
Ctrl-a :setw synchronize-panes on
# コマンドを実行
# 終わったら無効化
Ctrl-a :setw synchronize-panes off
```

## 開発の開始

すべての準備が整ったら、以下のワークフローで開発を進めてください:

1. TMUXセッションを起動
2. 適切なウィンドウ/ペインに移動
3. Claude Codeでタスクを実行
4. Gitで変更をコミット
5. 必要に応じてWorkTreeで並行作業

Happy Coding!
