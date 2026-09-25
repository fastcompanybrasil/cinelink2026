import { CatalogResponse, VideoItem, Category } from '../types';
import { getCachedThumbnail } from './thumbnailExtractor';

/**
 * Extracts a usable video stream URL, embed URL or direct media URL from any user input.
 * Handles:
 * - XVideos: converts watch URLs like "/video.omabaft9877/..." or "/video12345/..." to "/embedframe/omabaft9877"
 *   (which is the official unblocked embed player allowed in iframes without X-Frame-Options SAMEORIGIN!)
 * - Direct video streams (.m3u8 HLS, .mpd DASH, .mp4, .webm)
 * - YouTube (embeds)
 * - Pornhub: converts watch page "view_video.php?viewkey=XXX" to clean embed "embed/XXX"
 * - Vimeo, Dailymotion, Twitch embeds
 * - Generic web pages with video
 */
export function parseVideoUrl(
  inputUrl: string,
  customTitle?: string,
  categoryName?: string,
  customThumbUrl?: string
): { item: VideoItem; categoryTitle: string } {
  const trimmed = inputUrl.trim();
  const id = 'v_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toLocaleDateString('pt-BR');
  const cachedThumb = customThumbUrl?.trim() || getCachedThumbnail(trimmed);

  // 1. Check XVideos (video.ID/... -> embedframe/ID)
  // Example: https://www.xvideos.com/video.omabaft9877/apaixonando-se... -> https://www.xvideos.com/embedframe/omabaft9877
  const xvMatch = trimmed.match(/xvideos\.com\/video\.?([a-zA-Z0-9_-]+)/i) ||
                  trimmed.match(/xvideos\.com\/embedframe\/([a-zA-Z0-9_-]+)/i);
  if (xvMatch) {
    const videoKey = xvMatch[1];
    const embedUrl = `https://www.xvideos.com/embedframe/${videoKey}`;

    // Clean up title from URL slug if not custom
    let cleanTitle = customTitle?.trim();
    if (!cleanTitle) {
      const slugMatch = trimmed.match(/xvideos\.com\/video\.?[a-zA-Z0-9_-]+\/([a-zA-Z0-9_-]+)/i);
      if (slugMatch) {
        cleanTitle = decodeURIComponent(slugMatch[1]).replace(/[-_]/g, ' ');
      } else {
        cleanTitle = `XVideos (${videoKey})`;
      }
    }

    return {
      categoryTitle: categoryName?.trim() || 'Vídeos Web / XVideos',
      item: {
        id,
        title: cleanTitle,
        thumbnailUrl: cachedThumb || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        streamUrl: embedUrl,
        originalUrl: trimmed,
        description: `Embed desprotegido direto do XVideos para a chave ${videoKey}. Adicionado em ${now}.`,
        duration: 'Embed Frame',
        badge: 'XVIDEOS'
      }
    };
  }

  // 2. Check XNXX (similar to XVideos: /video-ID/... -> /embedframe/ID)
  const xnxxMatch = trimmed.match(/xnxx\.com\/video-([a-zA-Z0-9_-]+)/i) ||
                    trimmed.match(/xnxx\.com\/embedframe\/([a-zA-Z0-9_-]+)/i);
  if (xnxxMatch) {
    const videoKey = xnxxMatch[1];
    const embedUrl = `https://www.xnxx.com/embedframe/${videoKey}`;
    return {
      categoryTitle: categoryName?.trim() || 'Vídeos Web / XNXX',
      item: {
        id,
        title: customTitle?.trim() || `XNXX (${videoKey})`,
        thumbnailUrl: cachedThumb || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        streamUrl: embedUrl,
        originalUrl: trimmed,
        description: `Embed direto do XNXX para a chave ${videoKey}. Adicionado em ${now}.`,
        duration: 'Embed Frame',
        badge: 'XNXX'
      }
    };
  }

  // 3. Check Pornhub (view_video.php?viewkey=XXXX -> embed/XXXX)
  const phMatch = trimmed.match(/pornhub\.com\/view_video\.php\?viewkey=([a-zA-Z0-9]+)/i) ||
                  trimmed.match(/pornhub\.com\/embed\/([a-zA-Z0-9]+)/i);
  if (phMatch) {
    const viewkey = phMatch[1];
    const embedUrl = `https://www.pornhub.com/embed/${viewkey}`;
    return {
      categoryTitle: categoryName?.trim() || 'Vídeos Web / Adulto',
      item: {
        id,
        title: customTitle?.trim() || `Pornhub Vídeo (${viewkey})`,
        thumbnailUrl: cachedThumb || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        streamUrl: embedUrl,
        originalUrl: trimmed,
        description: `Embed reprodutor web automático para viewkey ${viewkey}. Adicionado em ${now}.`,
        duration: 'Web Embed',
        badge: 'EMBED'
      }
    };
  }

  // 4. Check YouTube
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      categoryTitle: categoryName?.trim() || 'Vídeos Enviados do Celular',
      item: {
        id,
        title: customTitle?.trim() || `YouTube (${videoId})`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        streamUrl: trimmed,
        originalUrl: trimmed,
        description: `Adicionado via mobile em ${now}. Link: ${trimmed}`,
        duration: 'Online',
        badge: 'YouTube'
      }
    };
  }

  // 5. Check Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch) {
    const vimeoId = vimeoMatch[1];
    return {
      categoryTitle: categoryName?.trim() || 'Vimeo',
      item: {
        id,
        title: customTitle?.trim() || `Vimeo (${vimeoId})`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
        streamUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
        description: `Vimeo Player embed. Adicionado em ${now}.`,
        duration: 'Online',
        badge: 'Vimeo'
      }
    };
  }

  // 6. Check Dailymotion
  const dmMatch = trimmed.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/i);
  if (dmMatch) {
    const dmId = dmMatch[1];
    return {
      categoryTitle: categoryName?.trim() || 'Dailymotion',
      item: {
        id,
        title: customTitle?.trim() || `Dailymotion (${dmId})`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
        streamUrl: `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1`,
        description: `Dailymotion Embed. Adicionado em ${now}.`,
        duration: 'Online',
        badge: 'DailyMotion'
      }
    };
  }

  // 7. Direct streams (.m3u8, .mpd, .mp4)
  const isHls = trimmed.toLowerCase().includes('.m3u8');
  const isDash = trimmed.toLowerCase().includes('.mpd');
  const isMp4 = trimmed.toLowerCase().includes('.mp4') || trimmed.toLowerCase().includes('.webm');

  // Try to generate clean title
  let inferredTitle = customTitle?.trim();
  if (!inferredTitle) {
    try {
      const urlObj = new URL(trimmed);
      const pathname = urlObj.pathname;
      const lastSegment = pathname.split('/').filter(Boolean).pop() || '';
      inferredTitle = decodeURIComponent(lastSegment).replace(/[-_]/g, ' ') || urlObj.hostname;
    } catch {
      inferredTitle = 'Transmissão Adicionada';
    }
  }

  const defaultPoster = isHls
    ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80';

  const isEmbedOrWeb = !isHls && !isDash && !isMp4;

  return {
    categoryTitle: categoryName?.trim() || 'Vídeos Enviados do Celular',
    item: {
      id,
      title: inferredTitle,
      thumbnailUrl: cachedThumb || defaultPoster,
      streamUrl: trimmed,
      originalUrl: trimmed,
      description: `URL cadastrada pelo celular em ${now}. Tipo: ${isHls ? 'HLS Live' : isDash ? 'DASH' : isMp4 ? 'MP4 Direto' : 'Página Web / Embed'}.`,
      duration: isHls ? 'AO VIVO' : isEmbedOrWeb ? 'Web Embed' : 'Online',
      isLive: isHls,
      badge: isHls ? 'HLS' : isDash ? 'DASH' : isMp4 ? 'MP4' : 'WEB'
    }
  };
}

/**
 * Parses Google Sheets CSV / TSV / Public export.
 */
export function convertGoogleSheetsUrlToCsvUrl(sheetUrl: string): string {
  const trimmed = sheetUrl.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const docId = match[1];
    const gidMatch = trimmed.match(/[#&]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`;
  }
  return trimmed;
}

export function parseCsvToCatalog(csvText: string, existingCatalog?: CatalogResponse): CatalogResponse {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Build a lookup map of existing items to preserve resolved thumbnails
  const existingMap = new Map<string, VideoItem>();
  if (existingCatalog) {
    for (const cat of existingCatalog.categories) {
      for (const it of cat.items) {
        if (it.streamUrl) existingMap.set(it.streamUrl, it);
        if (it.originalUrl) existingMap.set(it.originalUrl, it);
      }
    }
  }

  const categoriesMap: { [catTitle: string]: VideoItem[] } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && (line.toLowerCase().includes('url') || line.toLowerCase().includes('link'))) {
      continue;
    }

    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes(';')) {
      parts = line.split(';');
    } else {
      parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    }

    const cleanParts = parts.map((p) => p.replace(/^"|"$/g, '').trim());
    const rawUrl = cleanParts[0];

    if (!rawUrl || !rawUrl.startsWith('http')) {
      continue;
    }

    const customTitle = cleanParts[1] || '';
    const customCategory = cleanParts[2] || 'Planilha Google Sheets';
    const customThumb = cleanParts[3] || '';

    const { item, categoryTitle } = parseVideoUrl(rawUrl, customTitle, customCategory, customThumb);

    // If an existing item already had its thumbnail resolved and no explicit thumb was in CSV, keep existing
    const existing = existingMap.get(item.streamUrl) || existingMap.get(item.originalUrl || '');
    if (existing && !customThumb) {
      if (existing.thumbnailUrl && !existing.thumbnailUrl.includes('placeholder')) {
        item.thumbnailUrl = existing.thumbnailUrl;
      }
      item.id = existing.id; // Keep stable ID
    }

    if (!categoriesMap[categoryTitle]) {
      categoriesMap[categoryTitle] = [];
    }
    categoriesMap[categoryTitle].push(item);
  }

  const categories: Category[] = Object.keys(categoriesMap).map((catTitle, idx) => ({
    id: `cat_sheet_${idx + 1}`,
    title: catTitle,
    items: categoriesMap[catTitle]
  }));

  return { categories };
}
