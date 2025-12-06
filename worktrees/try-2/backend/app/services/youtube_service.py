"""
YouTube Data API Service
"""
import re
from typing import List, Dict, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.config import settings


class YouTubeService:
    """YouTube Data API v3 wrapper"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize YouTube service

        Args:
            api_key: YouTube API key (defaults to settings.youtube_api_key)
        """
        self.api_key = api_key or settings.youtube_api_key
        if not self.api_key:
            raise ValueError("YouTube API key is required")

        self.youtube = build('youtube', 'v3', developerKey=self.api_key)

    def _parse_duration_to_seconds(self, duration: str) -> int:
        """ISO 8601 duration を秒数に変換"""
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
        if not match:
            return 0
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        return hours * 3600 + minutes * 60 + seconds

    def _filter_by_duration(self, videos: List[Dict], duration_filter: str) -> List[Dict]:
        """動画を長さでフィルタリング"""
        if duration_filter == 'any' or not duration_filter:
            return videos
        
        # フィルタ条件を定義（秒数）
        duration_ranges = {
            'short': (0, 300),           # 〜5分
            'medium': (300, 1200),       # 5〜20分
            'medium_long': (1200, 2400), # 20〜40分
            'long': (2400, 3600),        # 40〜60分
            'very_long': (3600, float('inf')),  # 60分〜
        }
        
        if duration_filter not in duration_ranges:
            return videos
        
        min_sec, max_sec = duration_ranges[duration_filter]
        
        filtered = []
        for video in videos:
            duration_sec = self._parse_duration_to_seconds(video['duration'])
            if min_sec <= duration_sec < max_sec:
                filtered.append(video)
        
        return filtered

    def search_videos(
        self,
        query: str,
        max_results: int = 10,
        order: str = "viewCount",
        published_after: Optional[str] = None,
        published_before: Optional[str] = None,
        video_duration: Optional[str] = None
    ) -> List[Dict]:
        """
        Search for videos on YouTube

        Args:
            query: Search query
            max_results: Maximum number of results (1-50)
            order: Sort order (relevance, date, rating, viewCount, title)
            published_after: RFC 3339 formatted date-time (e.g., "2024-01-01T00:00:00Z")
            published_before: RFC 3339 formatted date-time
            video_duration: any, short, medium, medium_long, long, very_long

        Returns:
            List of video dictionaries
        """
        try:
            # YouTube APIのdurationパラメータにマッピング
            api_duration_map = {
                'any': None,
                'short': 'short',        # 4分未満
                'medium': 'medium',      # 4-20分
                'medium_long': 'long',   # 20分以上（後でフィルタ）
                'long': 'long',          # 20分以上（後でフィルタ）
                'very_long': 'long',     # 20分以上（後でフィルタ）
            }
            
            api_duration = api_duration_map.get(video_duration)
            
            # より多くの結果を取得してフィルタリング後に必要数を返す
            fetch_multiplier = 3 if video_duration in ['medium_long', 'long', 'very_long'] else 1
            fetch_count = min(max_results * fetch_multiplier, 50)
            
            search_params = {
                'q': query,
                'part': 'id,snippet',
                'type': 'video',
                'maxResults': fetch_count,
                'order': order,
            }

            if published_after:
                search_params['publishedAfter'] = published_after
            if published_before:
                search_params['publishedBefore'] = published_before
            if api_duration:
                search_params['videoDuration'] = api_duration

            # Execute search
            search_response = self.youtube.search().list(**search_params).execute()

            # Get video IDs
            video_ids = [item['id']['videoId'] for item in search_response.get('items', [])]

            if not video_ids:
                return []

            # Get detailed video information
            videos_response = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=','.join(video_ids)
            ).execute()

            # Format results
            videos = []
            for item in videos_response.get('items', []):
                video = {
                    'video_id': item['id'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'channel_title': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'thumbnail_url': item['snippet']['thumbnails']['high']['url'],
                    'view_count': int(item['statistics'].get('viewCount', 0)),
                    'like_count': int(item['statistics'].get('likeCount', 0)),
                    'comment_count': int(item['statistics'].get('commentCount', 0)),
                    'duration': item['contentDetails']['duration'],
                    'tags': item['snippet'].get('tags', []),
                }
                videos.append(video)

            # カスタムフィルタリング（20〜40分、40〜60分、60分〜の場合）
            if video_duration in ['medium_long', 'long', 'very_long']:
                videos = self._filter_by_duration(videos, video_duration)
            
            # 必要な件数だけ返す
            return videos[:max_results]

        except HttpError as e:
            raise Exception(f"YouTube API error: {e}")

    def get_video_details(self, video_id: str) -> Optional[Dict]:
        """
        Get detailed information for a single video

        Args:
            video_id: YouTube video ID

        Returns:
            Video details dictionary
        """
        try:
            response = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=video_id
            ).execute()

            items = response.get('items', [])
            if not items:
                return None

            item = items[0]
            return {
                'video_id': item['id'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'channel_title': item['snippet']['channelTitle'],
                'published_at': item['snippet']['publishedAt'],
                'thumbnail_url': item['snippet']['thumbnails']['high']['url'],
                'view_count': int(item['statistics'].get('viewCount', 0)),
                'like_count': int(item['statistics'].get('likeCount', 0)),
                'comment_count': int(item['statistics'].get('commentCount', 0)),
                'duration': item['contentDetails']['duration'],
                'tags': item['snippet'].get('tags', []),
            }

        except HttpError as e:
            raise Exception(f"YouTube API error: {e}")
