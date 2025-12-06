'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getScripts, getProjects, generateScript, deleteScript, type Script, type Project, type GenerateScriptRequest } from '@/lib/api';

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GenerateScriptRequest>({
    project_id: 0,
    tone: 'logical_and_casual',
    length_type: '10min',
    custom_topic: '',
    offer: {
      lp_url: '',
      offer_type: '',
      offer_title: '',
      target_audience: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [scriptsData, projectsData] = await Promise.all([
        getScripts(),
        getProjects(),
      ]);
      setScripts(scriptsData);
      setProjects(projectsData);
      if (projectsData.length > 0 && formData.project_id === 0) {
        setFormData(prev => ({ ...prev, project_id: projectsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.project_id) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const request: GenerateScriptRequest = {
        project_id: formData.project_id,
        tone: formData.tone,
        length_type: formData.length_type,
        custom_topic: formData.custom_topic || undefined,
      };
      
      // オファー情報があれば追加
      if (formData.offer?.lp_url || formData.offer?.offer_type) {
        request.offer = formData.offer;
      }
      
      await generateScript(request);
      setShowModal(false);
      setFormData({
        project_id: projects[0]?.id || 0,
        tone: 'logical_and_casual',
        length_type: '10min',
        custom_topic: '',
        offer: { lp_url: '', offer_type: '', offer_title: '', target_audience: '' },
      });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '台本生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('この台本を削除しますか？')) return;
    try {
      await deleteScript(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete script:', err);
    }
  }

  return (
    <div className="min-h-screen cyber-bg">
      <Sidebar />
      
      <main className="ml-56 p-6 relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0ff]">
              <span className="text-[#ff00ff] neon-text-magenta">✨</span> 台本
            </h1>
            <p className="mt-1 text-[#8888aa]">AI生成台本の管理・編集</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={projects.length === 0}
            className="flex items-center gap-2 rounded-xl btn-cyber-magenta px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            <SparklesIcon className="h-5 w-5" />
            新規台本生成
          </button>
        </div>

        {/* Scripts List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
          </div>
        ) : scripts.length === 0 ? (
          <div className="glass-card p-16 text-center animate-fade-in border-dashed">
            <DocumentIcon className="mx-auto h-16 w-16 text-[#8888aa]" />
            <h3 className="mt-6 text-xl font-semibold text-[#f0f0ff]">台本がありません</h3>
            <p className="mt-2 text-[#8888aa]">
              {projects.length === 0 
                ? 'まずプロジェクトを作成してください'
                : 'AIを使って台本を自動生成しましょう'}
            </p>
            {projects.length > 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl btn-cyber-magenta px-6 py-3 font-bold"
              >
                <SparklesIcon className="h-5 w-5" />
                最初の台本を生成
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {scripts.map((script, index) => (
              <div
                key={script.id}
                className={`glass-card p-6 card-hover animate-fade-in opacity-0 stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#f0f0ff]">{script.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        script.status === 'published' 
                          ? 'status-completed'
                          : 'status-draft'
                      }`}>
                        {script.status === 'published' ? '公開' : '下書き'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#8888aa]">
                      <span className="tag-cyan rounded-full px-2 py-0.5 text-xs">トーン: {script.tone || '-'}</span>
                      <span className="tag-magenta rounded-full px-2 py-0.5 text-xs">長さ: {script.length_type || '-'}</span>
                      <span className="tag-yellow rounded-full px-2 py-0.5 text-xs">セクション: {script.sections?.length || 0}個</span>
                      <span>{new Date(script.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/scripts/${script.id}`}
                      className="rounded-lg border border-[rgba(100,200,255,0.3)] px-3 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                    >
                      編集
                    </a>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="rounded-lg p-2 text-[#8888aa] hover:bg-[rgba(255,0,100,0.1)] hover:text-[#ff6b6b] transition-all"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Preview */}
                {script.sections && script.sections.length > 0 && (
                  <div className="mt-4 rounded-lg bg-[rgba(0,212,255,0.05)] p-4 border border-[rgba(0,212,255,0.2)]">
                    <p className="text-sm text-[#8888aa]">
                      <span className="font-medium text-[#00d4ff]">{script.sections[0].name}:</span>{' '}
                      {script.sections[0].content.slice(0, 150)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Generate Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto glass-card p-6 animate-fade-in neon-border-magenta">
              <h2 className="text-xl font-semibold text-[#f0f0ff]">✨ 新規台本生成</h2>
              <p className="mt-1 text-sm text-[#8888aa]">AIが自動で台本を生成します</p>
              
              {error && (
                <div className="mt-4 rounded-lg bg-[rgba(255,0,100,0.1)] border border-[rgba(255,0,100,0.3)] p-3 text-sm text-[#ff6b6b]">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleGenerate} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">プロジェクト *</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">トピック・テーマ *</label>
                  <textarea
                    value={formData.custom_topic}
                    onChange={(e) => setFormData({ ...formData, custom_topic: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    rows={3}
                    placeholder="例: 副業初心者が月5万円を稼ぐための3つのステップ"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0ff]">トーン</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    >
                      <option value="logical_and_casual">論理的 & カジュアル</option>
                      <option value="friendly">フレンドリー</option>
                      <option value="professional">プロフェッショナル</option>
                      <option value="energetic">エネルギッシュ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0ff]">動画の長さ</label>
                    <select
                      value={formData.length_type}
                      onChange={(e) => setFormData({ ...formData, length_type: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    >
                      <option value="5min">約5分</option>
                      <option value="10min">約10分</option>
                      <option value="15min">約15分</option>
                      <option value="20min">約20分</option>
                    </select>
                  </div>
                </div>
                
                {/* Offer Section */}
                <div className="rounded-lg border border-[rgba(100,200,255,0.2)] p-4 bg-[rgba(0,212,255,0.03)]">
                  <h3 className="text-sm font-medium text-[#f0f0ff]">オファー情報（任意）</h3>
                  <p className="mt-1 text-xs text-[#8888aa]">視聴者をリスト登録に誘導するための情報</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8888aa]">LP URL</label>
                      <input
                        type="url"
                        value={formData.offer?.lp_url || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          offer: { ...formData.offer, lp_url: e.target.value } 
                        })}
                        className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8888aa]">オファータイプ</label>
                      <input
                        type="text"
                        value={formData.offer?.offer_type || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          offer: { ...formData.offer, offer_type: e.target.value } 
                        })}
                        className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                        placeholder="無料PDF"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8888aa]">オファータイトル</label>
                      <input
                        type="text"
                        value={formData.offer?.offer_title || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          offer: { ...formData.offer, offer_title: e.target.value } 
                        })}
                        className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                        placeholder="副業スタートガイド"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8888aa]">ターゲット</label>
                      <input
                        type="text"
                        value={formData.offer?.target_audience || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          offer: { ...formData.offer, target_audience: e.target.value } 
                        })}
                        className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                        placeholder="副業初心者"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-[rgba(100,200,255,0.3)] px-4 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={generating || !formData.custom_topic}
                    className="flex items-center gap-2 rounded-xl btn-cyber-magenta px-4 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4" />
                        台本を生成
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Icons
function DocumentIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SparklesIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function TrashIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
