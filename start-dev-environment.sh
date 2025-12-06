#!/bin/bash
# YouTubeリサーチ開発環境統合起動スクリプト
# AIT42、WorkTree、TMUXを組み合わせた開発環境を構築

set -euo pipefail

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 設定
PROJECT_NAME="youtube-research"
SESSION_NAME="${PROJECT_NAME}-dev"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKTREE_BASE="$(dirname "$PROJECT_ROOT")"

# =====================================
# ヘッダー
# =====================================

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  YouTubeリサーチ 開発環境起動スクリプト                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# =====================================
# 前提条件チェック
# =====================================

echo -e "${CYAN}📋 前提条件をチェック中...${NC}"

# TMUXのインストール確認
if ! command -v tmux &> /dev/null; then
  echo -e "${RED}❌ エラー: TMUXがインストールされていません${NC}"
  echo -e "${YELLOW}   TMUX_INSTALL_GUIDE.md を参照してインストールしてください${NC}"
  exit 1
fi
echo -e "${GREEN}✅ TMUX: $(tmux -V)${NC}"

# Gitの確認
if ! command -v git &> /dev/null; then
  echo -e "${RED}❌ エラー: Gitがインストールされていません${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Git: $(git --version)${NC}"

# Gitリポジトリの確認
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
  echo -e "${RED}❌ エラー: Gitリポジトリが初期化されていません${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Gitリポジトリ: 初期化済み${NC}"

# AIT42 Coordinatorの確認
if [[ ! -f "$PROJECT_ROOT/.claude/agents/00-ait42-coordinator.md" ]]; then
  echo -e "${YELLOW}⚠️  警告: AIT42 Coordinatorが見つかりません${NC}"
  echo -e "${YELLOW}   scripts/setup-ait42-priority.sh を実行してください${NC}"
else
  echo -e "${GREEN}✅ AIT42 Coordinator: 配置済み${NC}"
fi

echo ""

# =====================================
# セットアップモード選択
# =====================================

echo -e "${CYAN}🔧 セットアップモードを選択してください:${NC}"
echo -e "${YELLOW}1.${NC} 基本モード (TMUXセッションのみ)"
echo -e "${YELLOW}2.${NC} 開発モード (TMUX + WorkTree統合)"
echo -e "${YELLOW}3.${NC} フルモード (TMUX + WorkTree + AIT42自動起動)"
echo ""
read -p "選択 (1-3): " mode_choice

case $mode_choice in
  1)
    MODE="basic"
    echo -e "${GREEN}基本モードを選択しました${NC}"
    ;;
  2)
    MODE="dev"
    echo -e "${GREEN}開発モードを選択しました${NC}"
    ;;
  3)
    MODE="full"
    echo -e "${GREEN}フルモードを選択しました${NC}"
    ;;
  *)
    echo -e "${RED}無効な選択です。基本モードで起動します。${NC}"
    MODE="basic"
    ;;
esac

echo ""

# =====================================
# 既存セッションのチェック
# =====================================

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  既存のセッション '${SESSION_NAME}' が見つかりました${NC}"
  read -p "アタッチしますか？ (y/n): " attach_choice
  if [[ "$attach_choice" == "y" ]]; then
    tmux attach-session -t "$SESSION_NAME"
    exit 0
  else
    echo -e "${YELLOW}新しいセッションを作成します...${NC}"
    tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
  fi
fi

# =====================================
# WorkTreeのセットアップ（開発/フルモード）
# =====================================

if [[ "$MODE" == "dev" ]] || [[ "$MODE" == "full" ]]; then
  echo -e "${CYAN}🌲 WorkTreeをセットアップ中...${NC}"

  # developブランチの作成（存在しない場合）
  if ! git show-ref --verify --quiet refs/heads/develop; then
    echo -e "${YELLOW}   developブランチを作成中...${NC}"
    git branch develop
    echo -e "${GREEN}✅ developブランチを作成しました${NC}"
  fi

  # WorkTreeの作成
  WORKTREE_DEV="${WORKTREE_BASE}/YouTubeリサーチ-develop"
  if [[ ! -d "$WORKTREE_DEV" ]]; then
    echo -e "${YELLOW}   develop用WorkTreeを作成中...${NC}"
    git worktree add "$WORKTREE_DEV" develop
    echo -e "${GREEN}✅ WorkTreeを作成しました: $WORKTREE_DEV${NC}"
  else
    echo -e "${GREEN}✅ WorkTreeは既に存在します: $WORKTREE_DEV${NC}"
  fi

  echo ""
fi

# =====================================
# TMUXセッションの作成
# =====================================

echo -e "${CYAN}🚀 TMUXセッションを作成中...${NC}"

# TMUX設定ファイルのコピー（ホームディレクトリに）
if [[ -f "$PROJECT_ROOT/.tmux.conf" ]]; then
  cp "$PROJECT_ROOT/.tmux.conf" "$HOME/.tmux.conf"
  echo -e "${GREEN}✅ TMUX設定ファイルをコピーしました${NC}"
fi

# セッション作成
tmux new-session -d -s "$SESSION_NAME" -n "main" -c "$PROJECT_ROOT"

# =====================================
# レイアウトの構築
# =====================================

echo -e "${CYAN}📐 レイアウトを構築中...${NC}"

if [[ "$MODE" == "basic" ]]; then
  # 基本モード: シンプルな3ペイン構成
  tmux split-window -h -t "$SESSION_NAME:main" -c "$PROJECT_ROOT"
  tmux split-window -v -t "$SESSION_NAME:main.1" -c "$PROJECT_ROOT"

  # ペインにラベルを設定
  tmux send-keys -t "$SESSION_NAME:main.0" "# メイン作業エリア" C-m
  tmux send-keys -t "$SESSION_NAME:main.1" "# ログ/監視エリア" C-m
  tmux send-keys -t "$SESSION_NAME:main.2" "# サブ作業エリア" C-m

elif [[ "$MODE" == "dev" ]] || [[ "$MODE" == "full" ]]; then
  # 開発/フルモード: WorkTree統合レイアウト

  # ウィンドウ1: メインブランチ (main)
  tmux rename-window -t "$SESSION_NAME:1" "main"
  tmux split-window -h -t "$SESSION_NAME:main" -c "$PROJECT_ROOT"
  tmux split-window -v -t "$SESSION_NAME:main.1" -c "$PROJECT_ROOT"

  # ウィンドウ2: 開発ブランチ (develop)
  tmux new-window -t "$SESSION_NAME" -n "develop" -c "$WORKTREE_DEV"
  tmux split-window -h -t "$SESSION_NAME:develop" -c "$WORKTREE_DEV"
  tmux split-window -v -t "$SESSION_NAME:develop.1" -c "$WORKTREE_DEV"

  # ウィンドウ3: Git操作
  tmux new-window -t "$SESSION_NAME" -n "git" -c "$PROJECT_ROOT"

  # ウィンドウ4: ログ/監視
  tmux new-window -t "$SESSION_NAME" -n "logs" -c "$PROJECT_ROOT"

  # 各ペインに初期コマンドを送信
  tmux send-keys -t "$SESSION_NAME:main.0" "echo '=== Main Branch ===' && git status" C-m
  tmux send-keys -t "$SESSION_NAME:develop.0" "echo '=== Develop Branch ===' && git status" C-m
  tmux send-keys -t "$SESSION_NAME:git.0" "git worktree list" C-m

  if [[ "$MODE" == "full" ]]; then
    # フルモード: AIT42の情報を表示
    tmux send-keys -t "$SESSION_NAME:logs.0" "echo '=== AIT42 Coordinator Status ===' && ls -la .claude/agents/" C-m
  fi
fi

# =====================================
# 完了メッセージ
# =====================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ 開発環境の起動が完了しました                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}セッション情報:${NC}"
echo -e "${YELLOW}  名前:${NC} $SESSION_NAME"
echo -e "${YELLOW}  モード:${NC} $MODE"
echo ""
echo -e "${GREEN}起動方法:${NC}"
echo -e "${CYAN}  tmux attach-session -t $SESSION_NAME${NC}"
echo ""
echo -e "${GREEN}基本操作:${NC}"
echo -e "${YELLOW}  プレフィックスキー:${NC} Ctrl-a"
echo -e "${YELLOW}  ペイン移動:${NC} Ctrl-a + h/j/k/l"
echo -e "${YELLOW}  ウィンドウ切替:${NC} Ctrl-a + 番号"
echo -e "${YELLOW}  ペイン分割（横）:${NC} Ctrl-a + |"
echo -e "${YELLOW}  ペイン分割（縦）:${NC} Ctrl-a + -"
echo -e "${YELLOW}  デタッチ:${NC} Ctrl-a + d"
echo ""

if [[ "$MODE" == "dev" ]] || [[ "$MODE" == "full" ]]; then
  echo -e "${GREEN}WorkTree情報:${NC}"
  git worktree list
  echo ""
fi

echo -e "${CYAN}セッションにアタッチしています...${NC}"
tmux attach-session -t "$SESSION_NAME"
