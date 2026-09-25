export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  streamUrl: string;
  originalUrl?: string;
  description?: string;
  duration?: string;
  isLive?: boolean;
  year?: string;
  rating?: string;
  badge?: string;
}

export interface Category {
  id: string;
  title: string;
  items: VideoItem[];
}

export interface CatalogResponse {
  categories: Category[];
}

export interface AndroidProjectFile {
  path: string;
  name: string;
  category: 'gradle' | 'manifest' | 'res' | 'data' | 'viewmodel' | 'ui' | 'activity' | 'config';
  language: 'kotlin' | 'groovy' | 'xml' | 'json' | 'markdown';
  description: string;
  content: string;
}
