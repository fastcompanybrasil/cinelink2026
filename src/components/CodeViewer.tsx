import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Search,
  FolderTree,
  FileCheck,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { ANDROID_FILES } from '../data/androidProjectFiles';
import { AndroidProjectFile } from '../types';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_FILES[2]); // Default to app/build.gradle.kts or CatalogScreen
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const filteredFiles = ANDROID_FILES.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Root files
      ANDROID_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add gradle wrapper properties for Android Studio
      zip.file(
        'gradle/wrapper/gradle-wrapper.properties',
        `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
`
      );

      // Add proguard rules
      zip.file(
        'app/proguard-rules.pro',
        `# ProGuard rules for Android TV Streaming Hub
-keepattributes *Annotation*
-keepclassmembers class * {
    @kotlinx.serialization.Serializable *;
}
-keep class com.streaming.tvhub.data.** { *; }
-keep class androidx.media3.** { *; }
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'CINELINK_AndroidTV_StreamingHub.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP project:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'kotlin':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/50';
      case 'xml':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50';
      case 'json':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50';
      case 'markdown':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/50';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e14] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Action Bar */}
      <div className="bg-[#121620] border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              CINELINK &bull; Arquivos do Projeto Android TV
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                {ANDROID_FILES.length} arquivos
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Código integral sem omissões pronto para compilar no Android Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Compactando...' : 'Baixar Projeto Completo (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left file tree + Right editor */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Sidebar: File Tree */}
        <div className="w-full md:w-80 bg-[#0e121a] border-r border-slate-800 flex flex-col shrink-0">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar arquivos..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#161b26] border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start gap-2.5 group ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold truncate text-slate-100">
                        {file.name}
                      </p>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-mono ${getLanguageColor(
                          file.language
                        )}`}
                      >
                        {file.language}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {file.path}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Area */}
        <div className="flex-1 flex flex-col bg-[#0b0e14] min-w-0 overflow-hidden">
          {/* File Header Bar */}
          <div className="bg-[#10141d] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                  {selectedFile.path}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {lines.length} linhas
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {selectedFile.description}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Copiar código para a área de transferência"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-[#090c12]">
            <div className="inline-block min-w-full">
              {lines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-slate-800/30 px-2 py-0.5 rounded group">
                  <span className="w-10 shrink-0 text-slate-600 group-hover:text-slate-400 text-right pr-4 select-none">
                    {idx + 1}
                  </span>
                  <pre className="text-slate-200 whitespace-pre font-mono flex-1 leading-5">
                    {line || ' '}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
