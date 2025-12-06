'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getScript, updateScript, type Script, type ScriptSection } from '@/lib/api';

export default function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSections, setEditedSections] = useState<ScriptSection[]>([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedCta, setEditedCta] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchScript();
  }, [resolvedParams.id]);

  async function fetchScript() {
    try {
      const data = await getScript(parseInt(resolvedParams.id));
      setScript(data);
      setEditedSections(data.sections || []);
      setEditedTitle(data.title);
      setEditedCta(data.cta_text || '');
    } catch (err) {
      console.error('Failed to fetch script:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSectionChange(index: number, content: string) {
    const newSections = [...editedSections];
    newSections[index] = { ...newSections[index], content };
    setEditedSections(newSections);
    setHasChanges(true);
  }

  async function handleSave() {
    if (!script) return;
    
    setSaving(true);
    try {
      await updateScript(script.id, {
        title: editedTitle,
        sections: editedSections,
        cta_text: editedCta,
      });
      setHasChanges(false);
      fetchScript();
    } catch (err) {
      console.error('Failed to save script:', err);
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function copyFullScript() {
    if (!script) return;
    const fullText = editedSections.map(s => `【${s.name}】\n${s.content}`).join('\n\n');
    const ctaSection = editedCta ? `\n\n---\n【説明欄用CTA】\n${editedCta}` : '';
    navigator.clipboard.writeText(fullText + ctaSection);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] gradient-mesh">
        <Sidebar />
        <main className="ml-64 flex items-center justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </main>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-[var(--background)] gradient-mesh">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="text-center">
            <p className="text-[var(--text-muted)]">台本が見つかりませんでした</p>
            <button
              onClick={() => router.push('/scripts')}
              className="mt-4 rounded-lg btn-primary px-4 py-2 text-sm font-medium text-white"
            >
              一覧に戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] gradient-mesh">
      <Sidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/scripts')}
              className="rounded-lg border border-[var(--card-border)] p-2 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => { setEditedTitle(e.target.value); setHasChanges(true); }}
                className="bg-transparent text-2xl font-bold text-[var(--foreground)] focus:outline-none border-b border-transparent focus:border-[var(--accent)]"
              />
              <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <span>トーン: {script.tone || '-'}</span>
                <span>•</span>
                <span>長さ: {script.length_type || '-'}</span>
                <span>•</span>
                <span>{new Date(script.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyFullScript}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-white/5"
            >
              <CopyIcon className="h-4 w-4" />
              全文コピー
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 rounded-lg btn-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4" />
                  保存
                </>
              )}
            </button>
          </div>
        </div>

        {/* Script Editor */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sections */}
          <div className="lg:col-span-2 space-y-4">
            {editedSections.map((section, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 animate-fade-in"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs text-[var(--accent)]">
                      {index + 1}
                    </span>
                    {section.name}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(section.content)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                    title="コピー"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => handleSectionChange(index, e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none resize-none"
                  rows={Math.max(5, section.content.split('\n').length + 1)}
                />
                <div className="mt-2 text-right text-xs text-[var(--text-muted)]">
                  {section.content.length} 文字
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 animate-fade-in">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[var(--foreground)]">説明欄用CTA</h3>
                <button
                  onClick={() => copyToClipboard(editedCta)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                  title="コピー"
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={editedCta}
                onChange={(e) => { setEditedCta(e.target.value); setHasChanges(true); }}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none resize-none"
                rows={6}
                placeholder="説明欄に貼り付けるCTAテキスト"
              />
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 animate-fade-in">
              <h3 className="mb-4 font-semibold text-[var(--foreground)]">統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">総文字数</span>
                  <span className="font-mono text-[var(--foreground)]">
                    {editedSections.reduce((acc, s) => acc + s.content.length, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">セクション数</span>
                  <span className="font-mono text-[var(--foreground)]">{editedSections.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">推定読み上げ時間</span>
                  <span className="font-mono text-[var(--foreground)]">
                    約{Math.ceil(editedSections.reduce((acc, s) => acc + s.content.length, 0) / 300)}分
                  </span>
                </div>
              </div>
            </div>

            {/* Offer Info */}
            {script.offer_info && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 animate-fade-in">
                <h3 className="mb-4 font-semibold text-[var(--foreground)]">オファー情報</h3>
                <div className="space-y-2 text-sm">
                  {script.offer_info.offer_type && (
                    <div>
                      <span className="text-[var(--text-muted)]">タイプ: </span>
                      <span className="text-[var(--foreground)]">{script.offer_info.offer_type}</span>
                    </div>
                  )}
                  {script.offer_info.offer_title && (
                    <div>
                      <span className="text-[var(--text-muted)]">タイトル: </span>
                      <span className="text-[var(--foreground)]">{script.offer_info.offer_title}</span>
                    </div>
                  )}
                  {script.offer_info.lp_url && (
                    <div>
                      <span className="text-[var(--text-muted)]">LP: </span>
                      <a href={script.offer_info.lp_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                        {script.offer_info.lp_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Icons
function ArrowLeftIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function CopyIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function SaveIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

