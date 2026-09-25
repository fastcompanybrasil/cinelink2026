import { CatalogResponse, VideoItem } from '../types';

const THUMB_CACHE_PREFIX = 'cinelink_thumb_';

/**
 * Gets cached thumbnail from localStorage if exists
 */
export function getCachedThumbnail(url: string): string | null {
  try {
    const key = THUMB_CACHE_PREFIX + btoa(url.trim()).slice(0, 32);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Saves thumbnail in localStorage cache
 */
export function setCachedThumbnail(url: string, thumbUrl: string): void {
  try {
    const key = THUMB_CACHE_PREFIX + btoa(url.trim()).slice(0, 32);
    localStorage.setItem(key, thumbUrl);
  } catch {}
}

/**
 * Forces extracting or resolving the real thumbnail for any given video URL or embed URL.
 */
export async function forceFetchThumbnail(videoUrl: string, originalUrl?: string): Promise<string | null> {
  const target = (originalUrl || videoUrl || '').trim();
  if (!target) return null;

  // 1. YouTube instant check (no API needed)
  const ytMatch = target.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    setCachedThumbnail(target, thumb);
    return thumb;
  }

  // 2. Check localStorage cache
  const cached = getCachedThumbnail(target);
  if (cached && !cached.includes('images.unsplash.com')) {
    return cached;
  }

  // 3. Try Vite server extraction API
  try {
    const res = await fetch(`/api/extract-thumbnail?url=${encodeURIComponent(target)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.thumbnailUrl) {
        setCachedThumbnail(target, data.thumbnailUrl);
        return data.thumbnailUrl;
      }
    }
  } catch (err) {
    console.warn('Extraction API request failed:', err);
  }

  // 4. Try target streamUrl if different
  if (videoUrl && videoUrl !== target) {
    try {
      const res = await fetch(`/api/extract-thumbnail?url=${encodeURIComponent(videoUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.thumbnailUrl) {
          setCachedThumbnail(target, data.thumbnailUrl);
          return data.thumbnailUrl;
        }
      }
    } catch {}
  }

  // 5. If it's a direct MP4/video link, try browser canvas snapshot
  if (target.match(/\.(mp4|webm|ogv)(\?|$)/i)) {
    try {
      const canvasThumb = await captureVideoFrame(target);
      if (canvasThumb) {
        setCachedThumbnail(target, canvasThumb);
        return canvasThumb;
      }
    } catch {}
  }

  return null;
}

/**
 * Captures a video frame from direct HTML5 video stream using offscreen Canvas
 */
export function captureVideoFrame(videoSrc: string): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoSrc;
    video.muted = true;
    video.preload = 'metadata';

    const cleanUp = () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const timeout = setTimeout(() => {
      cleanUp();
      resolve(null);
    }, 4000);

    video.onloadeddata = () => {
      video.currentTime = Math.min(2.0, (video.duration || 5) * 0.1);
    };

    video.onseeked = () => {
      try {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          cleanUp();
          resolve(dataUrl);
          return;
        }
      } catch {}
      cleanUp();
      resolve(null);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanUp();
      resolve(null);
    };

    video.load();
  });
}
