const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  target_language: string;
  main_genre: string | null;
  keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: number;
  project_id: number;
  video_id: string;
  title: string;
  description: string | null;
  channel_title: string | null;
  published_at: string | null;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface VideoSearchRequest {
  query: string;
  max_results?: number;
  order?: 'viewCount' | 'relevance' | 'date' | 'rating';
  published_after?: string;
  published_before?: string;
  video_duration?: 'any' | 'short' | 'medium' | 'long';
}

export interface HealthStatus {
  status: string;
  app_name: string;
  debug: boolean;
  database: string;
}

export interface ApiKeyStatus {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
  youtube: boolean;
  current_provider: string;
}

// Health check
export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

// Settings API
export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
  const res = await fetch(`${API_BASE_URL}/api/settings/api-keys/status`);
  if (!res.ok) throw new Error('Failed to fetch API key status');
  return res.json();
}

export async function setApiKey(provider: string, apiKey: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/settings/api-keys/set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to set API key');
  }
}

export async function setLlmProvider(provider: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/settings/provider/set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to set provider');
  }
}

// Projects API
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE_URL}/api/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProject(id: number): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(data: {
  name: string;
  description?: string;
  target_language?: string;
  main_genre?: string;
  keywords?: string[];
}): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete project');
}

// Research API
export async function searchVideos(request: VideoSearchRequest): Promise<Video[]> {
  const res = await fetch(`${API_BASE_URL}/api/research/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to search videos');
  return res.json();
}

export async function importVideosToProject(
  projectId: number,
  request: VideoSearchRequest
): Promise<Video[]> {
  const res = await fetch(`${API_BASE_URL}/api/research/projects/${projectId}/videos/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to import videos');
  return res.json();
}

// Analysis API
export interface VideoAnalysis {
  id: number;
  video_id: number;
  summary: string | null;
  hooks: string[] | null;
  benefits: string[] | null;
  structure: string[] | null;
  target_audience: string | null;
  cta_pattern: string | null;
  score: number;
  created_at: string;
  updated_at: string;
}

export async function analyzeVideo(videoId: number, forceReanalyze: boolean = false): Promise<VideoAnalysis> {
  const res = await fetch(`${API_BASE_URL}/api/analysis/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId, force_reanalyze: forceReanalyze }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to analyze video');
  }
  return res.json();
}

export async function getVideoAnalysis(videoId: number): Promise<VideoAnalysis> {
  const res = await fetch(`${API_BASE_URL}/api/analysis/videos/${videoId}`);
  if (!res.ok) throw new Error('Failed to fetch analysis');
  return res.json();
}

// Script API
export interface ScriptSection {
  name: string;
  content: string;
}

export interface OfferInfo {
  lp_url?: string;
  offer_type?: string;
  offer_title?: string;
  target_audience?: string;
}

export interface Script {
  id: number;
  project_id: number;
  base_video_id: number | null;
  title: string;
  tone: string | null;
  length_type: string | null;
  sections: ScriptSection[];
  cta_text: string | null;
  offer_info: OfferInfo | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateScriptRequest {
  project_id: number;
  base_video_id?: number;
  base_video_ids?: number[];  // 複数動画（1-3本）を参考にする場合
  tone?: string;
  length_type?: string;
  offer?: OfferInfo;
  custom_topic?: string;
}

export async function generateScript(request: GenerateScriptRequest): Promise<Script> {
  const res = await fetch(`${API_BASE_URL}/api/scripts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to generate script');
  }
  return res.json();
}

export async function getScripts(projectId?: number): Promise<Script[]> {
  const url = projectId 
    ? `${API_BASE_URL}/api/scripts/?project_id=${projectId}`
    : `${API_BASE_URL}/api/scripts/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch scripts');
  return res.json();
}

export async function getScript(scriptId: number): Promise<Script> {
  const res = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`);
  if (!res.ok) throw new Error('Failed to fetch script');
  return res.json();
}

export async function updateScript(scriptId: number, data: Partial<Script>): Promise<Script> {
  const res = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update script');
  return res.json();
}

export async function deleteScript(scriptId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete script');
}

// Template API
export interface TemplateSection {
  name: string;
  duration?: string;
  description?: string;
  example?: string;
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  genre: string | null;
  target_length: string | null;
  sections: TemplateSection[];
  tone: string | null;
  tips: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreateRequest {
  name: string;
  description?: string;
  genre?: string;
  target_length?: string;
  sections: TemplateSection[];
  tone?: string;
  tips?: string;
  is_default?: number;
}

export async function getTemplates(genre?: string): Promise<Template[]> {
  const url = genre 
    ? `${API_BASE_URL}/api/templates/?genre=${encodeURIComponent(genre)}`
    : `${API_BASE_URL}/api/templates/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function getTemplate(templateId: number): Promise<Template> {
  const res = await fetch(`${API_BASE_URL}/api/templates/${templateId}`);
  if (!res.ok) throw new Error('Failed to fetch template');
  return res.json();
}

export async function createTemplate(data: TemplateCreateRequest): Promise<Template> {
  const res = await fetch(`${API_BASE_URL}/api/templates/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to create template');
  }
  return res.json();
}

export async function updateTemplate(templateId: number, data: Partial<TemplateCreateRequest>): Promise<Template> {
  const res = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

export async function deleteTemplate(templateId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete template');
}

export async function seedDefaultTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE_URL}/api/templates/seed-defaults`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed default templates');
  return res.json();
}

