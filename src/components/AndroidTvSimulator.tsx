import React, { useState, useEffect, useRef } from 'react';
import { Play, Wifi, Sparkles, Tv, Maximize2, Radio, CheckCircle2, Trash2, Globe } from 'lucide-react';
import { CatalogResponse, VideoItem } from '../types';
import { VideoPlayerView } from './VideoPlayerView';
import { forceFetchThumbnail } from '../utils/thumbnailExtractor';

interface AndroidTvSimulatorProps {
  catalog: CatalogResponse;
  onOpenJsonModal: () => void;
  onSwitchToCodeTab: () => void;
  // External control from D-pad widget
  activeCategoryIndex: number;
  activeItemIndex: number;
  onNavigate: (catIdx: number, itemIdx: number) => void;
  onSelectCurrent: () => void;
  onRemoveItem?: (itemId: string) => void;
  onUpdateThumbnail?: (itemId: string, newThumb: string) => void;
}

export const AndroidTvSimulator: React.FC<AndroidTvSimulatorProps> = ({
  catalog,
  onOpenJsonModal,
  onSwitchToCodeTab,
  activeCategoryIndex,
  activeItemIndex,
  onNavigate,
  onSelectCurrent,
  onRemoveItem,
  onUpdateThumbnail,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('20:00');
  const containerRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const safeCatIndex = Math.min(activeCategoryIndex, Math.max(0, catalog.categories.length - 1));
  const currentCategory = catalog.categories[safeCatIndex] || catalog.categories[0];
  const safeItemIndex = Math.min(activeItemIndex, Math.max(0, (currentCategory?.items?.length || 1) - 1));
  const focusedItem = currentCategory?.items[safeItemIndex] || currentCategory?.items[0];

  // Auto scroll focused card into view inside the category row
  useEffect(() => {
    const cardEl = document.getElementById(`tv-card-${safeCatIndex}-${safeItemIndex}`);
    if (cardEl) {
      cardEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }

    const rowEl = document.getElementById(`tv-category-row-${safeCatIndex}`);
    if (rowEl) {
      rowEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [safeCatIndex, safeItemIndex]);

  // When focused item changes, force verify and fetch its real thumbnail if generic
  useEffect(() => {
    if (focusedItem) {
      const isGeneric = !focusedItem.thumbnailUrl || focusedItem.thumbnailUrl.includes('images.unsplash.com');
      if (isGeneric) {
        forceFetchThumbnail(focusedItem.streamUrl, focusedItem.originalUrl).then((thumb) => {
          if (thumb && thumb !== focusedItem.thumbnailUrl && onUpdateThumbnail) {
            onUpdateThumbnail(focusedItem.id, thumb);
          }
        });
      }
    }
  }, [focusedItem?.id, focusedItem?.streamUrl, focusedItem?.originalUrl, onUpdateThumbnail]);

  // Keyboard navigation for physical keyboard D-Pad simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If video player is open, let VideoPlayerView handle it
      if (selectedVideo) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (safeCatIndex > 0) {
          const nextCat = catalog.categories[safeCatIndex - 1];
          const nextItemIdx = Math.min(safeItemIndex, (nextCat?.items.length || 1) - 1);
          onNavigate(safeCatIndex - 1, nextItemIdx);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (safeCatIndex < catalog.categories.length - 1) {
          const nextCat = catalog.categories[safeCatIndex + 1];
          const nextItemIdx = Math.min(safeItemIndex, (nextCat?.items.length || 1) - 1);
          onNavigate(safeCatIndex + 1, nextItemIdx);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (safeItemIndex > 0) {
          onNavigate(safeCatIndex, safeItemIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const curItems = catalog.categories[safeCatIndex]?.items || [];
        if (safeItemIndex < curItems.length - 1) {
          onNavigate(safeCatIndex, safeItemIndex + 1);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedItem) {
          setSelectedVideo(focusedItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeCatIndex, safeItemIndex, catalog, focusedItem, selectedVideo, onNavigate]);

  const handleCardClick = (catIdx: number, itemIdx: number, item: VideoItem) => {
    onNavigate(catIdx, itemIdx);
    setSelectedVideo(item);
  };

  return (
    <div className="relative w-full aspect-video max-h-[82vh] bg-[#07090e] rounded-3xl overflow-hidden border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col font-sans select-none">
      {/* If Video is open, display full screen player */}
      {selectedVideo ? (
        <VideoPlayerView
          video={selectedVideo}
          onBack={() => setSelectedVideo(null)}
        />
      ) : (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden flex flex-col">
          {/* Top Status Bar (Google TV OS Style) */}
          <div className="absolute top-0 left-0 right-0 z-30 px-10 py-5 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Logo & Navigation Tabs */}
            <div className="flex items-center gap-6 pointer-events-auto">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30 text-white">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="font-black tracking-wider text-sm text-white">CINELINK</span>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/40">
                  Google TV
                </span>
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-300">
                <span className="text-white border-b-2 border-cyan-400 pb-0.5">Catálogo</span>
                <span className="hover:text-white transition cursor-pointer" onClick={onOpenJsonModal}>
                  API / Endpoint
                </span>
                <span className="hover:text-white transition cursor-pointer" onClick={onSwitchToCodeTab}>
                  Código Kotlin
                </span>
              </div>
            </div>

            {/* TV Status icons */}
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="font-mono text-slate-200">{currentTimeStr}</span>
              <Wifi className="w-4 h-4 text-slate-300" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-inner">
                TV
              </div>
            </div>
          </div>

          {/* Hero Backdrop (Updates when user focuses cards in TvLazyRow) */}
          <div className="relative w-full h-[50%] shrink-0 overflow-hidden bg-slate-950">
            {focusedItem?.thumbnailUrl && (
              <img
                key={focusedItem.id + focusedItem.thumbnailUrl}
                src={focusedItem.thumbnailUrl}
                alt={focusedItem.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover transition-all duration-700 opacity-60 scale-105"
              />
            )}

            {/* Radial & Linear gradient overlays for 10-foot readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/70 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/85 to-transparent w-3/4 pointer-events-none" />

            {/* Hero Information */}
            <div className="absolute bottom-6 left-10 lg:left-12 max-w-2xl z-20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase drop-shadow">
                  {catalog.categories[safeCatIndex]?.title || 'DESTAQUE'}
                </span>
                {focusedItem?.isLive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white flex items-center gap-1 animate-pulse shadow-md">
                    <Radio className="w-3 h-3" /> AO VIVO
                  </span>
                )}
                {focusedItem?.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/90 text-slate-200 border border-slate-700/60 backdrop-blur-sm">
                    {focusedItem.badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-1 mb-2">
                {focusedItem?.title || 'Selecione um título'}
              </h1>

              <p className="text-xs lg:text-sm text-slate-200 font-normal line-clamp-2 max-w-xl mb-4 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {focusedItem?.description ||
                  'Navegue entre as categorias horizontais e verticais usando o D-Pad do controle ou as setas do teclado. Pressione Enter para autoplay.'}
              </p>

              {/* Action Buttons for current hero */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => focusedItem && setSelectedVideo(focusedItem)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Assistir Agora (Enter)</span>
                </button>
                {onRemoveItem && focusedItem && (
                  <button
                    onClick={() => onRemoveItem(focusedItem.id)}
                    title="Remover vídeo adicionado"
                    className="p-2.5 bg-white/10 hover:bg-red-500/30 text-slate-400 hover:text-red-300 rounded-xl text-xs transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TvLazyColumn representation (Vertical List of Categories) */}
          <div className="relative flex-1 overflow-y-auto px-12 pb-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            {catalog.categories.map((cat, catIdx) => {
              const isCurrentRow = catIdx === safeCatIndex;
              return (
                <div
                  key={cat.id}
                  id={`tv-category-row-${catIdx}`}
                  className="space-y-3 transition-opacity duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm lg:text-base font-bold tracking-wide transition-colors ${
                      isCurrentRow ? 'text-white' : 'text-slate-400'
                    }`}>
                      {cat.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {cat.items.length} itens
                    </span>
                  </div>

                  {/* TvLazyRow representation (Horizontal scrolling row) */}
                  <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth">
                    {cat.items.map((item, itemIdx) => {
                      const isFocused = isCurrentRow && itemIdx === safeItemIndex;

                      return (
                        <div
                          key={item.id}
                          id={`tv-card-${catIdx}-${itemIdx}`}
                          onClick={() => handleCardClick(catIdx, itemIdx, item)}
                          onMouseEnter={() => onNavigate(catIdx, itemIdx)}
                          className={`group relative shrink-0 w-48 sm:w-56 aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-200 select-none ${
                            isFocused
                              ? 'scale-105 ring-4 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.65)] z-20'
                              : 'hover:scale-[1.02] opacity-80 hover:opacity-100 ring-1 ring-white/10'
                          }`}
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Gradient shadow on bottom */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {item.isLive ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white tracking-wider">
                                LIVE
                              </span>
                            ) : item.duration ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-slate-200 backdrop-blur-md">
                                {item.duration}
                              </span>
                            ) : null}
                          </div>

                          {/* Card Title */}
                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <p className="text-xs font-bold text-white truncate drop-shadow">
                              {item.title}
                            </p>
                          </div>

                          {/* Center Play Icon when focused */}
                          {isFocused && (
                            <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/30">
                              <div className="w-9 h-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/50 scale-100 animate-in fade-in zoom-in-75">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom D-Pad instruction hint bar */}
          <div className="bg-[#0e131d] border-t border-slate-800/80 px-8 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px] font-mono">↓</kbd>
                <span className="text-slate-400 ml-1">TvLazyColumn</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px] font-mono">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px] font-mono">→</kbd>
                <span className="text-slate-400 ml-1">TvLazyRow</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800/50 rounded text-[11px] font-mono">Enter / OK</kbd>
                <span className="text-slate-400 ml-1">Reproduzir</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado com Celular
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
