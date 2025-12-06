"""
LLM Service (Anthropic Claude / OpenAI GPT / Google Gemini)
動画分析・台本生成のためのLLMサービス
"""
import json
from typing import Optional, Dict, Any, List
from app.config import settings


class LLMService:
    """LLM APIラッパー（Anthropic / OpenAI / Gemini対応）"""

    def __init__(self, provider: Optional[str] = None):
        """
        LLMサービスを初期化

        Args:
            provider: LLMプロバイダー ("anthropic", "openai", or "gemini")
        """
        self.provider = provider or settings.llm_provider
        
        if self.provider == "anthropic":
            from anthropic import Anthropic
            api_key = settings.anthropic_api_key
            if not api_key:
                raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY in .env")
            self.client = Anthropic(api_key=api_key)
            self.model = "claude-sonnet-4-20250514"  # Claude Sonnet 4
        elif self.provider == "anthropic-sonnet45":
            from anthropic import Anthropic
            api_key = settings.anthropic_api_key
            if not api_key:
                raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY in .env")
            self.client = Anthropic(api_key=api_key)
            self.model = "claude-sonnet-4-5-20250514"  # Claude Sonnet 4.5 (最新)
        elif self.provider == "openai":
            from openai import OpenAI
            api_key = settings.openai_api_key
            if not api_key:
                raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY in .env")
            self.client = OpenAI(api_key=api_key)
            self.model = "gpt-4o-mini"
        elif self.provider == "gemini":
            import google.generativeai as genai
            api_key = settings.gemini_api_key
            if not api_key:
                raise ValueError("Gemini API key is required. Set GEMINI_API_KEY in .env")
            genai.configure(api_key=api_key)
            self.client = genai
            self.model = "gemini-2.5-pro-preview-06-05"  # Gemini 2.5 Pro (最新)
        elif self.provider == "gemini-flash":
            import google.generativeai as genai
            api_key = settings.gemini_api_key
            if not api_key:
                raise ValueError("Gemini API key is required. Set GEMINI_API_KEY in .env")
            genai.configure(api_key=api_key)
            self.client = genai
            self.model = "gemini-2.5-flash-preview-05-20"  # Gemini 2.5 Flash (高速版)
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")

    def _call_llm(self, prompt: str, max_tokens: int = 2000) -> str:
        """LLMを呼び出す共通メソッド"""
        if self.provider in ["anthropic", "anthropic-sonnet45"]:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        elif self.provider == "openai":
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        else:  # gemini or gemini-flash
            model = self.client.GenerativeModel(self.model)
            response = model.generate_content(
                prompt,
                generation_config=self.client.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                )
            )
            return response.text

    def _parse_json_response(self, content: str, default: Dict[str, Any]) -> Dict[str, Any]:
        """LLMレスポンスからJSONを抽出"""
        try:
            # ```json ... ``` の形式を処理
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            else:
                json_str = content.strip()
            
            return json.loads(json_str)
        except json.JSONDecodeError:
            return default

    def analyze_video(
        self,
        title: str,
        description: str,
        channel_title: str,
        view_count: int,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        YouTube動画を分析して「伸びる要素」を抽出

        Args:
            title: 動画タイトル
            description: 動画説明文
            channel_title: チャンネル名
            view_count: 再生回数
            tags: タグリスト

        Returns:
            分析結果（構造化JSON）
        """
        tags_str = ", ".join(tags) if tags else "なし"
        
        prompt = f"""以下のYouTube動画を分析し、「伸びる要素」を抽出してください。

【動画情報】
- タイトル: {title}
- チャンネル: {channel_title}
- 再生回数: {view_count:,}回
- タグ: {tags_str}
- 説明文:
{description[:2000]}

【分析項目】
以下の項目を分析し、JSON形式で出力してください：

1. summary: 動画の内容を100文字程度で要約
2. hooks: 視聴者を引き付けるフック要素（配列、3-5個）
3. benefits: 視聴者が得られるベネフィット（配列、3-5個）
4. structure: 動画の構成パターン（配列、例: ["オープニング", "問題提起", "解決策", "まとめ"]）
5. target_audience: ターゲット視聴者層（文字列）
6. cta_pattern: CTAパターンの分析（文字列、例: "LINE登録で無料PDF系"）
7. score: 伸びやすさスコア（0-100の整数）

【出力形式】
必ず以下のJSON形式で出力してください（他の文章は不要）：
{{
  "summary": "...",
  "hooks": ["...", "...", "..."],
  "benefits": ["...", "...", "..."],
  "structure": ["...", "...", "..."],
  "target_audience": "...",
  "cta_pattern": "...",
  "score": 85
}}"""

        content = self._call_llm(prompt, max_tokens=2000)
        
        default = {
            "summary": content[:200],
            "hooks": [],
            "benefits": [],
            "structure": [],
            "target_audience": "不明",
            "cta_pattern": "不明",
            "score": 50
        }
        
        return self._parse_json_response(content, default)

    def generate_script(
        self,
        analysis: Optional[Dict[str, Any]] = None,
        analyses: Optional[List[Dict[str, Any]]] = None,
        topic: Optional[str] = None,
        tone: str = "logical_and_casual",
        length_type: str = "10min",
        offer: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        台本を生成

        Args:
            analysis: 動画分析結果（単一ベース動画の場合）
            analyses: 複数動画の分析結果リスト（1-3本の動画を参考にする場合）
            topic: カスタムトピック（ベース動画がない場合）
            tone: トーン（logical_and_casual, friendly, professional等）
            length_type: 動画の長さ（5min, 10min, 15min等）
            offer: オファー情報

        Returns:
            生成された台本（構造化JSON）
        """
        tone_descriptions = {
            "logical_and_casual": "論理的でありながらカジュアルな口調",
            "friendly": "親しみやすくフレンドリーな口調",
            "professional": "プロフェッショナルで信頼感のある口調",
            "energetic": "エネルギッシュで熱量のある口調"
        }
        
        length_descriptions = {
            "5min": "約5分（1500文字程度）",
            "10min": "約10〜20分（3000文字程度）",
            "15min": "約15分（4500文字程度）",
            "20min": "約20〜40分（6000文字程度）",
            "40min": "約40〜60分（12000文字程度）",
            "60min": "約60分以上（18000文字程度）"
        }
        
        # 長さに応じたmax_tokensを設定
        max_tokens_map = {
            "5min": 3000,
            "10min": 5000,
            "15min": 7000,
            "20min": 10000,
            "40min": 16000,
            "60min": 24000
        }
        
        # カスタム分数の処理（例: "25min" -> 25分）
        import re
        custom_match = re.match(r'^(\d+)min$', length_type)
        if custom_match and length_type not in length_descriptions:
            minutes = int(custom_match.group(1))
            char_count = minutes * 300  # 1分あたり約300文字
            length_desc = f"約{minutes}分（{char_count}文字程度）"
            # max_tokensを分数に応じて計算（1分あたり約500トークン）
            script_max_tokens = min(max(minutes * 500, 3000), 32000)
        else:
            length_desc = length_descriptions.get(length_type, length_descriptions["10min"])
            script_max_tokens = max_tokens_map.get(length_type, 5000)
        
        tone_desc = tone_descriptions.get(tone, tone_descriptions["logical_and_casual"])
        
        # 分析結果またはトピックからコンテキストを構築
        if analyses and len(analyses) > 0:
            # 複数動画の分析結果を統合
            context = "【参考動画の分析結果（複数動画を参考に台本を作成）】\n"
            for i, a in enumerate(analyses, 1):
                context += f"""
=== 参考動画 {i} ===
- 要約: {a.get('summary', '')}
- フック: {', '.join(a.get('hooks', []))}
- ベネフィット: {', '.join(a.get('benefits', []))}
- 構成: {', '.join(a.get('structure', []))}
- ターゲット: {a.get('target_audience', '')}
- CTAパターン: {a.get('cta_pattern', '')}
- 伸びスコア: {a.get('score', 'N/A')}
"""
            context += """
【重要な指示】
上記の複数動画から以下を抽出し、新しいオリジナル台本を作成してください：
- 各動画で共通している成功要素
- 最も効果的なフック・構成パターン
- ターゲット視聴者に響くベネフィット
- 複数動画の良い点を組み合わせた最適な構成"""
        elif analysis:
            context = f"""【ベース動画の分析結果】
- 要約: {analysis.get('summary', '')}
- フック: {', '.join(analysis.get('hooks', []))}
- ベネフィット: {', '.join(analysis.get('benefits', []))}
- 構成: {', '.join(analysis.get('structure', []))}
- ターゲット: {analysis.get('target_audience', '')}
- CTAパターン: {analysis.get('cta_pattern', '')}"""
        elif topic:
            context = f"【トピック】\n{topic}"
        else:
            context = "【トピック】\n視聴者に価値を提供する一般的なコンテンツ"
        
        # オファー情報
        offer_context = ""
        if offer:
            offer_context = f"""
【オファー情報（動画内で誘導するもの）】
- LP URL: {offer.get('lp_url', 'なし')}
- オファータイプ: {offer.get('offer_type', 'なし')}
- オファータイトル: {offer.get('offer_title', 'なし')}
- ターゲット: {offer.get('target_audience', 'なし')}"""

        prompt = f"""あなたは優秀なYouTube台本ライターです。
以下の情報を元に、非属人型（顔出し不要、ナレーション形式）のYouTube動画台本を生成してください。

{context}
{offer_context}

【台本の要件】
- トーン: {tone_desc}
- 長さ: {length_desc}
- 形式: ナレーション形式（話し言葉で書く）
- 目的: 視聴者に価値を提供し、最後にオファーへ誘導

【台本の構成】
1. オープニング（フックで興味を引く）
2. 問題提起（視聴者の悩みに共感）
3. 解決策（3つのポイントなど）
4. まとめ
5. CTA（オファーへの誘導）

【出力形式】
必ず以下のJSON形式で出力してください：
{{
  "title": "動画タイトル案",
  "sections": [
    {{"name": "オープニング", "content": "（ナレーション内容）"}},
    {{"name": "問題提起", "content": "（ナレーション内容）"}},
    {{"name": "解決策1", "content": "（ナレーション内容）"}},
    {{"name": "解決策2", "content": "（ナレーション内容）"}},
    {{"name": "解決策3", "content": "（ナレーション内容）"}},
    {{"name": "まとめ", "content": "（ナレーション内容）"}},
    {{"name": "CTA", "content": "（ナレーション内容）"}}
  ],
  "cta_text": "▼説明欄用のCTAテキスト（リンク誘導文）"
}}

【重要】
指定された長さ（{length_desc}）に合わせて、各セクションの内容を十分な分量で書いてください。
長い動画の場合は、解決策を5〜7個に増やすなど、セクション数も増やしてください。"""

        content = self._call_llm(prompt, max_tokens=script_max_tokens)
        
        default = {
            "title": "台本生成エラー",
            "sections": [{"name": "エラー", "content": content[:500]}],
            "cta_text": ""
        }
        
        return self._parse_json_response(content, default)
