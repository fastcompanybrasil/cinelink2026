import type { Plugin } from 'vite';
import http from 'http';
import { URL } from 'url';

export function thumbnailApiPlugin(): Plugin {
  return {
    name: 'thumbnail-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const parsedUrl = new URL(req.url, 'http://localhost');

        // Route 1: Extract thumbnail from video/web URL
        if (parsedUrl.pathname === '/api/extract-thumbnail') {
          const targetUrl = parsedUrl.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
            return;
          }

          try {
            const thumbUrl = await resolveThumbnail(targetUrl);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, thumbnailUrl: thumbUrl }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Extraction failed' }));
          }
          return;
        }

        // Route 2: Image proxy with CORS header
        if (parsedUrl.pathname === '/api/proxy-image') {
          const imageUrl = parsedUrl.searchParams.get('url');
          if (!imageUrl) {
            res.statusCode = 400;
            res.end('Missing url');
            return;
          }

          try {
            const imgRes = await fetch(imageUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': imageUrl
              }
            });

            if (!imgRes.ok) {
              res.statusCode = imgRes.status;
              res.end('Failed to fetch image');
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=86400');

            const buffer = await imgRes.arrayBuffer();
            res.end(Buffer.from(buffer));
          } catch (err: any) {
            res.statusCode = 500;
            res.end('Proxy error: ' + err?.message);
          }
          return;
        }

        // Route 3: Fetch Google Sheets CSV with auto-redirect and permissive CORS
        if (parsedUrl.pathname === '/api/fetch-sheets-csv') {
          const sheetUrl = parsedUrl.searchParams.get('url');
          if (!sheetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
            return;
          }

          try {
            const csvResult = await fetchGoogleSheetsCsv(sheetUrl);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, csvText: csvResult }));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Failed to fetch sheets CSV' }));
          }
          return;
        }

        next();
      });
    }
  };
}

async function resolveThumbnail(rawUrl: string): Promise<string | null> {
  const url = rawUrl.trim();

  // 1. YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  // 2. XVideos
  if (url.includes('xvideos.com')) {
    // If it is embedframe or video link, try fetching the video page or embedframe
    let pageUrl = url;
    const keyMatch = url.match(/xvideos\.com\/embedframe\/([a-zA-Z0-9_-]+)/i);
    if (keyMatch) {
      pageUrl = `https://www.xvideos.com/video.${keyMatch[1]}/`;
    }

    try {
      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      // Match og:image
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) return ogMatch[1];

      // Match CDN poster or thumb
      const cdnMatch = html.match(/https:\/\/[a-zA-Z0-9.-]+\.xvideos-cdn\.com\/[^\s"']+\.(jpg|webp|jpeg)/i);
      if (cdnMatch && cdnMatch[0]) return cdnMatch[0];
    } catch {}

    // Fallback: try embedframe directly
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const cdnMatch = html.match(/https:\/\/[a-zA-Z0-9.-]+\.xvideos-cdn\.com\/[^\s"']+\.(jpg|webp|jpeg)/i);
      if (cdnMatch && cdnMatch[0]) return cdnMatch[0];
    } catch {}
  }

  // 3. Pornhub
  if (url.includes('pornhub.com')) {
    const phMatch = url.match(/pornhub\.com\/(?:view_video\.php\?viewkey=|embed\/)([a-zA-Z0-9]+)/i);
    const viewkey = phMatch ? phMatch[1] : '';
    const fetchUrl = viewkey ? `https://www.pornhub.com/view_video.php?viewkey=${viewkey}` : url;

    try {
      const res = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cookie': 'accessAgeDisclaimerPH=1; platform=pc'
        }
      });
      const html = await res.text();
      const phncdnMatch = html.match(/https:\/\/[a-zA-Z0-9._-]+\.phncdn\.com\/videos\/[^\s"']+\.jpg/i);
      if (phncdnMatch && phncdnMatch[0]) return phncdnMatch[0];

      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) return ogMatch[1];
    } catch {}
  }

  // 4. XNXX
  if (url.includes('xnxx.com')) {
    let pageUrl = url;
    const keyMatch = url.match(/xnxx\.com\/embedframe\/([a-zA-Z0-9_-]+)/i);
    if (keyMatch) {
      pageUrl = `https://www.xnxx.com/video-${keyMatch[1]}/`;
    }

    try {
      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) return ogMatch[1];

      const cdnMatch = html.match(/https:\/\/[a-zA-Z0-9.-]+\.xnxx-cdn\.com\/[^\s"']+\.(jpg|webp|jpeg)/i);
      if (cdnMatch && cdnMatch[0]) return cdnMatch[0];
    } catch {}
  }

  // 5. Vimeo
  if (url.includes('vimeo.com')) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail_url) return data.thumbnail_url;
      }
    } catch {}
  }

  // 6. Dailymotion
  if (url.includes('dailymotion.com')) {
    const dmMatch = url.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
    if (dmMatch) {
      try {
        const res = await fetch(`https://api.dailymotion.com/video/${dmMatch[1]}?fields=thumbnail_720_url,thumbnail_large_url`);
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail_720_url) return data.thumbnail_720_url;
          if (data.thumbnail_large_url) return data.thumbnail_large_url;
        }
      } catch {}
    }
  }

  // 7. General Webpage (OpenGraph og:image, twitter:image, image_src)
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) {
        let found = ogMatch[1];
        if (found.startsWith('//')) found = 'https:' + found;
        else if (found.startsWith('/')) {
          const parsed = new URL(url);
          found = `${parsed.origin}${found}`;
        }
        return found;
      }
    }
  } catch {}

  return null;
}

async function fetchGoogleSheetsCsv(rawUrl: string): Promise<string> {
  const trimmed = rawUrl.trim();
  const candidates: string[] = [];

  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch) {
    const docId = sheetMatch[1];
    const gidMatch = trimmed.match(/[#&]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    candidates.push(`https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv${gidParam}`);
    candidates.push(`https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`);
  }

  // Published to web format: /spreadsheets/d/e/.../pub
  if (trimmed.includes('/pubhtml') || trimmed.includes('/pub?')) {
    candidates.unshift(trimmed.replace(/\/pubhtml.*$/, '/pub?output=csv'));
  }

  candidates.push(trimmed);

  let lastError = '';
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow'
      });

      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        continue;
      }

      const text = await res.text();
      // Verify it's not a Google login page
      if (text.includes('accounts.google.com/ServiceLogin') || text.includes('ServiceLogin?service=wise')) {
        throw new Error('Planilha privada: No Google Sheets, clique em Compartilhar e mude o Acesso Geral para "Qualquer pessoa com o link".');
      }

      // Check if it looks like CSV or at least has lines
      if (text.trim().length > 0) {
        return text;
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
      if (lastError.includes('Planilha privada')) {
        throw e;
      }
    }
  }

  throw new Error(`Não foi possível baixar o CSV da planilha (${lastError}). Verifique o link e se o compartilhamento está público.`);
}
