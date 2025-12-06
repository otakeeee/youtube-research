'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getProjects, createProject, deleteProject, type Project } from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_language: 'ja',
    main_genre: '',
    keywords: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProject({
        name: formData.name,
        description: formData.description || undefined,
        target_language: formData.target_language,
        main_genre: formData.main_genre || undefined,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : undefined,
      });
      setShowModal(false);
      setFormData({ name: '', description: '', target_language: 'ja', main_genre: '', keywords: '' });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('このプロジェクトを削除しますか？')) return;
    try {
      await deleteProject(id);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] gradient-mesh">
      <Sidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">プロジェクト</h1>
            <p className="mt-2 text-[var(--text-muted)]">チャンネル/ジャンルごとのプロジェクト管理</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-medium text-white"
          >
            <PlusIcon className="h-5 w-5" />
            新規プロジェクト
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)] p-16 text-center animate-fade-in">
            <FolderIcon className="mx-auto h-16 w-16 text-[var(--text-muted)]" />
            <h3 className="mt-6 text-xl font-semibold text-[var(--foreground)]">プロジェクトがありません</h3>
            <p className="mt-2 text-[var(--text-muted)]">新しいプロジェクトを作成して、YouTubeリサーチを始めましょう</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg btn-primary px-6 py-3 font-medium text-white"
            >
              <PlusIcon className="h-5 w-5" />
              最初のプロジェクトを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 card-hover animate-fade-in opacity-0 stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#ff6b8a]">
                    <FolderIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]">
                      {project.target_language.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{project.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
                  {project.description || 'プロジェクトの説明がありません'}
                </p>
                {project.main_genre && (
                  <div className="mt-4">
                    <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-[var(--text-muted)]">
                      {project.main_genre}
                    </span>
                  </div>
                )}
                {project.keywords && project.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.keywords.slice(0, 3).map((keyword, i) => (
                      <span key={i} className="rounded-full bg-[var(--accent-secondary)]/10 px-2 py-0.5 text-xs text-[var(--accent-secondary)]">
                        {keyword}
                      </span>
                    ))}
                    {project.keywords.length > 3 && (
                      <span className="text-xs text-[var(--text-muted)]">+{project.keywords.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="mt-6 flex gap-2">
                  <a
                    href={`/projects/${project.id}`}
                    className="flex-1 rounded-lg border border-[var(--card-border)] py-2 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-white/5"
                  >
                    詳細
                  </a>
                  <a
                    href={`/research?project=${project.id}`}
                    className="flex-1 rounded-lg bg-[var(--accent)]/10 py-2 text-center text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                  >
                    リサーチ
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">新規プロジェクト</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">プロジェクト名 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="例: 副業チャンネル_2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    rows={3}
                    placeholder="プロジェクトの説明を入力"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]">言語</label>
                    <select
                      value={formData.target_language}
                      onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]">メインジャンル</label>
                    <input
                      type="text"
                      value={formData.main_genre}
                      onChange={(e) => setFormData({ ...formData, main_genre: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                      placeholder="例: 副業"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">キーワード（カンマ区切り）</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="例: 副業, 在宅ワーク, 月5万円"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-white/5"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg btn-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {submitting ? '作成中...' : '作成'}
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
function FolderIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function PlusIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

