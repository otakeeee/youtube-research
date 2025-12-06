'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  getTemplates, 
  createTemplate, 
  deleteTemplate, 
  seedDefaultTemplates,
  type Template, 
  type TemplateCreateRequest,
  type TemplateSection
} from '@/lib/api';

const GENRES = [
  '全般',
  '副業・ビジネス',
  '投資・資産運用',
  '自己啓発・スキルアップ',
  '健康・ダイエット',
  '英語学習',
  'プログラミング・IT',
  'ライフスタイル・暮らし',
  'メンタル・心理学',
];

const TONES = [
  { value: 'logical_and_casual', label: '論理的 & カジュアル' },
  { value: 'friendly', label: 'フレンドリー' },
  { value: 'professional', label: 'プロフェッショナル' },
  { value: 'energetic', label: 'エネルギッシュ' },
];

const LENGTHS = [
  { value: '5min', label: '約5分' },
  { value: '10min', label: '約10分' },
  { value: '15min', label: '約15分' },
  { value: '20min', label: '約20分' },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState<string>('');
  
  const [formData, setFormData] = useState<TemplateCreateRequest>({
    name: '',
    description: '',
    genre: '',
    target_length: '10min',
    tone: 'logical_and_casual',
    tips: '',
    sections: [
      { name: 'フック', duration: '30秒', description: '' },
      { name: '本編', duration: '5分', description: '' },
      { name: 'CTA', duration: '30秒', description: '' },
    ],
  });

  useEffect(() => {
    fetchTemplates();
  }, [filterGenre]);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const data = await getTemplates(filterGenre || undefined);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      await seedDefaultTemplates();
      fetchTemplates();
    } catch (err) {
      console.error('Failed to seed defaults:', err);
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || formData.sections.length === 0) return;
    
    setCreating(true);
    setError(null);
    
    try {
      await createTemplate(formData);
      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テンプレート作成に失敗しました');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('このテンプレートを削除しますか？')) return;
    try {
      await deleteTemplate(id);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      genre: '',
      target_length: '10min',
      tone: 'logical_and_casual',
      tips: '',
      sections: [
        { name: 'フック', duration: '30秒', description: '' },
        { name: '本編', duration: '5分', description: '' },
        { name: 'CTA', duration: '30秒', description: '' },
      ],
    });
  }

  function addSection() {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { name: '', duration: '', description: '' }],
    }));
  }

  function removeSection(index: number) {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }

  function updateSection(index: number, field: keyof TemplateSection, value: string) {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  }

  function viewTemplate(template: Template) {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  }

  return (
    <div className="min-h-screen cyber-bg">
      <Sidebar />
      
      <main className="ml-56 p-6 relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0ff]">
              <span className="text-[#00d4ff] neon-text">📋</span> テンプレート
            </h1>
            <p className="mt-1 text-[#8888aa]">台本構成のテンプレートを管理</p>
          </div>
          <div className="flex gap-3">
            {templates.length === 0 && (
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="flex items-center gap-2 rounded-xl border border-[rgba(0,212,255,0.3)] px-4 py-2.5 text-sm font-medium text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] disabled:opacity-50"
              >
                {seeding ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
                    作成中...
                  </>
                ) : (
                  <>
                    <MagicIcon className="h-5 w-5" />
                    デフォルトを追加
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl btn-cyber-cyan px-4 py-2.5 text-sm font-bold"
            >
              <PlusIcon className="h-5 w-5" />
              新規テンプレート
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4 animate-fade-in">
          <label className="text-sm text-[#8888aa]">ジャンル:</label>
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
          >
            <option value="">すべて</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
          </div>
        ) : templates.length === 0 ? (
          <div className="glass-card p-16 text-center animate-fade-in border-dashed">
            <TemplateIcon className="mx-auto h-16 w-16 text-[#8888aa]" />
            <h3 className="mt-6 text-xl font-semibold text-[#f0f0ff]">テンプレートがありません</h3>
            <p className="mt-2 text-[#8888aa]">
              デフォルトテンプレートを追加するか、新規作成してください
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,212,255,0.3)] px-6 py-3 font-medium text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)]"
              >
                <MagicIcon className="h-5 w-5" />
                デフォルトを追加
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl btn-cyber-cyan px-6 py-3 font-bold"
              >
                <PlusIcon className="h-5 w-5" />
                新規作成
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className={`glass-card p-5 card-hover animate-fade-in opacity-0 stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#f0f0ff]">{template.name}</h3>
                      {template.is_default === 1 && (
                        <span className="tag-cyan rounded-full px-2 py-0.5 text-xs">デフォルト</span>
                      )}
                    </div>
                    {template.genre && (
                      <span className="tag-magenta rounded-full px-2 py-0.5 text-xs mt-1 inline-block">
                        {template.genre}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-[#8888aa] hover:text-[#ff6b6b] hover:bg-[rgba(255,0,100,0.1)] rounded transition-all"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {template.description && (
                  <p className="text-sm text-[#8888aa] mb-3 line-clamp-2">{template.description}</p>
                )}
                
                {/* Sections Preview */}
                <div className="space-y-1 mb-4">
                  {template.sections.slice(0, 4).map((section, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-[#00d4ff]">▸</span>
                      <span className="text-[#f0f0ff]">{section.name}</span>
                      {section.duration && (
                        <span className="text-[#8888aa]">({section.duration})</span>
                      )}
                    </div>
                  ))}
                  {template.sections.length > 4 && (
                    <p className="text-xs text-[#8888aa]">...他 {template.sections.length - 4} セクション</p>
                  )}
                </div>
                
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-[#8888aa] mb-4">
                  {template.target_length && (
                    <span className="tag-yellow rounded px-2 py-0.5">{template.target_length}</span>
                  )}
                  {template.tone && (
                    <span>{TONES.find(t => t.value === template.tone)?.label || template.tone}</span>
                  )}
                </div>
                
                <button
                  onClick={() => viewTemplate(template)}
                  className="w-full rounded-lg border border-[rgba(100,200,255,0.3)] px-3 py-2 text-sm font-medium text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] transition-all"
                >
                  詳細を見る
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
            <div className="w-full max-w-2xl glass-card p-6 animate-fade-in neon-border mx-4">
              <h2 className="text-xl font-semibold text-[#f0f0ff]">📋 新規テンプレート作成</h2>
              <p className="mt-1 text-sm text-[#8888aa]">台本の構成パターンを保存します</p>
              
              {error && (
                <div className="mt-4 rounded-lg bg-[rgba(255,0,100,0.1)] border border-[rgba(255,0,100,0.3)] p-3 text-sm text-[#ff6b6b]">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleCreate} className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">テンプレート名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    placeholder="例: 副業紹介動画（10分）"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    rows={2}
                    placeholder="このテンプレートの用途や特徴"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0ff]">ジャンル</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      {GENRES.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0ff]">目標の長さ</label>
                    <select
                      value={formData.target_length}
                      onChange={(e) => setFormData({ ...formData, target_length: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    >
                      {LENGTHS.map((len) => (
                        <option key={len.value} value={len.value}>{len.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0ff]">トーン</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    >
                      {TONES.map((tone) => (
                        <option key={tone.value} value={tone.value}>{tone.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Sections */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#f0f0ff]">セクション構成 *</label>
                    <button
                      type="button"
                      onClick={addSection}
                      className="text-xs text-[#00d4ff] hover:underline"
                    >
                      + セクション追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.sections.map((section, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                        <span className="text-[#00d4ff] text-sm font-bold mt-2">{index + 1}</span>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(index, 'name', e.target.value)}
                            placeholder="セクション名"
                            className="rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                            required
                          />
                          <input
                            type="text"
                            value={section.duration || ''}
                            onChange={(e) => updateSection(index, 'duration', e.target.value)}
                            placeholder="長さ（例: 30秒）"
                            className="rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={section.description || ''}
                            onChange={(e) => updateSection(index, 'description', e.target.value)}
                            placeholder="説明"
                            className="rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                          />
                        </div>
                        {formData.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="p-2 text-[#8888aa] hover:text-[#ff6b6b]"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">使用時のコツ</label>
                  <textarea
                    value={formData.tips}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                    rows={2}
                    placeholder="このテンプレートを使う際のポイントやアドバイス"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(100,200,255,0.2)]">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="rounded-lg border border-[rgba(100,200,255,0.3)] px-4 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formData.name || formData.sections.length === 0}
                    className="flex items-center gap-2 rounded-xl btn-cyber-cyan px-4 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#000] border-t-transparent" />
                        作成中...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        作成
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
            <div className="w-full max-w-2xl glass-card p-6 animate-fade-in neon-border mx-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#f0f0ff]">{selectedTemplate.name}</h2>
                    {selectedTemplate.is_default === 1 && (
                      <span className="tag-cyan rounded-full px-2 py-0.5 text-xs">デフォルト</span>
                    )}
                  </div>
                  {selectedTemplate.genre && (
                    <span className="tag-magenta rounded-full px-2 py-0.5 text-xs mt-1 inline-block">
                      {selectedTemplate.genre}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-[#8888aa] hover:text-[#f0f0ff]"
                >
                  ✕
                </button>
              </div>
              
              {selectedTemplate.description && (
                <p className="text-sm text-[#8888aa] mb-4">{selectedTemplate.description}</p>
              )}
              
              {/* Meta */}
              <div className="flex items-center gap-3 mb-6">
                {selectedTemplate.target_length && (
                  <span className="tag-yellow rounded-full px-3 py-1 text-sm">
                    🕐 {LENGTHS.find(l => l.value === selectedTemplate.target_length)?.label || selectedTemplate.target_length}
                  </span>
                )}
                {selectedTemplate.tone && (
                  <span className="tag-cyan rounded-full px-3 py-1 text-sm">
                    🎭 {TONES.find(t => t.value === selectedTemplate.tone)?.label || selectedTemplate.tone}
                  </span>
                )}
              </div>
              
              {/* Sections */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#00d4ff] mb-3">📝 セクション構成</h3>
                <div className="space-y-2">
                  {selectedTemplate.sections.map((section, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00d4ff] text-[#000] text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#f0f0ff]">{section.name}</span>
                          {section.duration && (
                            <span className="text-xs text-[#8888aa] bg-[rgba(100,200,255,0.1)] px-2 py-0.5 rounded">
                              {section.duration}
                            </span>
                          )}
                        </div>
                        {section.description && (
                          <p className="text-sm text-[#8888aa] mt-1">{section.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tips */}
              {selectedTemplate.tips && (
                <div className="p-4 rounded-lg bg-[rgba(255,255,0,0.05)] border border-[rgba(255,255,0,0.2)]">
                  <h3 className="text-sm font-semibold text-[#ffff00] mb-2">💡 使用時のコツ</h3>
                  <p className="text-sm text-[#f0f0ff]">{selectedTemplate.tips}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-lg border border-[rgba(100,200,255,0.3)] px-4 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Icons
function TemplateIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function PlusIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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

function MagicIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

