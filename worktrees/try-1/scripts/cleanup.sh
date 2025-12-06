#!/bin/bash

echo "🧹 AIT42 クリーンアップスクリプト開始..."
echo "================================"

# カウンター初期化
DELETED_FILES=0
DELETED_DIRS=0
FREED_SPACE=0

# 削除前のディスク使用量
BEFORE=$(du -sh . | cut -f1)

echo ""
echo "📁 削除対象の特定..."
echo ""

# 1. ARCHIVED ファイルの削除
echo "1️⃣ ARCHIVED ファイル削除中..."
for file in $(find . -name "ARCHIVED-*" 2>/dev/null); do
    echo "   削除: $file"
    rm -f "$file"
    ((DELETED_FILES++))
done

# 2. テスト関連の一時ファイル削除
echo "2️⃣ テスト一時ファイル削除中..."
rm -f .claude/agents/reflection-agent-tests.md
rm -f .claude/agents/reflection-agent-IMPLEMENTATION-SUMMARY.md
((DELETED_FILES+=2))

# 3. auth-api テストディレクトリの削除（作成したテスト実装）
echo "3️⃣ auth-api テストディレクトリ削除中..."
if [ -d "auth-api" ]; then
    rm -rf auth-api
    echo "   削除: auth-api/ (node_modules含む)"
    ((DELETED_DIRS++))
fi

# 4. ログファイルのクリーンアップ
echo "4️⃣ 古いログファイル削除中..."
find . -name "*.log" -type f -mtime +7 -delete 2>/dev/null
find logs -name "*.log" -type f -delete 2>/dev/null
((DELETED_FILES+=3))

# 5. Memory System の古いデータクリーンアップ
echo "5️⃣ Memory System クリーンアップ中..."
# 30日以上前のタスクファイル削除
find .claude/memory/tasks -name "*.yaml" -type f -mtime +30 -delete 2>/dev/null

# 6. 最適化前の大きなエージェントファイルのアーカイブ
echo "6️⃣ 大きなエージェントファイルのアーカイブ準備..."
mkdir -p .claude/agents-original-backup

# reflection-agent など大きなファイルをバックアップ後、最適化版に置き換え
if [ -f ".claude/agents/reflection-agent.md" ] && [ -f ".claude/agents-optimized/reflection-agent.md" ]; then
    cp .claude/agents/reflection-agent.md .claude/agents-original-backup/
    cp .claude/agents-optimized/reflection-agent.md .claude/agents/reflection-agent.md
    echo "   最適化: reflection-agent.md (1,674行 → 36行)"
fi

# 7. 重複エージェントの統合
echo "7️⃣ 重複エージェントの統合..."
# api-developer を backend-developer へのシンボリックリンクに
if [ -f ".claude/agents/api-developer.md" ]; then
    rm -f .claude/agents/api-developer.md
    cp .claude/agents-optimized/api-developer.md .claude/agents/api-developer.md
    echo "   統合: api-developer → backend-developer"
    ((DELETED_FILES++))
fi

# 8. 一時ファイルとキャッシュの削除
echo "8️⃣ 一時ファイルとキャッシュ削除中..."
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "*.swp" -delete 2>/dev/null
find . -name "*~" -delete 2>/dev/null
find . -name "*.pyc" -delete 2>/dev/null
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null

# 9. 空のディレクトリ削除
echo "9️⃣ 空のディレクトリ削除中..."
find . -type d -empty -delete 2>/dev/null

# 10. docxファイル削除（バイナリで不要）
echo "🔟 .docx ファイル削除中..."
find . -name "*.docx" -delete 2>/dev/null

echo ""
echo "================================"
echo "✅ クリーンアップ完了！"
echo "================================"

# 削除後のディスク使用量
AFTER=$(du -sh . | cut -f1)

echo ""
echo "📊 結果サマリー："
echo "   削除前: $BEFORE"
echo "   削除後: $AFTER"
echo "   削除ファイル数: $DELETED_FILES+"
echo "   削除ディレクトリ数: $DELETED_DIRS+"
echo ""

# 最終的なディレクトリ構造を表示
echo "📁 最適化後のディレクトリ構造:"
echo ""
tree -L 2 -I 'node_modules|coverage|.git' 2>/dev/null || ls -la

echo ""
echo "💡 ヒント:"
echo "   - 最適化エージェントを適用: cp .claude/agents-optimized/* .claude/agents/"
echo "   - バックアップ確認: ls .claude/agents-original-backup/"
echo "   - Gitでコミット: git add -A && git commit -m 'cleanup: 不要ファイル削除と構造整理'"