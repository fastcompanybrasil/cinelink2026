/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tv,
  FileCode,
  BookOpen,
  Settings,
  Download,
  Globe,
  MonitorPlay,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Table,
  Smartphone,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { DEFAULT_CATALOG } from './data/mockCatalog';
import { CatalogResponse, VideoItem } from './types';
import { AndroidTvSimulator } from './components/AndroidTvSimulator';
import { TvRemoteControl } from './components/TvRemoteControl';
import { CodeViewer } from './components/CodeViewer';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { CustomJsonModal } from './components/CustomJsonModal';
import { MinimalFeedPanel } from './components/MinimalFeedPanel';
import { convertGoogleSheetsUrlToCsvUrl, parseCsvToCatalog } from './utils/urlParser';
import { forceFetchThumbnail } from './utils/thumbnailExtractor';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');
  const [catalog, setCatalog] = useState<CatalogResponse>(() => {
    // Attempt local storage cache
    const saved = localStorage.getItem('tv_hub_catalog');
    if (saved) {
      try {
        const parsed: CatalogResponse = JSON.parse(saved);
        // Normalize Pornhub, XVideos, XNXX watch URLs to embed URLs
        const sanitizedCategories = parsed.categories.map((cat) => ({
          ...cat,
          items: cat.items.map((item) => {
            const phMatch = item.streamUrl.match(/pornhub\.com\/view_video\.php\?viewkey=([a-zA-Z0-9]+)/i);
            if (phMatch) {
              return {
                ...item,
                streamUrl: `https://www.pornhub.com/embed/${phMatch[1]}`,
                badge: 'EMBED'
              };
            }
            const xvMatch = item.streamUrl.match(/xvideos\.com\/(?:video\.([a-zA-Z0-9]+)|video([0-9]+))/i);
            if (xvMatch) {
              const videoId = xvMatch[1] || xvMatch[2];
              return {
                ...item,
                streamUrl: `https://www.xvideos.com/embedframe/${videoId}`,
                badge: 'EMBED'
              };
            }
            const xnxxMatch = item.streamUrl.match(/xnxx\.com\/(?:video-([a-zA-Z0-9]+)|video([0-9]+))/i);
            if (xnxxMatch) {
              const videoId = xnxxMatch[1] || xnxxMatch[2];
              return {
                ...item,
                streamUrl: `https://www.xnxx.com/embedframe/${videoId}`,
                badge: 'EMBED'
              };
            }
            return item;
          })
        }));
        return { categories: sanitizedCategories };
      } catch {}
    }
    return DEFAULT_CATALOG;
  });

  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [sheetsUrl, setSheetsUrl] = useState<string>(() => {
    return localStorage.getItem('tv_hub_sheets_url') || '';
  });
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<string | null>(null);
  const [isRefreshingThumbs, setIsRefreshingThumbs] = useState<boolean>(false);

  // D-Pad state for the TV simulator
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // Save catalog changes to localStorage for persistent mobile/TV session
  useEffect(() => {
    localStorage.setItem('tv_hub_catalog', JSON.stringify(catalog));
  }, [catalog]);

  // Method to update a video thumbnail
  const handleUpdateThumbnail = useCallback((itemId: string, newThumb: string) => {
    setCatalog((prev) => ({
      categories: prev.categories.map((c) => ({
        ...c,
        items: c.items.map((it) => (it.id === itemId ? { ...it, thumbnailUrl: newThumb } : it))
      }))
    }));
  }, []);

  // Force refresh all thumbnails across the catalog
  const forceRefreshAllThumbnails = useCallback(async () => {
    setIsRefreshingThumbs(true);
    try {
      let hasUpdate = false;
      const updatedCategories = await Promise.all(
        catalog.categories.map(async (cat) => {
          const updatedItems = await Promise.all(
            cat.items.map(async (item) => {
              const realThumb = await forceFetchThumbnail(item.streamUrl, item.originalUrl);
              if (realThumb && realThumb !== item.thumbnailUrl) {
                hasUpdate = true;
                return { ...item, thumbnailUrl: realThumb };
              }
              return item;
            })
          );
          return { ...cat, items: updatedItems };
        })
      );
      if (hasUpdate) {
        setCatalog({ categories: updatedCategories });
      }
    } finally {
      setIsRefreshingThumbs(false);
    }
  }, [catalog]);

  // Auto-resolve real thumbnails on mount / when videos change
  useEffect(() => {
    let isCancelled = false;

    const autoResolve = async () => {
      let hasUpdate = false;
      const updatedCategories = await Promise.all(
        catalog.categories.map(async (cat) => {
          const updatedItems = await Promise.all(
            cat.items.map(async (item) => {
              const isGeneric =
                !item.thumbnailUrl ||
                item.thumbnailUrl.includes('images.unsplash.com') ||
                item.thumbnailUrl.includes('placeholder');

              if (isGeneric) {
                const realThumb = await forceFetchThumbnail(item.streamUrl, item.originalUrl);
                if (realThumb && realThumb !== item.thumbnailUrl) {
                  hasUpdate = true;
                  return { ...item, thumbnailUrl: realThumb };
                }
              }
              return item;
            })
          );
          return { ...cat, items: updatedItems };
        })
      );

      if (hasUpdate && !isCancelled) {
        setCatalog({ categories: updatedCategories });
      }
    };

    autoResolve();

    return () => {
      isCancelled = true;
    };
  }, [catalog.categories.length]);

  // Method to add video directly from mobile URL input
  const handleAddVideo = (item: VideoItem, categoryTitle: string) => {
    setCatalog((prev) => {
      const existingCatIdx = prev.categories.findIndex(
        (c) => c.title.toLowerCase() === categoryTitle.toLowerCase()
      );

      let updatedCategories = [...prev.categories];

      if (existingCatIdx >= 0) {
        // Prepend video to make newly added visible first
        const updatedCategory = {
          ...updatedCategories[existingCatIdx],
          items: [item, ...updatedCategories[existingCatIdx].items]
        };
        updatedCategories[existingCatIdx] = updatedCategory;
        setActiveCategoryIndex(existingCatIdx);
        setActiveItemIndex(0);
      } else {
        // Create new category at the top
        const newCat = {
          id: 'cat_' + Date.now(),
          title: categoryTitle,
          items: [item]
        };
        updatedCategories = [newCat, ...updatedCategories];
        setActiveCategoryIndex(0);
        setActiveItemIndex(0);
      }

      return { categories: updatedCategories };
    });

    // Automatically force fetch thumbnail for the newly added video
    forceFetchThumbnail(item.streamUrl, item.originalUrl).then((realThumb) => {
      if (realThumb) {
        handleUpdateThumbnail(item.id, realThumb);
      }
    });
  };

  // Method to remove a video
  const handleRemoveItem = (itemId: string) => {
    setCatalog((prev) => {
      const updatedCategories = prev.categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId)
        }))
        .filter((cat) => cat.items.length > 0);

      return { categories: updatedCategories };
    });
  };

  // Sync Google Sheets public CSV
  const syncGoogleSheets = useCallback(
    async (urlToFetch: string) => {
      if (!urlToFetch.trim()) return;
      try {
        setIsSyncingSheets(true);
        setSheetsSyncStatus('Sincronizando com o Google Sheets...');

        const csvExportUrl = convertGoogleSheetsUrlToCsvUrl(urlToFetch);
        const res = await fetch(csvExportUrl);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Planilha não acessível publicamente`);
        }
        const csvText = await res.text();
        const parsed = parseCsvToCatalog(csvText);

        if (parsed.categories.length === 0) {
          throw new Error('Nenhuma URL de vídeo encontrada na Coluna A da planilha.');
        }

        // Merge or replace
        setCatalog(parsed);
        setActiveCategoryIndex(0);
        setActiveItemIndex(0);
        const total = parsed.categories.reduce((acc: number, c) => acc + c.items.length, 0);
        setSheetsSyncStatus(`Sincronizado! ${total} vídeos carregados da planilha.`);
        localStorage.setItem('tv_hub_sheets_url', urlToFetch);
      } catch (err: any) {
        console.error('Sheets sync error:', err);
        setSheetsSyncStatus(
          `Falha: ${err.message || 'Verifique se a planilha está pública (Qualquer pessoa com o link).'}`
        );
      } finally {
        setIsSyncingSheets(false);
      }
    },
    []
  );

  const handleSaveSheetsUrl = (url: string) => {
    setSheetsUrl(url);
    syncGoogleSheets(url);
  };

  // Navigation handlers from the D-Pad remote widget
  const handleRemoteUp = () => {
    if (activeCategoryIndex > 0) {
      const nextCat = catalog.categories[activeCategoryIndex - 1];
      const nextItemIdx = Math.min(activeItemIndex, (nextCat?.items.length || 1) - 1);
      setActiveCategoryIndex(activeCategoryIndex - 1);
      setActiveItemIndex(nextItemIdx);
    }
  };

  const handleRemoteDown = () => {
    if (activeCategoryIndex < catalog.categories.length - 1) {
      const nextCat = catalog.categories[activeCategoryIndex + 1];
      const nextItemIdx = Math.min(activeItemIndex, (nextCat?.items.length || 1) - 1);
      setActiveCategoryIndex(activeCategoryIndex + 1);
      setActiveItemIndex(nextItemIdx);
    }
  };

  const handleRemoteLeft = () => {
    if (activeItemIndex > 0) {
      setActiveItemIndex(activeItemIndex - 1);
    }
  };

  const handleRemoteRight = () => {
    const curItems = catalog.categories[activeCategoryIndex]?.items || [];
    if (activeItemIndex < curItems.length - 1) {
      setActiveItemIndex(activeItemIndex + 1);
    }
  };

  const handleRemoteSelect = () => {
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    window.dispatchEvent(enterEvent);
  };

  const handleRemoteBack = () => {
    const backEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    window.dispatchEvent(backEvent);
  };

  const handleRemoteHome = () => {
    setActiveCategoryIndex(0);
    setActiveItemIndex(0);
    handleRemoteBack();
  };

  const handleRemotePlayPause = () => {
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    window.dispatchEvent(spaceEvent);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Application Bar (Ultra Minimal & Focused) */}
      <header className="sticky top-0 z-40 bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/30">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  CINELINK
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  Google TV &bull; Web Stream
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Alimente por links da Web ou Google Sheets &bull; Reproduza na TV
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#141824] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>TV &amp; Celular</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código Kotlin TV</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'guide'
                  ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guia Sheets &amp; TV</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={forceRefreshAllThumbnails}
              disabled={isRefreshingThumbs}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161c28] hover:bg-[#1e2535] active:scale-95 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/60 transition disabled:opacity-50"
              title="Forçar extração e atualização de todas as capas/thumbnails reais dos vídeos"
            >
              <ImageIcon className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshingThumbs ? 'animate-spin' : ''}`} />
              <span>{isRefreshingThumbs ? 'Buscando Thumbs...' : 'Forçar Thumbs'}</span>
            </button>

            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161c28] hover:bg-[#1e2535] active:scale-95 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/60 transition"
              title="Ver JSON gerado para Retrofit / Endpoint"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON Raw</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5 flex flex-col gap-4">
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-4">
            {/* The Central Minimalist Input Feed: URL directly from mobile or Google Sheets */}
            <MinimalFeedPanel
              onAddVideo={handleAddVideo}
              onApplyCatalog={(newCat) => setCatalog(newCat)}
              currentSheetsUrl={sheetsUrl}
              onSaveSheetsUrl={handleSaveSheetsUrl}
              onRefreshSheets={() => syncGoogleSheets(sheetsUrl)}
              isSyncingSheets={isSyncingSheets}
              sheetsSyncStatus={sheetsSyncStatus}
              recentAddedCount={catalog.categories.reduce((acc, c) => acc + c.items.length, 0)}
            />

            {/* TV Screen Viewport & Remote Control side-by-side */}
            <div className="flex flex-col lg:flex-row items-start gap-5">
              <div className="flex-1 w-full min-w-0">
                <AndroidTvSimulator
                  catalog={catalog}
                  onOpenJsonModal={() => setIsJsonModalOpen(true)}
                  onSwitchToCodeTab={() => setActiveTab('code')}
                  activeCategoryIndex={activeCategoryIndex}
                  activeItemIndex={activeItemIndex}
                  onNavigate={(c, i) => {
                    setActiveCategoryIndex(c);
                    setActiveItemIndex(i);
                  }}
                  onSelectCurrent={handleRemoteSelect}
                  onRemoveItem={handleRemoveItem}
                  onUpdateThumbnail={handleUpdateThumbnail}
                />
              </div>

              {/* Virtual TV Remote Control */}
              <div className="hidden lg:flex flex-col items-center shrink-0">
                <TvRemoteControl
                  onUp={handleRemoteUp}
                  onDown={handleRemoteDown}
                  onLeft={handleRemoteLeft}
                  onRight={handleRemoteRight}
                  onSelect={handleRemoteSelect}
                  onBack={handleRemoteBack}
                  onHome={handleRemoteHome}
                  onPlayPause={handleRemotePlayPause}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 min-h-[700px] flex flex-col">
            <CodeViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="flex-1">
            <ArchitectureGuide />
          </div>
        )}
      </main>

      {/* JSON Customization Modal */}
      <CustomJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentCatalog={catalog}
        onApplyCatalog={(newCat) => setCatalog(newCat)}
      />
    </div>
  );
}
