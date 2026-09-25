import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Globe,
  Lock,
  Tv,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { VideoItem } from '../types';

interface VideoPlayerViewProps {
  video: VideoItem;
  onBack: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ video, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOsd, setShowOsd] = useState<boolean>(true);
  const [streamType, setStreamType] = useState<'HLS' | 'DASH' | 'MP4' | 'EMBED'>('MP4');
  const [videoResolution, setVideoResolution] = useState<string>('Auto');

  // Custom Direct Stream Replacement (for bypass / unblock)
  const [directStreamInput, setDirectStreamInput] = useState<string>('');
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>(video.streamUrl);

  const osdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetOsdTimer = () => {
    setShowOsd(true);
    if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    osdTimeoutRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 4000);
  };

  useEffect(() => {
    resetOsdTimer();
    return () => {
      if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    };
  }, []);

  // Keyboard navigation for Android TV remote simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetOsdTimer();
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onBack();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seek(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seek(10);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, onBack]);

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + seconds, duration || 99999)
      );
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // 1. Identify URL types
  const isDirectHls = activeStreamUrl.includes('.m3u8');
  const isDirectDash = activeStreamUrl.includes('.mpd');
  const isDirectMp4 = activeStreamUrl.includes('.mp4') || activeStreamUrl.includes('.webm');

  // Check YouTube
  const ytMatch = activeStreamUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i
  );
  const ytVideoId = ytMatch ? ytMatch[1] : null;

  // Check Pornhub
  const phMatch = activeStreamUrl.match(/pornhub\.com\/embed\/([a-zA-Z0-9]+)/i) ||
                  activeStreamUrl.match(/pornhub\.com\/view_video\.php\?viewkey=([a-zA-Z0-9]+)/i);
  const phViewKey = phMatch ? phMatch[1] : null;

  // Check XVideos: converts /video.omabaft9877/... or /embedframe/omabaft9877
  const xvMatch = activeStreamUrl.match(/xvideos\.com\/embedframe\/([a-zA-Z0-9_-]+)/i) ||
                  activeStreamUrl.match(/xvideos\.com\/video\.?([a-zA-Z0-9_-]+)/i);
  const xvKey = xvMatch ? xvMatch[1] : null;

  // Check XNXX
  const xnxxMatch = activeStreamUrl.match(/xnxx\.com\/embedframe\/([a-zA-Z0-9_-]+)/i) ||
                    activeStreamUrl.match(/xnxx\.com\/video-([a-zA-Z0-9_-]+)/i);
  const xnxxKey = xnxxMatch ? xnxxMatch[1] : null;

  // Determine if it should be rendered in an embedded iframe player (for web portals)
  const isEmbedPlayer = Boolean(
    ytVideoId || 
    phViewKey || 
    xvKey ||
    xnxxKey ||
    activeStreamUrl.includes('embed') || 
    activeStreamUrl.includes('player.vimeo.com') ||
    video.badge === 'EMBED' ||
    video.badge === 'XVIDEOS' ||
    video.badge === 'XNXX' ||
    (!isDirectHls && !isDirectDash && !isDirectMp4 && activeStreamUrl.startsWith('http'))
  );

  let embedSrc = activeStreamUrl;
  if (ytVideoId) {
    embedSrc = `https://www.youtube.com/embed/${ytVideoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
  } else if (xvKey) {
    embedSrc = `https://www.xvideos.com/embedframe/${xvKey}`;
  } else if (xnxxKey) {
    embedSrc = `https://www.xnxx.com/embedframe/${xnxxKey}`;
  } else if (phViewKey) {
    embedSrc = `https://www.pornhub.com/embed/${phViewKey}`;
  }

  // Setup streaming playback (HLS / MP4 native)
  useEffect(() => {
    if (isEmbedPlayer) {
      setStreamType('EMBED');
      setIsBuffering(false);
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    setIsBuffering(true);
    setErrorMessage(null);

    if (isDirectHls) {
      setStreamType('HLS');
    } else if (isDirectDash) {
      setStreamType('DASH');
    } else {
      setStreamType('MP4');
    }

    if (isDirectHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30
      });
      hlsRef.current = hls;

      hls.loadSource(activeStreamUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        videoEl.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Autoplay unmuted blocked by browser policy, muting:', err);
          videoEl.muted = true;
          setIsMuted(true);
          videoEl.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level];
        if (level) {
          setVideoResolution(`${level.width}x${level.height} (${Math.round(level.bitrate / 1000)} kbps)`);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('Erro de rede ao carregar fragmento HLS (.ts/.m3u8). Tentando reconectar...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMessage('Erro de mídia de codec. Tentando recuperar playback...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage(`Falha irrecuperável de reprodução HLS: ${data.details}`);
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else {
      // Native HTML5 Video playback (for MP4 or Safari native HLS)
      videoEl.src = activeStreamUrl;
      videoEl.load();

      const handleCanPlay = () => {
        setIsBuffering(false);
        videoEl.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          videoEl.muted = true;
          setIsMuted(true);
          videoEl.play().catch(() => {});
        });
      };

      const handleLoadedMetadata = () => {
        if (videoEl.videoWidth && videoEl.videoHeight) {
          setVideoResolution(`${videoEl.videoWidth}x${videoEl.videoHeight}`);
        }
        setDuration(videoEl.duration || 0);
      };

      const handleError = () => {
        setErrorMessage('Não foi possível reproduzir este fluxo de mídia nativamente.');
      };

      videoEl.addEventListener('canplay', handleCanPlay);
      videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.addEventListener('error', handleError);

      return () => {
        videoEl.removeEventListener('canplay', handleCanPlay);
        videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoEl.removeEventListener('error', handleError);
      };
    }
  }, [activeStreamUrl, isEmbedPlayer, isDirectHls, isDirectDash]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none"
      onMouseMove={resetOsdTimer}
      onClick={resetOsdTimer}
    >
      {/* Video Content: Embedded Web Player or Native ExoPlayer/HLS */}
      {isEmbedPlayer ? (
        <div className="relative w-full h-full flex flex-col bg-black">
          <iframe
            src={embedSrc}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />

          {/* Quick open in browser link */}
          <div className="absolute top-16 right-6 z-20">
            <a
              href={video.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-black/90 text-cyan-300 hover:text-cyan-200 rounded-lg text-xs border border-cyan-800/50 backdrop-blur-md transition shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no Navegador</span>
            </a>
          </div>

          {/* Pornhub / Protected Embed Overlay Helper */}
          {phViewKey && (
            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
              <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Restrição de Incorporação no Navegador</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                        DRM / Política do Site
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 max-w-2xl leading-relaxed mt-0.5">
                      No <strong>APK instalado no Android TV</strong>, a WebView nativa com <code>setAcceptThirdPartyCookies</code> reproduz direto sem essa restrição.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://pt.pornhub.com/view_video.php?viewkey=${phViewKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Assistir no Site Original</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          className="w-full h-full object-contain"
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              if (!duration && videoRef.current.duration) {
                setDuration(videoRef.current.duration);
              }
            }
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Buffering Spinner for Native */}
      {isBuffering && !errorMessage && !isEmbedPlayer && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none z-20">
          <div className="w-14 h-14 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
          <p className="text-cyan-300 font-semibold tracking-wide text-sm bg-black/70 px-4 py-1.5 rounded-full border border-cyan-500/30">
            Buffering AndroidX Media3 (ExoPlayer)...
          </p>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 z-30">
          <div className="bg-red-950/80 border border-red-500/50 p-6 rounded-2xl max-w-lg text-center backdrop-blur-md">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Erro de Reprodução do Stream</h3>
            <p className="text-sm text-red-200 mb-4">{errorMessage}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                  setErrorMessage(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition"
              >
                <RefreshCw className="w-4 h-4" /> Recarregar Stream
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Voltar ao Catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header / OSD */}
      <div 
        className={`absolute top-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-20 ${
          showOsd ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              title="Voltar ao catálogo (Esc / Voltar)"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full backdrop-blur-md border border-white/20 transition group"
            >
              <ArrowLeft className="w-5 h-5 text-cyan-400 group-hover:-translate-x-1 transition" />
              <span className="text-sm font-semibold">Voltar (D-Pad Back)</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide drop-shadow-md">{video.title}</h2>
                {video.isLive && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                    <Radio className="w-3 h-3" /> AO VIVO
                  </span>
                )}
                {isEmbedPlayer && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Globe className="w-3 h-3" /> Web Embed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate max-w-xl drop-shadow">
                {video.description || 'Reprodução com suporte a fluxos HLS/MP4 e embeds web'}
              </p>
            </div>
          </div>

          {/* Stream Diagnostics Pill */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-black/60 border border-slate-700/60 rounded-xl backdrop-blur-md text-xs text-slate-300">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-700/40 rounded font-mono font-bold text-[11px]">
              {streamType}
            </span>
            <span className="font-mono text-slate-400">{videoResolution}</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ExoPlayer / Web
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls / OSD (for native video) */}
      {!isEmbedPlayer && (
        <div 
          className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-20 ${
            showOsd ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Timeline Bar (for non-live) */}
          {!video.isLive && (
            <div className="mb-4">
              <div 
                className="relative w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current && duration) {
                    videoRef.current.currentTime = pos * duration;
                  }
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition"
                title="Play / Pause (D-Pad Center)"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              {!video.isLive && (
                <>
                  <button
                    onClick={() => seek(-10)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-md transition"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => seek(10)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-md transition"
                  >
                    +10s
                  </button>
                </>
              )}

              <button
                onClick={toggleMute}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition"
                title="Mudo (M)"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden md:inline">
                D-Pad: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">→</kbd> Seek | <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">Enter</kbd> Play | <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">Esc</kbd> Voltar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
