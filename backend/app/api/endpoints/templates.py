from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse

router = APIRouter()


@router.get("/", response_model=List[TemplateResponse])
async def get_templates(
    genre: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all templates, optionally filtered by genre.
    """
    query = select(Template)
    if genre:
        query = query.where(Template.genre == genre)
    query = query.order_by(Template.is_default.desc(), Template.created_at.desc())
    result = await db.execute(query.offset(skip).limit(limit))
    templates = result.scalars().all()
    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific template by ID.
    """
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template


@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: TemplateCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new template.
    """
    # Convert sections to dict format for JSON storage
    sections_data = [section.model_dump() for section in template_data.sections]
    
    template = Template(
        name=template_data.name,
        description=template_data.description,
        genre=template_data.genre,
        target_length=template_data.target_length,
        sections=sections_data,
        tone=template_data.tone,
        tips=template_data.tips,
        is_default=template_data.is_default or 0
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    template_data: TemplateUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing template.
    """
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    update_data = template_data.model_dump(exclude_unset=True)
    
    # Handle sections separately if provided
    if 'sections' in update_data and update_data['sections'] is not None:
        update_data['sections'] = [section.model_dump() if hasattr(section, 'model_dump') else section for section in update_data['sections']]
    
    for key, value in update_data.items():
        setattr(template, key, value)
    
    await db.commit()
    await db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a template.
    """
    template = await db.get(Template, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    await db.delete(template)
    await db.commit()
    return None


@router.post("/seed-defaults", response_model=List[TemplateResponse])
async def seed_default_templates(
    db: AsyncSession = Depends(get_db)
):
    """
    Seed default templates if none exist.
    """
    # Check if default templates already exist
    result = await db.execute(select(Template).where(Template.is_default == 1))
    existing = result.scalars().all()
    if existing:
        return existing
    
    # Create default templates
    default_templates = [
        {
            "name": "副業紹介動画（10分）",
            "description": "副業や稼ぎ方を紹介する定番構成",
            "genre": "副業・ビジネス",
            "target_length": "10min",
            "tone": "logical_and_casual",
            "is_default": 1,
            "sections": [
                {"name": "フック", "duration": "30秒", "description": "視聴者の興味を引く衝撃的な事実や質問"},
                {"name": "自己紹介", "duration": "30秒", "description": "簡潔な自己紹介と実績"},
                {"name": "問題提起", "duration": "1分", "description": "視聴者の悩みに共感"},
                {"name": "解決策の提示", "duration": "5分", "description": "メインコンテンツ（3つのポイントなど）"},
                {"name": "実践方法", "duration": "2分", "description": "具体的な始め方・ステップ"},
                {"name": "CTA", "duration": "1分", "description": "チャンネル登録・概要欄への誘導"}
            ],
            "tips": "最初の30秒で視聴者の心を掴むことが重要。具体的な数字を使うと説得力が増します。"
        },
        {
            "name": "ノウハウ解説動画（15分）",
            "description": "スキルや知識を詳しく解説する構成",
            "genre": "自己啓発・スキルアップ",
            "target_length": "15min",
            "tone": "professional",
            "is_default": 1,
            "sections": [
                {"name": "フック", "duration": "30秒", "description": "この動画で得られる価値を明確に"},
                {"name": "全体像", "duration": "1分", "description": "今日話す内容の概要"},
                {"name": "ポイント①", "duration": "3分", "description": "1つ目の重要ポイント"},
                {"name": "ポイント②", "duration": "3分", "description": "2つ目の重要ポイント"},
                {"name": "ポイント③", "duration": "3分", "description": "3つ目の重要ポイント"},
                {"name": "実践例", "duration": "2分", "description": "具体的な活用例"},
                {"name": "まとめ", "duration": "1分", "description": "重要ポイントの振り返り"},
                {"name": "CTA", "duration": "30秒", "description": "次のアクションへの誘導"}
            ],
            "tips": "各ポイントは具体例を交えて説明すると理解しやすくなります。"
        },
        {
            "name": "商品レビュー動画（8分）",
            "description": "商品やサービスのレビュー構成",
            "genre": "ライフスタイル・暮らし",
            "target_length": "10min",
            "tone": "friendly",
            "is_default": 1,
            "sections": [
                {"name": "フック", "duration": "20秒", "description": "結論を先に伝える"},
                {"name": "商品紹介", "duration": "1分", "description": "商品の基本情報"},
                {"name": "良い点", "duration": "2分", "description": "メリット・おすすめポイント"},
                {"name": "気になる点", "duration": "1分", "description": "デメリット・注意点"},
                {"name": "使用感", "duration": "2分", "description": "実際に使ってみた感想"},
                {"name": "おすすめの人", "duration": "1分", "description": "どんな人に向いているか"},
                {"name": "CTA", "duration": "30秒", "description": "購入リンク・関連動画への誘導"}
            ],
            "tips": "正直なレビューが信頼を生みます。デメリットも隠さず伝えましょう。"
        },
        {
            "name": "ショート動画（1分）",
            "description": "YouTube Shorts用の短尺構成",
            "genre": "全般",
            "target_length": "5min",
            "tone": "energetic",
            "is_default": 1,
            "sections": [
                {"name": "フック", "duration": "3秒", "description": "一言で興味を引く"},
                {"name": "本題", "duration": "40秒", "description": "1つのポイントを簡潔に"},
                {"name": "オチ・CTA", "duration": "10秒", "description": "印象的な締め"}
            ],
            "tips": "最初の1秒が勝負。テンポよく、1つのメッセージに絞りましょう。"
        },
        {
            "name": "ストーリー型動画（12分）",
            "description": "体験談・ストーリーで伝える構成",
            "genre": "メンタル・心理学",
            "target_length": "15min",
            "tone": "friendly",
            "is_default": 1,
            "sections": [
                {"name": "フック", "duration": "30秒", "description": "衝撃的なビフォー・アフター"},
                {"name": "過去の状況", "duration": "2分", "description": "以前の辛い状況"},
                {"name": "転機", "duration": "1分", "description": "何がきっかけで変わったか"},
                {"name": "実践したこと", "duration": "5分", "description": "具体的に何をしたか"},
                {"name": "結果", "duration": "2分", "description": "どう変わったか"},
                {"name": "視聴者へのメッセージ", "duration": "1分", "description": "励ましと共感"},
                {"name": "CTA", "duration": "30秒", "description": "コメント・登録への誘導"}
            ],
            "tips": "感情を込めて話すことで視聴者の心に響きます。"
        }
    ],
    
    created_templates = []
    for template_data in default_templates:
        template = Template(**template_data)
        db.add(template)
        created_templates.append(template)
    
    await db.commit()
    
    for template in created_templates:
        await db.refresh(template)
    
    return created_templates

