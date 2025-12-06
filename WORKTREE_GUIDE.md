# Git WorkTree ガイド

## WorkTreeとは

Git WorkTreeは、同じリポジトリの複数のブランチを同時にチェックアウトして作業できる機能です。
これにより、以下のような作業が効率的に行えます:

- メインブランチを維持しながら、別のブランチで新機能開発
- 複数の機能を並行して開発
- 緊急バグ修正とリリース準備を同時進行

## 基本的な使い方

### 1. 新しいワークツリーの作成

```bash
# develop ブランチ用のワークツリーを作成
git worktree add ../YouTubeリサーチ-develop develop

# feature ブランチ用のワークツリーを作成
git worktree add ../YouTubeリサーチ-feature/新機能 -b feature/新機能
```

### 2. ワークツリーの一覧表示

```bash
git worktree list
```

出力例:
```
/Users/take/Desktop/dev/YouTubeリサーチ           f9ce958 [main]
/Users/take/Desktop/dev/YouTubeリサーチ-develop   a1b2c3d [develop]
```

### 3. ワークツリーの削除

```bash
# まずディレクトリを削除
rm -rf ../YouTubeリサーチ-develop

# Gitから登録を解除
git worktree prune
```

## プロジェクトでの活用例

### 開発環境の構成

```
YouTubeリサーチ/              # メインブランチ (本番用)
  ├── .git/
  └── ...

YouTubeリサーチ-develop/      # 開発ブランチ
  └── ...

YouTubeリサーチ-feature/      # 機能開発ブランチ
  ├── api-integration/
  ├── youtube-analysis/
  └── script-generation/
```

### ブランチ戦略

1. **main** - 本番環境
2. **develop** - 開発統合ブランチ
3. **feature/機能名** - 個別機能開発
4. **hotfix/修正内容** - 緊急修正

## TMUXとの組み合わせ

TMUXのウィンドウやペインを使って、各ワークツリーを同時に操作できます。
詳細は `start-dev-environment.sh` スクリプトを参照してください。
