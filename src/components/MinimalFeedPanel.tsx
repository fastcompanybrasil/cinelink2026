import React, { useState } from 'react';
import {
  Send,
  Plus,
  Table,
  CheckCircle2,
  Sparkles,
  Link2,
  Smartphone,
  Tv,
  HelpCircle,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { parseVideoUrl, convertGoogleSheetsUrlToCsvUrl, parseCsvToCatalog } from '../utils/urlParser';
import { VideoItem, CatalogResponse } from '../types';

interface MinimalFeedPanelProps {
  onAddVideo: (item: VideoItem, categoryTitle: string) => void;
  onApplyCatalog: (catalog: CatalogResponse) => void;
  currentSheetsUrl: string;
  onSaveSheetsUrl: (url: string) => void;
  onRefreshSheets: () => void;
  isSyncingSheets: boolean;
  sheetsSyncStatus: string | null;
  recentAddedCount: number;
}

export const MinimalFeedPanel: React.FC<MinimalFeedPanelProps> = ({
  onAddVideo,
  onApplyCatalog,
  currentSheetsUrl,
  onSaveSheetsUrl,
  onRefreshSheets,
  isSyncingSheets,
  sheetsSyncStatus,
  recentAddedCount
}) => {
  const [activeMode, setActiveMode] = useState<'quick' | 'sheets'>('quick');

  // Quick URL Input
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputCategory, setInputCategory] = useState('');
  const [lastAddedMsg, setLastAddedMsg] = useState<string | null>(null);

  // Sheets setup
  const [sheetInput, setSheetInput] = useState(currentSheetsUrl || '');
  const [showGuide, setShowGuide] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const { item, categoryTitle } = parseVideoUrl(inputUrl, inputTitle, inputCategory);
    onAddVideo(item, categoryTitle);

    setLastAddedMsg(`"${item.title}" enviado para a TV!`);
    setInputUrl('');
    setInputTitle('');
    setTimeout(() => setLastAddedMsg(null), 3500);
  };

  const handleSaveSheets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;
    onSaveSheetsUrl(sheetInput.trim());
  };

  return (
    <div className="w-full bg-[#0d111a] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl select-none transition-all">
      {/* Header bar: Minimal switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Alimentador do Celular &rarr; TV
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                Ao Vivo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cole URLs de páginas ou use uma Google Sheets pública com atualização automática
            </p>
          </div>
        </div>

        {/* Tab switchers: Quick vs Google Sheets */}
        <div className="flex items-center gap-1 bg-[#141a26] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveMode('quick')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeMode === 'quick'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Colar URL do Celular</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('sheets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeMode === 'sheets'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Google Sheets Pública</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Quick Add URL from Mobile */}
      {activeMode === 'quick' && (
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <input
                type="url"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Cole a URL do vídeo (.m3u8, .mp4, YouTube, Pornhub, página web)..."
                className="w-full px-3.5 py-2.5 bg-[#141924] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
              />
            </div>

            <div className="sm:w-48">
              <input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                placeholder="Título opcional..."
                className="w-full px-3 py-2.5 bg-[#141924] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="sm:w-40">
              <input
                type="text"
                value={inputCategory}
                onChange={(e) => setInputCategory(e.target.value)}
                placeholder="Categoria (ex: Web)..."
                className="w-full px-3 py-2.5 bg-[#141924] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar para a TV</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500">Exemplos rápidos:</span>
              <button
                type="button"
                onClick={() => {
                  setInputUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
                  setInputTitle('Mux Live Stream');
                  setInputCategory('Ao Vivo');
                }}
                className="text-cyan-400 hover:underline"
              >
                HLS (.m3u8)
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => {
                  setInputUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
                  setInputTitle('Tears of Steel 4K');
                  setInputCategory('Filmes');
                }}
                className="text-cyan-400 hover:underline"
              >
                MP4 Direto
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => {
                  setInputUrl('https://pt.pornhub.com/view_video.php?viewkey=ph62adb81871336');
                  setInputTitle('Sloan Harper');
                  setInputCategory('Vídeos Web');
                }}
                className="text-amber-400 hover:underline"
              >
                Página Pornhub (Embed)
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => {
                  setInputUrl('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
                  setInputTitle('Big Buck Bunny 4K 60FPS');
                  setInputCategory('YouTube');
                }}
                className="text-cyan-400 hover:underline"
              >
                YouTube
              </button>
            </div>

            {lastAddedMsg && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> {lastAddedMsg}
              </span>
            )}
          </div>
        </form>
      )}

      {/* Mode 2: Google Sheets Live Sync */}
      {activeMode === 'sheets' && (
        <div className="space-y-3">
          <form onSubmit={handleSaveSheets} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="url"
                required
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="Link da sua planilha Google Sheets pública (https://docs.google.com/spreadsheets/d/.../edit)..."
                className="w-full px-3.5 py-2.5 bg-[#141924] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
              />
            </div>
            <button
              type="submit"
              disabled={isSyncingSheets}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition shrink-0 disabled:opacity-50"
            >
              {isSyncingSheets ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Table className="w-3.5 h-3.5" />
              )}
              <span>Conectar Planilha</span>
            </button>
            {currentSheetsUrl && (
              <button
                type="button"
                onClick={onRefreshSheets}
                disabled={isSyncingSheets}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition"
                title="Sincronizar novamente com o Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            )}
          </form>

          {/* Sheets Status & Instructions toggle */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              {sheetsSyncStatus ? (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {sheetsSyncStatus}
                </span>
              ) : (
                <span>Insira uma planilha pública com colunas: <strong>Coluna A (URL)</strong>, <strong>Coluna B (Título)</strong>, <strong>Coluna C (Categoria)</strong></span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{showGuide ? 'Ocultar instruções da Planilha' : 'Como configurar a Google Sheets?'}</span>
            </button>
          </div>

          {/* Expandable Mini Guide */}
          {showGuide && (
            <div className="p-3.5 bg-[#141a27] border border-cyan-800/40 rounded-xl text-xs text-slate-300 space-y-2 animate-in fade-in">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Como funciona a alimentação automática via Google Sheets:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  Crie uma planilha no Google Sheets pelo celular ou computador.
                </li>
                <li>
                  Organize as colunas: <strong>Coluna A = URL do Vídeo</strong>, <strong>Coluna B = Nome do Vídeo (opcional)</strong>, <strong>Coluna C = Categoria (ex: Canais, Filmes, Séries)</strong>.
                </li>
                <li>
                  Clique em <strong>Compartilhar</strong> &rarr; Mude para <strong>"Qualquer pessoa com o link pode ler"</strong>.
                </li>
                <li>
                  Cole o link aqui. O app do Android TV baixa o CSV público automaticamente e recarrega os trilhos sem precisar compilar nada!
                </li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
