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
  onDisconnectSheets: () => void;
  isSyncingSheets: boolean;
  sheetsSyncStatus: string | null;
  lastSyncTime: string | null;
  autoSyncEnabled: boolean;
  onToggleAutoSync: () => void;
  recentAddedCount: number;
}

export const MinimalFeedPanel: React.FC<MinimalFeedPanelProps> = ({
  onAddVideo,
  onApplyCatalog,
  currentSheetsUrl,
  onSaveSheetsUrl,
  onRefreshSheets,
  onDisconnectSheets,
  isSyncingSheets,
  sheetsSyncStatus,
  lastSyncTime,
  autoSyncEnabled,
  onToggleAutoSync,
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
          {currentSheetsUrl ? (
            /* Connected State View */
            <div className="p-3.5 bg-[#121824] border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Planilha Google Sheets Conectada
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    {recentAddedCount} vídeos no streaming
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Auto-Sync Toggle */}
                  <button
                    type="button"
                    onClick={onToggleAutoSync}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                      autoSyncEnabled
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title="Atualiza automaticamente novos vídeos inseridos na planilha a cada 20 segundos"
                  >
                    <RefreshCw className={`w-3 h-3 ${autoSyncEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                    <span>Auto-Sync: {autoSyncEnabled ? 'Ligado (20s)' : 'Pausado'}</span>
                  </button>

                  {/* Manual Refresh Now */}
                  <button
                    type="button"
                    onClick={onRefreshSheets}
                    disabled={isSyncingSheets}
                    className="flex items-center gap-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                    <span>Sincronizar Agora</span>
                  </button>

                  {/* Disconnect Sheet */}
                  <button
                    type="button"
                    onClick={onDisconnectSheets}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-950/50 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-800/40 rounded-lg text-xs transition"
                    title="Desconectar planilha e voltar ao catálogo padrão"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>

              {/* Status details & sheet URL */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div className="flex items-center gap-2 max-w-md truncate">
                  <Table className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a
                    href={currentSheetsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline truncate font-mono text-[11px] flex items-center gap-1"
                  >
                    <span className="truncate">{currentSheetsUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {sheetsSyncStatus && (
                  <span className="text-emerald-300 flex items-center gap-1 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {sheetsSyncStatus}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Input Form when not connected */
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
            </form>
          )}

          {/* Sheets Status & Instructions toggle */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              {!currentSheetsUrl && (
                sheetsSyncStatus ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {sheetsSyncStatus}
                  </span>
                ) : (
                  <span>Colunas suportadas: <strong>Col A (URL)</strong> &bull; <strong>Col B (Título)</strong> &bull; <strong>Col C (Categoria)</strong> &bull; <strong>Col D (Capa opcional)</strong></span>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-cyan-400 hover:underline flex items-center gap-1 ml-auto"
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
                  Organize as colunas:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-300">
                    <li><strong>Coluna A</strong>: URL do Vídeo (ex: link do XVideos, YouTube, .m3u8, MP4, etc.)</li>
                    <li><strong>Coluna B</strong>: Nome / Título do Vídeo (opcional)</li>
                    <li><strong>Coluna C</strong>: Categoria do Carrossel na TV (ex: Cuckold, Blonde, Filmes, Séries)</li>
                    <li><strong>Coluna D</strong>: Link de Capa / Thumbnail personalizada (opcional, o app extrai automaticamente se vazio)</li>
                  </ul>
                </li>
                <li>
                  Clique no botão <strong>Compartilhar</strong> no topo da planilha &rarr; Em <em>Acesso geral</em>, altere para <strong>"Qualquer pessoa com o link"</strong> como <strong>Leitor</strong>.
                </li>
                <li>
                  Cole o link aqui e clique em <strong>Conectar Planilha</strong>.
                </li>
                <li>
                  <strong>Atualização Automática (Auto-Sync)</strong>: A cada 20 segundos, o app verifica a planilha. Novos vídeos adicionados por você na planilha sobem imediatamente na TV Google sem precisar recarregar o navegador ou compilar código!
                </li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
