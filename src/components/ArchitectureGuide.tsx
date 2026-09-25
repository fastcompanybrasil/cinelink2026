import React from 'react';
import {
  Tv,
  Table,
  Smartphone,
  FileCode2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="w-full bg-[#0b0e14] rounded-2xl border border-slate-800 p-6 sm:p-8 text-slate-300 space-y-8 select-none">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Integração Celular &bull; Google Sheets &bull; Android TV
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          CINELINK &bull; Como Alimentar o App de TV pelo Celular ou Google Sheets Pública
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Sem necessidade de banco de dados complexo ou autenticações lentas. Você insere links de páginas com vídeos ou streams diretos em uma planilha compartilhada e o app no Google TV consome o catálogo atualizado em tempo real.
        </p>
      </div>

      {/* Architecture Flow */}
      <div className="bg-[#10141f] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          Fluxo de Dados Unificado (Zero Fricção)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#161c2b] p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">1. Celular (Entrada)</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Você navega no celular, encontra um vídeo (HLS .m3u8, MP4, YouTube ou página de streaming) e joga a URL na planilha do Google Sheets ou cola na interface rápida.
            </p>
          </div>

          <div className="bg-[#161c2b] p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Table className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">2. Google Sheets Pública</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              A planilha atua como um <strong>CMS Gratuito e Imediato</strong>. Ao publicar como link de leitura, o Google gera um endpoint CSV em:
              <br />
              <code className="text-emerald-300 font-mono text-[10px]">/export?format=csv</code>
            </p>
          </div>

          <div className="bg-[#161c2b] p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Tv className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">3. Google TV / Android TV</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O app em Jetpack Compose busca a planilha ou endpoint REST via Retrofit/OkHttp, agrupa os vídeos por categoria em <code className="text-cyan-300 font-mono">TvLazyRow</code> e reproduz em tela cheia com AndroidX Media3 (ExoPlayer).
            </p>
          </div>
        </div>
      </div>

      {/* Sheet Structure Guide */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-400" />
          Estrutura Recomendada na Planilha Google Sheets
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#151a26] text-slate-200">
              <tr>
                <th className="p-3 border-b border-slate-700">Coluna A (Obrigatória)</th>
                <th className="p-3 border-b border-slate-700">Coluna B (Opcional)</th>
                <th className="p-3 border-b border-slate-700">Coluna C (Opcional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-[#0d1017] text-slate-300">
              <tr>
                <td className="p-3 text-cyan-300">URL do Vídeo / Stream</td>
                <td className="p-3 text-slate-400">Título / Nome</td>
                <td className="p-3 text-emerald-300">Categoria do Trilho TV</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400 text-[11px]">https://.../stream.m3u8</td>
                <td className="p-3 text-slate-400 text-[11px]">Canal Ao Vivo Notícias</td>
                <td className="p-3 text-slate-400 text-[11px]">Canais Ao Vivo</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400 text-[11px]">https://.../video.mp4</td>
                <td className="p-3 text-slate-400 text-[11px]">Documentário Espacial</td>
                <td className="p-3 text-slate-400 text-[11px]">Filmes &amp; Séries</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400 text-[11px]">https://youtube.com/watch?v=...</td>
                <td className="p-3 text-slate-400 text-[11px]">Vídeo do YouTube</td>
                <td className="p-3 text-slate-400 text-[11px]">YouTube Web</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kotlin Code snippet for Sheets CSV parser in Android */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-cyan-400" />
          Como o Android TV lê o Google Sheets CSV em Kotlin
        </h3>

        <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-5">
          <pre>{`// Na ViewModel do Android TV (MainViewModel.kt)
suspend fun fetchFromGoogleSheets(sheetUrl: String): CatalogResponse {
    // Transforma a URL de edição para a URL de exportação pública de CSV
    val docId = sheetUrl.substringAfter("/spreadsheets/d/").substringBefore("/")
    val csvUrl = "https://docs.google.com/spreadsheets/d/$docId/export?format=csv"
    
    val csvResponse = ApiClient.okHttpClient.newCall(
        Request.Builder().url(csvUrl).build()
    ).execute().body?.string() ?: return fallbackCatalog

    // Processa as linhas do CSV diretamente em categorias e VideoItems
    val lines = csvResponse.lines().drop(1) // Ignora cabeçalho
    val categoriesMap = mutableMapOf<String, MutableList<VideoItem>>()

    for (line in lines) {
        val cols = line.split(",")
        val url = cols.getOrNull(0)?.trim().orEmpty()
        val title = cols.getOrNull(1)?.trim() ?: "Vídeo da Planilha"
        val category = cols.getOrNull(2)?.trim() ?: "Geral"

        if (url.startsWith("http")) {
            val item = VideoItem(id = UUID.randomUUID().toString(), title = title, streamUrl = url, thumbnailUrl = ...)
            categoriesMap.getOrPut(category) { mutableListOf() }.add(item)
        }
    }

    return CatalogResponse(categories = categoriesMap.map { (cat, items) -> Category(cat, cat, items) })
}`}</pre>
        </div>
      </div>
    </div>
  );
};
