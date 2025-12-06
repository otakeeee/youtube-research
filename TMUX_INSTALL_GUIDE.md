# TMUX インストールガイド

## Homebrewのインストール

ターミナルで以下のコマンドを実行してください:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール中にパスワードの入力を求められます。
インストール完了後、パスの設定が必要な場合があります（インストーラーが指示します）。

## TMUXのインストール

Homebrewのインストール後、以下のコマンドを実行してください:

```bash
brew install tmux
```

## インストール確認

以下のコマンドでTMUXが正しくインストールされたか確認できます:

```bash
tmux -V
```

バージョン情報が表示されれば成功です。

## 次のステップ

TMUXのインストールが完了したら、Claude Codeに戻って「TMUXのインストールが完了しました」と伝えてください。
残りのセットアップ（AIT42、WorkTree、TMUX設定）を続けます。
