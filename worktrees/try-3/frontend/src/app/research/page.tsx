'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  searchVideos, 
  getProjects, 
  importVideosToProject,
  generateScript,
  type VideoSearchRequest, 
  type Project,
  type GenerateScriptRequest
} from '@/lib/api';

// ジャンルとキーワードの定義
const GENRES = [
  {
    id: 'side_business',
    name: '副業・ビジネス',
    icon: '💼',
    keywords: ['副業 初心者', '副業 在宅', '月5万円 稼ぐ', 'ブログ 収益化', 'せどり 始め方', 'Webライター 始め方', '動画編集 副業', 'SNS 収益化']
  },
  {
    id: 'investment',
    name: '投資・資産運用',
    icon: '📈',
    keywords: ['株式投資 初心者', 'NISA 始め方', '投資信託 おすすめ', '高配当株', '米国株 投資', '不動産投資', '仮想通貨 初心者', 'FX 初心者']
  },
  {
    id: 'self_improvement',
    name: '自己啓発・スキルアップ',
    icon: '🎯',
    keywords: ['習慣化 コツ', '朝活 ルーティン', '読書 おすすめ', '時間管理 方法', '目標達成 方法', 'モチベーション 維持', '集中力 高める', 'マインドセット']
  },
  {
    id: 'health',
    name: '健康・ダイエット',
    icon: '💪',
    keywords: ['ダイエット 方法', '筋トレ 初心者', '食事制限なし ダイエット', 'ストレッチ 効果', '睡眠 質 上げる', 'ファスティング', '糖質制限', 'プロテイン おすすめ']
  },
  {
    id: 'english',
    name: '英語学習',
    icon: '🌍',
    keywords: ['英語 勉強法', '英会話 独学', 'TOEIC 勉強法', '英語 リスニング', '英語 発音', '英語 初心者', 'ビジネス英語', '海外ドラマ 英語']
  },
  {
    id: 'programming',
    name: 'プログラミング・IT',
    icon: '💻',
    keywords: ['プログラミング 初心者', 'Python 入門', 'Web制作 始め方', 'エンジニア 転職', 'AI 活用', 'ChatGPT 使い方', 'ノーコード 副業', 'Webデザイン 独学']
  },
  {
    id: 'lifestyle',
    name: 'ライフスタイル・暮らし',
    icon: '🏠',
    keywords: ['ミニマリスト', '節約 方法', '一人暮らし 節約', '断捨離 コツ', '時短 家事', '収納 アイデア', 'ルーティン 紹介', 'QOL 上げる']
  },
  {
    id: 'mental',
    name: 'メンタル・心理学',
    icon: '🧠',
    keywords: ['ストレス解消', 'メンタル 強くする', '自己肯定感 高める', '人間関係 コツ', 'コミュニケーション 苦手', 'HSP 生きづらい', '不安 解消', 'マインドフルネス']
  },
];

// キーワードサジェスト用データベース
const KEYWORD_SUGGESTIONS: Record<string, string[]> = {
  // 副業関連
  '副業': ['副業 初心者', '副業 在宅', '副業 おすすめ', '副業 会社員', '副業 バレない', '副業 スマホ', '副業 月10万', '副業 確定申告'],
  'ブログ': ['ブログ 始め方', 'ブログ 収益化', 'ブログ アフィリエイト', 'ブログ 書き方', 'ブログ SEO', 'ブログ WordPress', 'ブログ ネタ'],
  'せどり': ['せどり 始め方', 'せどり 仕入れ', 'せどり Amazon', 'せどり メルカリ', 'せどり 初心者', 'せどり 利益率'],
  '動画編集': ['動画編集 始め方', '動画編集 副業', '動画編集 ソフト', '動画編集 初心者', '動画編集 稼ぐ', '動画編集 スマホ'],
  'YouTube': ['YouTube 始め方', 'YouTube 収益化', 'YouTube 伸ばし方', 'YouTube サムネイル', 'YouTube 編集', 'YouTube 登録者'],
  'SNS': ['SNS 収益化', 'SNS マーケティング', 'SNS 集客', 'SNS 運用', 'SNS フォロワー増やす'],
  'Webライター': ['Webライター 始め方', 'Webライター 稼ぐ', 'Webライター 初心者', 'Webライター 案件', 'Webライター 単価'],
  
  // 投資関連
  '株': ['株 初心者', '株 始め方', '株 おすすめ', '株 配当', '株 デイトレ', '株 分析'],
  '投資': ['投資 初心者', '投資 始め方', '投資信託', '投資 おすすめ', '投資 少額', '投資 勉強'],
  'NISA': ['NISA 始め方', 'NISA おすすめ', 'NISA 銘柄', '新NISA', 'NISA 積立', 'NISA 楽天'],
  '仮想通貨': ['仮想通貨 始め方', '仮想通貨 おすすめ', 'ビットコイン', '仮想通貨 初心者', '仮想通貨 取引所'],
  'FX': ['FX 初心者', 'FX 始め方', 'FX 手法', 'FX 自動売買', 'FX スキャルピング'],
  '不動産': ['不動産投資', '不動産投資 始め方', '不動産 副業', '不動産 利回り'],
  
  // スキルアップ
  '英語': ['英語 勉強法', '英語 初心者', '英会話', '英語 リスニング', '英語 発音', 'TOEIC', 'ビジネス英語'],
  'プログラミング': ['プログラミング 初心者', 'プログラミング 独学', 'プログラミング 言語', 'プログラミング スクール', 'プログラミング 副業'],
  'Python': ['Python 入門', 'Python 初心者', 'Python 独学', 'Python AI', 'Python 自動化'],
  'AI': ['AI 活用', 'AI 副業', 'ChatGPT', 'AI 画像生成', 'AI ツール', 'AI 仕事'],
  'ChatGPT': ['ChatGPT 使い方', 'ChatGPT 活用', 'ChatGPT プロンプト', 'ChatGPT 副業', 'ChatGPT 仕事効率化'],
  'Web': ['Web制作', 'Webデザイン', 'Web開発', 'Webマーケティング', 'Webライター'],
  
  // 健康・ダイエット
  'ダイエット': ['ダイエット 方法', 'ダイエット 食事', 'ダイエット 運動', 'ダイエット 短期間', 'ダイエット 成功'],
  '筋トレ': ['筋トレ 初心者', '筋トレ メニュー', '筋トレ 自宅', '筋トレ 食事', '筋トレ 効果'],
  '睡眠': ['睡眠 質', '睡眠 改善', '睡眠 時間', '睡眠 不眠', '睡眠 グッズ'],
  'ストレッチ': ['ストレッチ 効果', 'ストレッチ 朝', 'ストレッチ 肩こり', 'ストレッチ 腰痛'],
  
  // ライフスタイル
  '節約': ['節約 方法', '節約 生活', '節約 食費', '節約 一人暮らし', '節約 家計'],
  'ミニマリスト': ['ミニマリスト 部屋', 'ミニマリスト 持ち物', 'ミニマリスト 生活', 'ミニマリスト 服'],
  '断捨離': ['断捨離 コツ', '断捨離 服', '断捨離 効果', '断捨離 やり方'],
  'ルーティン': ['ルーティン 朝', 'ルーティン 夜', 'ルーティン 休日', 'ルーティン 社会人'],
  
  // メンタル
  'ストレス': ['ストレス 解消', 'ストレス 発散', 'ストレス 仕事', 'ストレス 原因'],
  'メンタル': ['メンタル 強くする', 'メンタル ケア', 'メンタル 弱い', 'メンタル 安定'],
  '自己肯定感': ['自己肯定感 高める', '自己肯定感 低い', '自己肯定感 本'],
  'モチベーション': ['モチベーション 上げる', 'モチベーション 維持', 'モチベーション 仕事'],
  
  // 一般的な修飾語
  '初心者': ['初心者 おすすめ', '初心者 始め方', '初心者 向け'],
  '始め方': ['始め方 初心者', '始め方 簡単'],
  '稼ぐ': ['稼ぐ 方法', '稼ぐ 副業', '稼ぐ 在宅', '稼ぐ スマホ'],
  'おすすめ': ['おすすめ ランキング', 'おすすめ 2024', 'おすすめ 初心者'],
  '方法': ['方法 簡単', '方法 効果的'],
};

interface VideoResult {
  video_id: string;
  title: string;
  description: string;
  channel_title: string;
  published_at: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration: string;
  tags: string[];
}

// サジェスト検索関数
function getSuggestions(input: string): string[] {
  if (!input.trim()) return [];
  
  const inputLower = input.toLowerCase();
  const suggestions: string[] = [];
  
  // キーワードデータベースから検索
  for (const [key, values] of Object.entries(KEYWORD_SUGGESTIONS)) {
    if (key.toLowerCase().includes(inputLower) || inputLower.includes(key.toLowerCase())) {
      suggestions.push(...values);
    }
  }
  
  // ジャンルのキーワードからも検索
  for (const genre of GENRES) {
    for (const keyword of genre.keywords) {
      if (keyword.toLowerCase().includes(inputLower)) {
        suggestions.push(keyword);
      }
    }
  }
  
  // 重複を除去してユニークな配列を返す
  return [...new Set(suggestions)].slice(0, 10);
}

export default function ResearchPage() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
  const [customExcludeKeyword, setCustomExcludeKeyword] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [excludeSuggestions, setExcludeSuggestions] = useState<string[]>([]);
  const [showExcludeSuggestions, setShowExcludeSuggestions] = useState(false);
  const [searchParams, setSearchParams] = useState<VideoSearchRequest>({
    query: '',
    max_results: 10,
    order: 'viewCount',
    video_duration: 'any',
  });
  const [results, setResults] = useState<VideoResult[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  
  // Modal states
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  
  // 複数動画選択
  const [selectedVideos, setSelectedVideos] = useState<VideoResult[]>([]);
  const [showMultiScriptModal, setShowMultiScriptModal] = useState(false);
  
  // 台本生成オプション
  const [scriptLengthType, setScriptLengthType] = useState('10min');
  const [customScriptMinutes, setCustomScriptMinutes] = useState<number>(10);

  useEffect(() => {
    fetchProjects();
  }, []);

  // 選択されたキーワードと除外キーワードから検索クエリを生成
  useEffect(() => {
    const includeQuery = selectedKeywords.join(' ');
    const excludeQuery = excludeKeywords.map(k => `-${k}`).join(' ');
    const query = [includeQuery, excludeQuery].filter(Boolean).join(' ');
    setSearchParams(prev => ({ ...prev, query }));
  }, [selectedKeywords, excludeKeywords]);

  async function fetchProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }

  function handleGenreSelect(genreId: string) {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      setSelectedKeywords([]);
      setExcludeKeywords([]);
    } else {
      setSelectedGenre(genreId);
      setSelectedKeywords([]);
      setExcludeKeywords([]);
    }
  }

  function handleAddExcludeKeyword() {
    if (customExcludeKeyword.trim() && !excludeKeywords.includes(customExcludeKeyword.trim())) {
      setExcludeKeywords(prev => [...prev, customExcludeKeyword.trim()]);
      setCustomExcludeKeyword('');
    }
  }

  function handleRemoveExcludeKeyword(keyword: string) {
    setExcludeKeywords(prev => prev.filter(k => k !== keyword));
  }

  function handleKeywordToggle(keyword: string) {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  }

  function handleAddCustomKeyword() {
    if (customKeyword.trim() && !selectedKeywords.includes(customKeyword.trim())) {
      setSelectedKeywords(prev => [...prev, customKeyword.trim()]);
      setCustomKeyword('');
      setShowSuggestions(false);
      setKeywordSuggestions([]);
    }
  }

  function handleCustomKeywordChange(value: string) {
    setCustomKeyword(value);
    if (value.trim()) {
      const suggestions = getSuggestions(value);
      setKeywordSuggestions(suggestions.filter(s => !selectedKeywords.includes(s)));
      setShowSuggestions(suggestions.length > 0);
    } else {
      setKeywordSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSelectSuggestion(suggestion: string) {
    if (!selectedKeywords.includes(suggestion)) {
      setSelectedKeywords(prev => [...prev, suggestion]);
    }
    setCustomKeyword('');
    setShowSuggestions(false);
    setKeywordSuggestions([]);
  }

  function handleExcludeKeywordChange(value: string) {
    setCustomExcludeKeyword(value);
    if (value.trim()) {
      const suggestions = getSuggestions(value);
      setExcludeSuggestions(suggestions.filter(s => !excludeKeywords.includes(s)));
      setShowExcludeSuggestions(suggestions.length > 0);
    } else {
      setExcludeSuggestions([]);
      setShowExcludeSuggestions(false);
    }
  }

  function handleSelectExcludeSuggestion(suggestion: string) {
    if (!excludeKeywords.includes(suggestion)) {
      setExcludeKeywords(prev => [...prev, suggestion]);
    }
    setCustomExcludeKeyword('');
    setShowExcludeSuggestions(false);
    setExcludeSuggestions([]);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchParams.query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    setAnalysisResults({});
    setSelectedVideos([]);
    
    try {
      const data = await searchVideos(searchParams);
      setResults(data as unknown as VideoResult[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リサーチに失敗しました。YouTube APIキーを確認してください。');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(video: VideoResult) {
    if (projects.length === 0) {
      alert('先にプロジェクトを作成してください');
      return;
    }
    
    setAnalyzing(video.video_id);
    
    try {
      const importedVideos = await importVideosToProject(selectedProjectId, {
        query: video.title,
        max_results: 1,
      });
      
      if (importedVideos.length === 0) {
        throw new Error('動画のインポートに失敗しました');
      }
      
      const dbVideoId = importedVideos[0].id;
      
      const response = await fetch(`http://localhost:8000/api/analysis/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: dbVideoId, force_reanalyze: false }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '分析に失敗しました');
      }
      
      const analysis = await response.json();
      setAnalysisResults(prev => ({ ...prev, [video.video_id]: analysis }));
      
    } catch (err) {
      alert(err instanceof Error ? err.message : '分析に失敗しました');
    } finally {
      setAnalyzing(null);
    }
  }

  async function handleGenerateScript(video: VideoResult) {
    if (projects.length === 0) {
      alert('先にプロジェクトを作成してください');
      return;
    }
    
    setSelectedVideo(video);
    setShowScriptModal(true);
  }

  // 複数動画選択のトグル
  function handleVideoSelect(video: VideoResult) {
    setSelectedVideos(prev => {
      const isSelected = prev.some(v => v.video_id === video.video_id);
      if (isSelected) {
        return prev.filter(v => v.video_id !== video.video_id);
      } else {
        if (prev.length >= 3) {
          alert('最大3本まで選択できます');
          return prev;
        }
        return [...prev, video];
      }
    });
  }

  // 複数動画から台本生成
  async function handleGenerateFromMultiple() {
    if (selectedVideos.length === 0) {
      alert('動画を選択してください');
      return;
    }
    if (projects.length === 0) {
      alert('先にプロジェクトを作成してください');
      return;
    }
    setShowMultiScriptModal(true);
  }

  // 複数動画から台本生成を実行
  async function submitGenerateFromMultiple() {
    if (selectedVideos.length === 0 || !selectedProjectId) return;
    
    setGenerating(true);
    
    try {
      // まず全ての動画をインポート＆分析
      const videoIds: number[] = [];
      for (const video of selectedVideos) {
        // インポート
        const importedVideos = await importVideosToProject(selectedProjectId, {
          query: video.title,
          max_results: 1,
        });
        
        if (importedVideos.length === 0) {
          throw new Error(`動画「${video.title}」のインポートに失敗しました`);
        }
        
        const dbVideoId = importedVideos[0].id;
        
        // 分析（まだ分析されていない場合）
        if (!analysisResults[video.video_id]) {
          const response = await fetch(`http://localhost:8000/api/analysis/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_id: dbVideoId, force_reanalyze: false }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `動画「${video.title}」の分析に失敗しました`);
          }
          
          const analysis = await response.json();
          setAnalysisResults(prev => ({ ...prev, [video.video_id]: analysis }));
        }
        
        videoIds.push(dbVideoId);
      }
      
      // 複数動画から台本生成
      const lengthType = scriptLengthType === 'custom' ? `${customScriptMinutes}min` : scriptLengthType;
      const request: GenerateScriptRequest = {
        project_id: selectedProjectId,
        base_video_ids: videoIds,
        tone: 'logical_and_casual',
        length_type: lengthType,
      };
      
      const script = await generateScript(request);
      setShowMultiScriptModal(false);
      setSelectedVideos([]);
      router.push(`/scripts/${script.id}`);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : '台本生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  }

  async function submitGenerateScript() {
    if (!selectedVideo || !selectedProjectId) return;
    
    setGenerating(true);
    
    try {
      const lengthType = scriptLengthType === 'custom' ? `${customScriptMinutes}min` : scriptLengthType;
      const request: GenerateScriptRequest = {
        project_id: selectedProjectId,
        tone: 'logical_and_casual',
        length_type: lengthType,
        custom_topic: `「${selectedVideo.title}」を参考にした動画台本`,
      };
      
      const script = await generateScript(request);
      setShowScriptModal(false);
      router.push(`/scripts/${script.id}`);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : '台本生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  }

  function formatViewCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  function formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    const hours = match[1] ? `${match[1]}:` : '';
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';
    return `${hours}${minutes}:${seconds}`;
  }

  const currentGenre = GENRES.find(g => g.id === selectedGenre);

  return (
    <div className="min-h-screen cyber-bg">
      <Sidebar />
      
      <main className="ml-56 p-6 relative z-10">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-[#f0f0ff]">
            <span className="text-[#00d4ff] neon-text">YouTube</span> リサーチ
          </h1>
          <p className="mt-1 text-[#8888aa]">伸びている動画を検索・分析</p>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="mb-4 flex items-center gap-3 animate-fade-in">
            <label className="text-sm text-[#8888aa]">保存先プロジェクト:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              className="rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(20,25,50,0.8)] px-3 py-1.5 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Genre Selection */}
        <div className="mb-6 glass-card p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">① ジャンルを選択</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreSelect(genre.id)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-all ${
                  selectedGenre === genre.id
                    ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.15)] text-[#00d4ff] neon-border'
                    : 'border-[rgba(100,200,255,0.2)] text-[#f0f0ff] hover:border-[#00d4ff]/50 hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <span className="text-xl">{genre.icon}</span>
                <span className="text-sm font-medium">{genre.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Selection */}
        {selectedGenre && currentGenre && (
          <div className="mb-6 glass-card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">
              ② キーワードを選択 
              <span className="ml-2 text-sm font-normal text-[#8888aa]">（複数選択可）</span>
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentGenre.keywords.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleKeywordToggle(keyword)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedKeywords.includes(keyword)
                      ? 'bg-[#00d4ff] text-[#000] font-semibold'
                      : 'bg-[rgba(255,255,255,0.05)] text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(100,200,255,0.2)]'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
            
            {/* Custom Keyword Input with Suggestions */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e) => handleCustomKeywordChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (keywordSuggestions.length > 0) {
                          handleSelectSuggestion(keywordSuggestions[0]);
                        } else {
                          handleAddCustomKeyword();
                        }
                      }
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => customKeyword.trim() && keywordSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="キーワードを入力して検索..."
                    className="w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2 text-sm text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && keywordSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-[rgba(0,212,255,0.3)] bg-[rgba(20,25,50,0.98)] shadow-lg shadow-[rgba(0,212,255,0.1)] backdrop-blur-sm overflow-hidden">
                      <div className="px-3 py-2 text-xs text-[#00d4ff] border-b border-[rgba(100,200,255,0.2)]">
                        💡 関連キーワード候補
                      </div>
                      {keywordSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`w-full px-4 py-2.5 text-left text-sm text-[#f0f0ff] hover:bg-[rgba(0,212,255,0.15)] transition-colors flex items-center gap-2 ${
                            index === 0 ? 'bg-[rgba(0,212,255,0.05)]' : ''
                          }`}
                        >
                          <span className="text-[#00d4ff]">+</span>
                          {suggestion}
                          {index === 0 && (
                            <span className="ml-auto text-xs text-[#8888aa] bg-[rgba(100,200,255,0.1)] px-2 py-0.5 rounded">Enter</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddCustomKeyword}
                  disabled={!customKeyword.trim()}
                  className="rounded-lg bg-[rgba(0,212,255,0.15)] px-4 py-2 text-sm font-medium text-[#00d4ff] hover:bg-[rgba(0,212,255,0.25)] disabled:opacity-50 border border-[rgba(0,212,255,0.3)]"
                >
                  追加
                </button>
              </div>
            </div>

            {/* Selected Keywords Display */}
            {selectedKeywords.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]">
                <p className="text-xs text-[#00d4ff] mb-2">選択中のキーワード:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 rounded-full bg-[#00d4ff] px-3 py-1 text-xs text-[#000] font-semibold"
                    >
                      {keyword}
                      <button
                        onClick={() => handleKeywordToggle(keyword)}
                        className="ml-1 hover:text-[#333]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Exclude Keywords Section */}
            <div className="mt-6 pt-6 border-t border-[rgba(100,200,255,0.2)]">
              <h3 className="text-sm font-semibold text-[#f0f0ff] mb-3 flex items-center gap-2">
                <span className="text-[#ff00ff]">🚫</span>
                除外キーワード
                <span className="text-xs font-normal text-[#8888aa]">（検索結果から除外したいワード）</span>
              </h3>
              
              {/* Common Exclude Keywords */}
              <div className="flex flex-wrap gap-2 mb-3">
                {['切り抜き', 'ひろゆき', 'ゆっくり', 'ASMR', 'Vtuber', 'ショート', 'shorts', 'ライブ配信', 'ゲーム実況'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => excludeKeywords.includes(keyword) ? handleRemoveExcludeKeyword(keyword) : setExcludeKeywords(prev => [...prev, keyword])}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      excludeKeywords.includes(keyword)
                        ? 'bg-[#ff00ff] text-white'
                        : 'bg-[rgba(255,255,255,0.05)] text-[#8888aa] hover:bg-[rgba(255,0,255,0.15)] hover:text-[#ff00ff] border border-[rgba(100,200,255,0.2)]'
                    }`}
                  >
                    -{keyword}
                  </button>
                ))}
              </div>
              
              {/* Custom Exclude Keyword Input with Suggestions */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customExcludeKeyword}
                      onChange={(e) => handleExcludeKeywordChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (excludeSuggestions.length > 0) {
                            handleSelectExcludeSuggestion(excludeSuggestions[0]);
                          } else {
                            handleAddExcludeKeyword();
                          }
                        }
                        if (e.key === 'Escape') {
                          setShowExcludeSuggestions(false);
                        }
                      }}
                      onFocus={() => customExcludeKeyword.trim() && excludeSuggestions.length > 0 && setShowExcludeSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowExcludeSuggestions(false), 200)}
                      placeholder="除外したいキーワードを入力..."
                      className="w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2 text-sm text-[#f0f0ff] focus:border-[#ff00ff] focus:outline-none"
                    />
                    
                    {/* Exclude Suggestions Dropdown */}
                    {showExcludeSuggestions && excludeSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-lg border border-[rgba(255,0,255,0.3)] bg-[rgba(20,25,50,0.98)] shadow-lg shadow-[rgba(255,0,255,0.1)] backdrop-blur-sm overflow-hidden">
                        <div className="px-3 py-2 text-xs text-[#ff00ff] border-b border-[rgba(255,0,255,0.2)]">
                          🚫 除外キーワード候補
                        </div>
                        {excludeSuggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSelectExcludeSuggestion(suggestion)}
                            className={`w-full px-4 py-2.5 text-left text-sm text-[#f0f0ff] hover:bg-[rgba(255,0,255,0.15)] transition-colors flex items-center gap-2 ${
                              index === 0 ? 'bg-[rgba(255,0,255,0.05)]' : ''
                            }`}
                          >
                            <span className="text-[#ff00ff]">-</span>
                            {suggestion}
                            {index === 0 && (
                              <span className="ml-auto text-xs text-[#8888aa] bg-[rgba(255,0,255,0.1)] px-2 py-0.5 rounded">Enter</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddExcludeKeyword}
                    disabled={!customExcludeKeyword.trim()}
                    className="rounded-lg bg-[rgba(255,0,255,0.15)] px-4 py-2 text-sm font-medium text-[#ff00ff] hover:bg-[rgba(255,0,255,0.25)] disabled:opacity-50 border border-[rgba(255,0,255,0.3)]"
                  >
                    除外
                  </button>
                </div>
              </div>

              {/* Selected Exclude Keywords Display */}
              {excludeKeywords.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-[rgba(255,0,255,0.1)] border border-[rgba(255,0,255,0.3)]">
                  <p className="text-xs text-[#ff00ff] mb-2">除外中のキーワード:</p>
                  <div className="flex flex-wrap gap-2">
                    {excludeKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 rounded-full bg-[#ff00ff] px-3 py-1 text-xs text-white font-semibold"
                      >
                        -{keyword}
                        <button
                          onClick={() => handleRemoveExcludeKeyword(keyword)}
                          className="ml-1 hover:text-white/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Options & Button */}
        <form onSubmit={handleSearch} className="mb-6 glass-card p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">③ 検索オプション</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#f0f0ff]">検索クエリ</label>
              <input
                type="text"
                value={searchParams.query}
                onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                placeholder="キーワードを選択するか直接入力..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f0f0ff]">並び順</label>
              <select
                value={searchParams.order}
                onChange={(e) => setSearchParams({ ...searchParams, order: e.target.value as VideoSearchRequest['order'] })}
                className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
              >
                <option value="viewCount">再生回数</option>
                <option value="relevance">関連性</option>
                <option value="date">投稿日</option>
                <option value="rating">評価</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f0f0ff]">動画の長さ</label>
              <select
                value={searchParams.video_duration}
                onChange={(e) => setSearchParams({ ...searchParams, video_duration: e.target.value as VideoSearchRequest['video_duration'] })}
                className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
              >
                <option value="any">すべて</option>
                <option value="short">〜5分</option>
                <option value="medium">5〜20分</option>
                <option value="medium_long">20〜40分</option>
                <option value="long">40〜60分</option>
                <option value="very_long">60分〜</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#8888aa]">
                <span>取得件数:</span>
                <select
                  value={searchParams.max_results}
                  onChange={(e) => setSearchParams({ ...searchParams, max_results: parseInt(e.target.value) })}
                  className="rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-3 py-1.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                >
                  <option value={10}>10件</option>
                  <option value={25}>25件</option>
                  <option value={50}>50件</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading || !searchParams.query.trim()}
              className="flex items-center gap-2 rounded-xl btn-cyber-cyan px-6 py-2.5 font-bold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#000] border-t-transparent" />
                  検索中...
                </>
              ) : (
                <>
                  <SearchIcon className="h-5 w-5" />
                  リサーチ開始
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {error && (
          <div className="mb-6 rounded-lg bg-[rgba(255,0,100,0.1)] border border-[rgba(255,0,100,0.3)] p-4 text-sm text-[#ff6b6b] animate-fade-in">
            <p className="font-medium">エラーが発生しました</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {searched && !loading && results.length === 0 && !error && (
          <div className="glass-card p-16 text-center animate-fade-in border-dashed">
            <SearchIcon className="mx-auto h-16 w-16 text-[#8888aa]" />
            <h3 className="mt-6 text-xl font-semibold text-[#f0f0ff]">動画が見つかりませんでした</h3>
            <p className="mt-2 text-[#8888aa]">別のキーワードで検索してみてください</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f0f0ff]">
                検索結果 <span className="text-[#00d4ff]">({results.length}件)</span>
              </h2>
              
              {/* 複数選択からの台本生成ボタン */}
              {selectedVideos.length > 0 && (
                <button
                  onClick={handleGenerateFromMultiple}
                  className="flex items-center gap-2 rounded-xl btn-cyber-magenta px-4 py-2 text-sm font-bold animate-pulse"
                >
                  <SparklesIcon className="h-4 w-4" />
                  {selectedVideos.length}本から台本生成
                </button>
              )}
            </div>
            
            {/* 選択中の動画表示 */}
            {selectedVideos.length > 0 && (
              <div className="glass-card p-4 border-[rgba(255,0,255,0.3)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#ff00ff] flex items-center gap-2">
                    <span>📌</span>
                    選択中の動画（{selectedVideos.length}/3本）
                  </h3>
                  <button
                    onClick={() => setSelectedVideos([])}
                    className="text-xs text-[#8888aa] hover:text-[#ff6b6b]"
                  >
                    すべて解除
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedVideos.map((video, index) => (
                    <div
                      key={video.video_id}
                      className="flex items-center gap-2 rounded-lg bg-[rgba(255,0,255,0.1)] border border-[rgba(255,0,255,0.3)] px-3 py-2"
                    >
                      <span className="text-xs text-[#ff00ff] font-bold">{index + 1}</span>
                      <img
                        src={video.thumbnail_url}
                        alt=""
                        className="h-8 w-14 rounded object-cover"
                      />
                      <span className="text-xs text-[#f0f0ff] max-w-[150px] truncate">{video.title}</span>
                      <button
                        onClick={() => handleVideoSelect(video)}
                        className="text-[#8888aa] hover:text-[#ff6b6b] ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-4">
              {results.map((video, index) => {
                const isSelected = selectedVideos.some(v => v.video_id === video.video_id);
                const selectionIndex = selectedVideos.findIndex(v => v.video_id === video.video_id);
                
                return (
                <div
                  key={video.video_id}
                  className={`glass-card p-4 card-hover animate-fade-in opacity-0 stagger-${Math.min(index + 1, 5)} ${
                    isSelected ? 'ring-2 ring-[#ff00ff] bg-[rgba(255,0,255,0.05)]' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* 選択チェックボックス */}
                    <div className="flex-shrink-0 flex items-start pt-1">
                      <button
                        onClick={() => handleVideoSelect(video)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#ff00ff] border-[#ff00ff] text-white'
                            : 'border-[rgba(100,200,255,0.3)] hover:border-[#ff00ff] text-transparent hover:text-[#ff00ff]'
                        }`}
                      >
                        {isSelected ? (
                          <span className="text-xs font-bold">{selectionIndex + 1}</span>
                        ) : (
                          <span className="text-xs">+</span>
                        )}
                      </button>
                    </div>
                    
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-28 w-48 rounded-lg object-cover"
                      />
                      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-[#f0f0ff] hover:text-[#00d4ff] line-clamp-2 transition-colors"
                      >
                        {video.title}
                      </a>
                      <p className="mt-1 text-sm text-[#8888aa]">{video.channel_title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#8888aa]">
                        <span className="flex items-center gap-1">
                          <ViewIcon className="h-4 w-4" />
                          {formatViewCount(video.view_count)} 回視聴
                        </span>
                        <span className="flex items-center gap-1">
                          <LikeIcon className="h-4 w-4" />
                          {formatViewCount(video.like_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CommentIcon className="h-4 w-4" />
                          {formatViewCount(video.comment_count)}
                        </span>
                        <span>
                          {new Date(video.published_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      {video.tags && video.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {video.tags.slice(0, 5).map((tag, i) => (
                            <span key={i} className="rounded-full tag-magenta px-2 py-0.5 text-xs">
                              {tag}
                            </span>
                          ))}
                          {video.tags.length > 5 && (
                            <span className="text-xs text-[#8888aa]">+{video.tags.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleAnalyze(video)}
                        disabled={analyzing === video.video_id || projects.length === 0}
                        className="rounded-lg border border-[rgba(100,200,255,0.3)] px-3 py-2 text-xs font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 transition-all"
                      >
                        {analyzing === video.video_id ? (
                          <span className="flex items-center gap-1">
                            <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                            分析中
                          </span>
                        ) : analysisResults[video.video_id] ? '✓ 分析済' : '🔍 分析'}
                      </button>
                      <button 
                        onClick={() => handleGenerateScript(video)}
                        disabled={projects.length === 0}
                        className="rounded-lg bg-[rgba(255,0,255,0.15)] border border-[rgba(255,0,255,0.3)] px-3 py-2 text-xs font-medium text-[#ff00ff] hover:bg-[rgba(255,0,255,0.25)] disabled:opacity-50 transition-all"
                      >
                        ✨ 台本生成
                      </button>
                    </div>
                  </div>
                  
                  {/* Analysis Results */}
                  {analysisResults[video.video_id] && (
                    <div className="mt-4 rounded-lg bg-[rgba(0,212,255,0.05)] p-4 border-t border-[rgba(0,212,255,0.2)]">
                      <h4 className="text-sm font-semibold text-[#00d4ff] mb-3">📊 分析結果</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#8888aa] mb-1">要約</p>
                          <p className="text-[#f0f0ff]">{analysisResults[video.video_id].summary}</p>
                        </div>
                        <div>
                          <p className="text-[#8888aa] mb-1">ターゲット</p>
                          <p className="text-[#f0f0ff]">{analysisResults[video.video_id].target_audience}</p>
                        </div>
                        <div>
                          <p className="text-[#8888aa] mb-1">フック</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResults[video.video_id].hooks?.map((hook: string, i: number) => (
                              <span key={i} className="rounded tag-cyan px-2 py-0.5 text-xs">{hook}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[#8888aa] mb-1">構成</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResults[video.video_id].structure?.map((s: string, i: number) => (
                              <span key={i} className="rounded tag-magenta px-2 py-0.5 text-xs">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[#8888aa] text-xs">伸びやすさスコア:</span>
                        <span className="font-bold text-[#00d4ff] neon-text">{analysisResults[video.video_id].score}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* Script Generation Modal (Single Video) */}
        {showScriptModal && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg glass-card p-6 animate-fade-in neon-border">
              <h2 className="text-xl font-semibold text-[#f0f0ff]">✨ 台本生成</h2>
              <p className="mt-2 text-sm text-[#8888aa]">
                「{selectedVideo.title.slice(0, 50)}...」を参考に台本を生成します
              </p>
              
              <div className="mt-4 rounded-lg bg-[rgba(0,212,255,0.05)] p-4 border border-[rgba(0,212,255,0.2)]">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedVideo.thumbnail_url}
                    alt=""
                    className="h-16 w-28 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#f0f0ff] line-clamp-2">{selectedVideo.title}</p>
                    <p className="text-xs text-[#8888aa]">{selectedVideo.channel_title}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">保存先プロジェクト</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">台本の長さ</label>
                  <select
                    value={scriptLengthType}
                    onChange={(e) => setScriptLengthType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                  >
                    <option value="5min">〜5分（約1,500文字）</option>
                    <option value="10min">5〜20分（約3,000文字）</option>
                    <option value="20min">20〜40分（約6,000文字）</option>
                    <option value="40min">40〜60分（約12,000文字）</option>
                    <option value="60min">60分〜（約18,000文字）</option>
                    <option value="custom">カスタム入力</option>
                  </select>
                </div>
              </div>
              
              {/* カスタム分数入力 */}
              {scriptLengthType === 'custom' && (
                <div className="mt-4 p-4 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <label className="block text-sm font-medium text-[#00d4ff] mb-2">動画の長さを入力（分）</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={customScriptMinutes}
                      onChange={(e) => setCustomScriptMinutes(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
                      className="w-24 rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2 text-[#f0f0ff] text-center focus:border-[#00d4ff] focus:outline-none"
                    />
                    <span className="text-[#8888aa]">分</span>
                    <span className="text-xs text-[#8888aa]">
                      （約{Math.round(customScriptMinutes * 300).toLocaleString()}文字）
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowScriptModal(false)}
                  className="rounded-lg border border-[rgba(100,200,255,0.3)] px-4 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={submitGenerateScript}
                  disabled={generating}
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
            </div>
          </div>
        )}

        {/* Multi-Video Script Generation Modal */}
        {showMultiScriptModal && selectedVideos.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl glass-card p-6 animate-fade-in neon-border">
              <h2 className="text-xl font-semibold text-[#f0f0ff] flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                複数動画から台本生成
              </h2>
              <p className="mt-2 text-sm text-[#8888aa]">
                {selectedVideos.length}本の動画を分析し、良い要素を組み合わせた台本を生成します
              </p>
              
              <div className="mt-4 space-y-3">
                {selectedVideos.map((video, index) => (
                  <div
                    key={video.video_id}
                    className="flex items-center gap-3 rounded-lg bg-[rgba(255,0,255,0.05)] p-3 border border-[rgba(255,0,255,0.2)]"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff00ff] text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <img
                      src={video.thumbnail_url}
                      alt=""
                      className="h-12 w-20 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#f0f0ff] line-clamp-1">{video.title}</p>
                      <p className="text-xs text-[#8888aa]">{video.channel_title}</p>
                    </div>
                    {analysisResults[video.video_id] && (
                      <span className="text-xs text-[#00d4ff] bg-[rgba(0,212,255,0.1)] px-2 py-1 rounded">
                        ✓ 分析済
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                <p className="text-xs text-[#00d4ff] mb-2">💡 複数動画から生成される台本の特徴：</p>
                <ul className="text-xs text-[#8888aa] space-y-1">
                  <li>• 各動画で共通する成功要素を抽出</li>
                  <li>• 最も効果的なフック・構成パターンを採用</li>
                  <li>• ターゲット視聴者に響くベネフィットを統合</li>
                </ul>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">保存先プロジェクト</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#f0f0ff]">台本の長さ</label>
                  <select
                    value={scriptLengthType}
                    onChange={(e) => setScriptLengthType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2.5 text-[#f0f0ff] focus:border-[#00d4ff] focus:outline-none"
                  >
                    <option value="5min">〜5分（約1,500文字）</option>
                    <option value="10min">5〜20分（約3,000文字）</option>
                    <option value="20min">20〜40分（約6,000文字）</option>
                    <option value="40min">40〜60分（約12,000文字）</option>
                    <option value="60min">60分〜（約18,000文字）</option>
                    <option value="custom">カスタム入力</option>
                  </select>
                </div>
              </div>
              
              {/* カスタム分数入力 */}
              {scriptLengthType === 'custom' && (
                <div className="mt-4 p-4 rounded-lg bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)]">
                  <label className="block text-sm font-medium text-[#00d4ff] mb-2">動画の長さを入力（分）</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={customScriptMinutes}
                      onChange={(e) => setCustomScriptMinutes(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
                      className="w-24 rounded-lg border border-[rgba(100,200,255,0.3)] bg-[rgba(10,10,30,0.8)] px-4 py-2 text-[#f0f0ff] text-center focus:border-[#00d4ff] focus:outline-none"
                    />
                    <span className="text-[#8888aa]">分</span>
                    <span className="text-xs text-[#8888aa]">
                      （約{Math.round(customScriptMinutes * 300).toLocaleString()}文字）
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowMultiScriptModal(false)}
                  className="rounded-lg border border-[rgba(100,200,255,0.3)] px-4 py-2 text-sm font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={submitGenerateFromMultiple}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-xl btn-cyber-magenta px-4 py-2 text-sm font-bold disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      分析＆生成中...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      {selectedVideos.length}本から台本を生成
                    </>
                  )}
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
function SearchIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ViewIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LikeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
    </svg>
  );
}

function CommentIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
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
