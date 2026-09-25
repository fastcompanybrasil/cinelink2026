import React, { useState } from 'react';
import { X, Globe, Code, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { CatalogResponse } from '../types';

interface CustomJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCatalog: CatalogResponse;
  onApplyCatalog: (newCatalog: CatalogResponse) => void;
}

export const CustomJsonModal: React.FC<CustomJsonModalProps> = ({
  isOpen,
  onClose,
  currentCatalog,
  onApplyCatalog,
}) => {
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(currentCatalog, null, 2)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchUrl = async () => {
    if (!remoteUrl.trim()) {
      setError('Por favor informe uma URL válida.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(remoteUrl.trim());
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('O JSON retornado não contém o array "categories".');
      }
      setJsonText(JSON.stringify(data, null, 2));
      onApplyCatalog(data);
      setSuccessMsg('Catálogo remoto carregado e aplicado com sucesso!');
    } catch (err: any) {
      setError(err?.message || 'Falha ao buscar URL remota (verifique se há CORS).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyJsonText = () => {
    try {
      setError(null);
      setSuccessMsg(null);
      const parsed = JSON.parse(jsonText);
      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        throw new Error('A estrutura deve conter a chave "categories" com uma lista de categorias.');
      }
      onApplyCatalog(parsed);
      setSuccessMsg('JSON aplicado com sucesso no simulador!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError('Erro de sintaxe JSON: ' + (err?.message || 'JSON inválido'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#10141d] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configurar Endpoint JSON Remoto</h3>
              <p className="text-xs text-slate-400">
                Consuma dados do seu backend ou edite a estrutura em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Input */}
        <div className="py-4 space-y-3">
          <label className="text-xs font-semibold text-slate-300">
            URL Remota (ex: GitHub Raw, S3, Mockoon, API REST)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/usuario/repo/main/catalog.json"
              className="flex-1 px-3 py-2 bg-[#171c26] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleFetchUrl}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span>Carregar URL</span>
            </button>
          </div>
        </div>

        {/* JSON Editor */}
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>Editor de Carga JSON (Retrofit &amp; Kotlinx Serialization)</span>
            </label>
            <span className="text-[11px] text-slate-500">Formato estrito com "categories" e "items"</span>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="flex-1 w-full p-3 bg-[#0a0d13] border border-slate-800 rounded-xl font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-400 resize-none min-h-[200px]"
          />
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-3 p-3 bg-red-950/60 border border-red-700/60 rounded-xl flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleApplyJsonText}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            Aplicar JSON no Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
