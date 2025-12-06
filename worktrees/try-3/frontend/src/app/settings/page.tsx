'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getHealth, getApiKeyStatus, setApiKey, setLlmProvider, type HealthStatus, type ApiKeyStatus } from '@/lib/api';

// プロバイダー情報
const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    model: 'GPT-4o-mini',
    icon: '🤖',
    description: '高速で高品質な応答',
    color: '#00d4ff',
    keyType: 'openai',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    getKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Claude Sonnet 4',
    model: 'claude-sonnet-4',
    icon: '🧠',
    description: 'バランス型 - 長文生成に強い',
    color: '#ff00ff',
    keyType: 'anthropic',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-...',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'anthropic-sonnet45',
    name: 'Claude Sonnet 4.5',
    model: 'claude-sonnet-4-5',
    icon: '🚀',
    description: '最高性能 - 複雑な推論・創造性に優れる',
    color: '#ff64c8',
    keyType: 'anthropic',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-...',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    badge: '最新',
  },
  {
    id: 'gemini',
    name: 'Gemini 2.5 Pro',
    model: 'gemini-2.5-pro',
    icon: '✨',
    description: '最新・最高性能 - 複雑なタスクに最適',
    color: '#ffff00',
    keyType: 'gemini',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIza...',
    getKeyUrl: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    model: 'gemini-2.5-flash',
    icon: '⚡',
    description: '高速版 - コスパ重視・大量処理向け',
    color: '#00ff80',
    keyType: 'gemini',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIza...',
    getKeyUrl: 'https://aistudio.google.com/apikey',
  },
];

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // API Key input states
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[0] | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    llmProvider: 'openai',
    defaultTone: 'logical_and_casual',
    defaultLength: '10min',
    autoSave: true,
    darkMode: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [healthData, keyStatus] = await Promise.all([
        getHealth(),
        getApiKeyStatus()
      ]);
      setHealth(healthData);
      setApiKeyStatus(keyStatus);
      setSettings(prev => ({ ...prev, llmProvider: keyStatus.current_provider }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  // プロバイダーがAPIキー設定済みかどうかを確認
  function isProviderConfigured(providerId: string): boolean {
    if (!apiKeyStatus) return false;
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) return false;
    
    const keyType = provider.keyType as keyof ApiKeyStatus;
    return apiKeyStatus[keyType] === true;
  }

  // プロバイダーを選択
  async function handleProviderSelect(providerId: string) {
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;
    
    // APIキーが設定されていない場合はモーダルを表示
    if (!isProviderConfigured(providerId)) {
      setSelectedProvider(provider);
      setApiKeyInput('');
      setApiKeyError(null);
      setShowApiKeyModal(true);
      return;
    }
    
    // APIキーが設定済みの場合はプロバイダーを変更
    try {
      setSaving(true);
      await setLlmProvider(providerId);
      setSettings(prev => ({ ...prev, llmProvider: providerId }));
      await fetchData(); // Refresh status
    } catch (err) {
      console.error('Failed to set provider:', err);
      alert(err instanceof Error ? err.message : 'プロバイダーの設定に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  // APIキーを保存
  async function handleSaveApiKey() {
    if (!selectedProvider || !apiKeyInput.trim()) return;
    
    // 簡易バリデーション
    if (!apiKeyInput.startsWith(selectedProvider.keyPrefix)) {
      setApiKeyError(`APIキーは "${selectedProvider.keyPrefix}" で始まる必要があります`);
      return;
    }
    
    try {
      setSaving(true);
      setApiKeyError(null);
      
      // APIキーを保存
      await setApiKey(selectedProvider.keyType, apiKeyInput.trim());
      
      // プロバイダーを設定
      await setLlmProvider(selectedProvider.id);
      
      // 状態を更新
      setSettings(prev => ({ ...prev, llmProvider: selectedProvider.id }));
      await fetchData();
      
      setShowApiKeyModal(false);
      setApiKeyInput('');
      
    } catch (err) {
      setApiKeyError(err instanceof Error ? err.message : 'APIキーの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen cyber-bg">
      <Sidebar />
      
      <main className="ml-56 p-6 relative z-10">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-[#f0f0ff]">
            <span className="text-[#00d4ff] neon-text">⚙️</span> 設定
          </h1>
          <p className="mt-1 text-[#8888aa]">アプリケーションの設定を管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="glass-card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4 flex items-center gap-2">
              <span className="text-[#00ff80]">●</span>
              システムステータス
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,255,128,0.1)] border border-[rgba(0,255,128,0.3)]">
                  <span className="text-[#8888aa]">ステータス</span>
                  <span className="text-[#00ff80] font-semibold">{health.status}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">アプリ名</span>
                  <span className="text-[#f0f0ff]">{health.app_name}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">デバッグモード</span>
                  <span className={health.debug ? 'text-[#ffff00]' : 'text-[#8888aa]'}>
                    {health.debug ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">データベース</span>
                  <span className="text-[#f0f0ff] text-sm">{health.database}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[rgba(255,0,100,0.1)] border border-[rgba(255,0,100,0.3)]">
                <p className="text-[#ff6b6b]">サーバーに接続できません</p>
              </div>
            )}
          </div>

          {/* API Key Status */}
          <div className="glass-card p-6 animate-fade-in stagger-1">
            <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">🔑 APIキー状態</h2>
            
            {apiKeyStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">OpenAI</span>
                  <span className={apiKeyStatus.openai ? 'text-[#00ff80]' : 'text-[#ff6b6b]'}>
                    {apiKeyStatus.openai ? '✓ 設定済み' : '✗ 未設定'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">Anthropic (Claude)</span>
                  <span className={apiKeyStatus.anthropic ? 'text-[#00ff80]' : 'text-[#ff6b6b]'}>
                    {apiKeyStatus.anthropic ? '✓ 設定済み' : '✗ 未設定'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">Google Gemini</span>
                  <span className={apiKeyStatus.gemini ? 'text-[#00ff80]' : 'text-[#ff6b6b]'}>
                    {apiKeyStatus.gemini ? '✓ 設定済み' : '✗ 未設定'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#8888aa]">YouTube Data API</span>
                  <span className={apiKeyStatus.youtube ? 'text-[#00ff80]' : 'text-[#ff6b6b]'}>
                    {apiKeyStatus.youtube ? '✓ 設定済み' : '✗ 未設定'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
              </div>
            )}
          </div>

          {/* LLM Provider Selection */}
          <div className="glass-card p-6 animate-fade-in stagger-2 lg:col-span-2">
            <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">🤖 LLMプロバイダー選択</h2>
            <p className="text-sm text-[#8888aa] mb-4">
              台本生成・動画分析に使用するAIモデルを選択してください。
              <span className="text-[#ffff00]">未設定のプロバイダーを選択すると、APIキー入力画面が表示されます。</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVIDERS.map((provider) => {
                const isConfigured = isProviderConfigured(provider.id);
                const isSelected = settings.llmProvider === provider.id;
                
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    disabled={saving}
                    className={`p-4 rounded-lg border text-left transition-all relative ${
                      isSelected
                        ? `bg-[${provider.color}15] border-[${provider.color}]`
                        : isConfigured
                          ? 'bg-[rgba(0,212,255,0.02)] border-[rgba(100,200,255,0.2)] hover:border-[rgba(100,200,255,0.4)]'
                          : 'bg-[rgba(255,100,100,0.02)] border-[rgba(255,100,100,0.2)] hover:border-[rgba(255,100,100,0.4)]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${provider.color}15` : undefined,
                      borderColor: isSelected ? provider.color : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="font-medium text-[#f0f0ff]">{provider.name}</span>
                      {provider.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,200,0,0.2)] text-[#ffc800] border border-[rgba(255,200,0,0.4)]">
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8888aa] mb-2">{provider.description}</p>
                    <p className="text-xs text-[#666688]">モデル: {provider.model}</p>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isSelected ? (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: `${provider.color}30`, color: provider.color }}>
                          使用中
                        </span>
                      ) : isConfigured ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-[rgba(0,255,128,0.1)] text-[#00ff80]">
                          設定済み
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-[rgba(255,100,100,0.1)] text-[#ff6b6b]">
                          要設定
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Settings */}
          <div className="glass-card p-6 animate-fade-in stagger-3">
            <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">📝 デフォルト設定</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f0f0ff] mb-2">デフォルトトーン</label>
                <select
                  value={settings.defaultTone}
                  onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
                  className="w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                >
                  <option value="logical_and_casual">論理的 & カジュアル</option>
                  <option value="friendly">フレンドリー</option>
                  <option value="professional">プロフェッショナル</option>
                  <option value="energetic">エネルギッシュ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#f0f0ff] mb-2">デフォルト動画長さ</label>
                <select
                  value={settings.defaultLength}
                  onChange={(e) => setSettings({ ...settings, defaultLength: e.target.value })}
                  className="w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                >
                  <option value="5min">約5分</option>
                  <option value="10min">約10分</option>
                  <option value="15min">約15分</option>
                  <option value="20min">約20分</option>
                </select>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="glass-card p-6 animate-fade-in stagger-4">
            <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">🎨 アプリ設定</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                <div>
                  <p className="text-[#f0f0ff] font-medium">自動保存</p>
                  <p className="text-xs text-[#8888aa]">台本編集時に自動保存</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.autoSave ? 'bg-[#00d4ff]' : 'bg-[rgba(100,100,150,0.5)]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autoSave ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                <div>
                  <p className="text-[#f0f0ff] font-medium">ダークモード</p>
                  <p className="text-xs text-[#8888aa]">サイバーパンクテーマ</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-[#00d4ff]' : 'bg-[rgba(100,100,150,0.5)]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end animate-fade-in stagger-5">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl btn-cyber-cyan px-6 py-3 text-sm font-bold"
          >
            {saved ? (
              <>
                <CheckIcon className="h-5 w-5" />
                保存しました
              </>
            ) : (
              <>
                <SaveIcon className="h-5 w-5" />
                設定を保存
              </>
            )}
          </button>
        </div>

        {/* About Section */}
        <div className="mt-8 glass-card p-6 animate-fade-in stagger-6">
          <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">ℹ️ このアプリについて</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
              <p className="text-[#00d4ff] font-bold text-2xl">TubeScript AI</p>
              <p className="text-xs text-[#8888aa] mt-1">YouTube台本自動生成システム</p>
            </div>
            <div className="p-4 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
              <p className="text-[#f0f0ff] font-medium">バージョン</p>
              <p className="text-[#00d4ff] text-lg">1.0.0</p>
            </div>
            <div className="p-4 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
              <p className="text-[#f0f0ff] font-medium">技術スタック</p>
              <p className="text-xs text-[#8888aa]">Next.js + FastAPI + SQLite</p>
            </div>
          </div>
        </div>
      </main>

      {/* API Key Input Modal */}
      {showApiKeyModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-6 animate-fade-in neon-border mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedProvider.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-[#f0f0ff]">{selectedProvider.name}</h2>
                <p className="text-sm text-[#8888aa]">APIキーを設定してください</p>
              </div>
            </div>
            
            <div className="mb-4 p-4 rounded-lg bg-[rgba(255,255,0,0.05)] border border-[rgba(255,255,0,0.2)]">
              <p className="text-sm text-[#ffff00] mb-2">💡 APIキーの取得方法</p>
              <a
                href={selectedProvider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#00d4ff] hover:underline flex items-center gap-1"
              >
                {selectedProvider.getKeyUrl}
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#f0f0ff] mb-2">APIキー</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={selectedProvider.keyPlaceholder}
                className="w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-3 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none font-mono"
              />
              {apiKeyError && (
                <p className="mt-2 text-sm text-[#ff6b6b]">{apiKeyError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput('');
                  setApiKeyError(null);
                }}
                className="rounded-lg border border-[rgba(100,200,255,0.3)] px-4 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={saving || !apiKeyInput.trim()}
                className="flex items-center gap-2 rounded-xl btn-cyber-cyan px-4 py-2 text-sm font-bold disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#000] border-t-transparent" />
                    保存中...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-4 w-4" />
                    保存して使用
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function SaveIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function CheckIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function KeyIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function ExternalLinkIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
