import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  ArrowLeft,
  Home,
  Play,
  Volume2,
  VolumeX,
  Tv,
  Power,
  Globe
} from 'lucide-react';

interface TvRemoteControlProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onPlayPause: () => void;
}

export const TvRemoteControl: React.FC<TvRemoteControlProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onSelect,
  onBack,
  onHome,
  onPlayPause
}) => {
  return (
    <div className="w-64 bg-gradient-to-b from-[#1c212c] to-[#0e1218] border border-slate-700/60 rounded-[38px] p-5 shadow-2xl flex flex-col items-center select-none text-slate-200">
      {/* Remote Top: Power & Mic / Brand */}
      <div className="w-full flex items-center justify-between px-3 pt-2 mb-4">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Globe className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
            CINELINK
          </span>
        </div>
        <button
          onClick={onHome}
          title="TV Power"
          className="w-7 h-7 rounded-full bg-red-950/60 border border-red-700/50 flex items-center justify-center text-red-400 hover:bg-red-900 transition"
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* D-PAD Wheel */}
      <div className="relative w-44 h-44 rounded-full bg-[#131720] border-2 border-slate-700/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center mb-6">
        {/* Up Button */}
        <button
          onClick={onUp}
          title="D-Pad Up (Cima)"
          className="absolute top-2 w-12 h-10 flex items-center justify-center text-slate-300 hover:text-cyan-400 active:scale-95 transition"
        >
          <ChevronUp className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Down Button */}
        <button
          onClick={onDown}
          title="D-Pad Down (Baixo)"
          className="absolute bottom-2 w-12 h-10 flex items-center justify-center text-slate-300 hover:text-cyan-400 active:scale-95 transition"
        >
          <ChevronDown className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Left Button */}
        <button
          onClick={onLeft}
          title="D-Pad Left (Esquerda)"
          className="absolute left-2 w-10 h-12 flex items-center justify-center text-slate-300 hover:text-cyan-400 active:scale-95 transition"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Right Button */}
        <button
          onClick={onRight}
          title="D-Pad Right (Direita)"
          className="absolute right-2 w-10 h-12 flex items-center justify-center text-slate-300 hover:text-cyan-400 active:scale-95 transition"
        >
          <ChevronRight className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Center Select / OK Button */}
        <button
          onClick={onSelect}
          title="D-Pad Center (OK / Selecionar)"
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/30 flex items-center justify-center text-xs tracking-wider active:scale-90 transition border border-cyan-300/40"
        >
          OK
        </button>
      </div>

      {/* Primary Action Buttons (Back, Home, Play) */}
      <div className="grid grid-cols-2 gap-3 w-full mb-4 px-2">
        <button
          onClick={onBack}
          title="Voltar (Back)"
          className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#232936] hover:bg-[#2c3445] active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow transition"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Voltar</span>
        </button>

        <button
          onClick={onHome}
          title="Início (Home)"
          className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#232936] hover:bg-[#2c3445] active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow transition"
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Início</span>
        </button>
      </div>

      {/* Play/Pause Button */}
      <div className="w-full px-2 mb-2">
        <button
          onClick={onPlayPause}
          title="Play / Pause"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-950 to-slate-800 hover:from-cyan-900 hover:to-slate-700 border border-cyan-800/40 active:scale-95 text-cyan-300 text-xs font-bold transition shadow"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play / Pause</span>
        </button>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 text-center tracking-wide">
        D-Pad Remoto Virtual
      </div>
    </div>
  );
};
