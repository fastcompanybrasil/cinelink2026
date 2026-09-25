import { CatalogResponse } from '../types';

export const DEFAULT_CATALOG: CatalogResponse = {
  categories: [
    {
      id: "1",
      title: "Canais Ao Vivo",
      items: [
        {
          id: "101",
          title: "Stream de Teste (Mux Live HLS)",
          thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          description: "Feed de transmissão HLS de alta resolução para validação de reprodução contínua e latência reduzida.",
          duration: "AO VIVO",
          isLive: true,
          badge: "LIVE 4K"
        },
        {
          id: "102",
          title: "Big Buck Bunny (HLS Multi-Bitrate)",
          thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://test-streams.mux.dev/test_001/stream.m3u8",
          description: "Stream de teste HLS multi-bitrate adaptativo com áudio AAC estéreo para aferição de buffer e ABR.",
          duration: "10 min",
          isLive: false,
          badge: "HLS FHD"
        },
        {
          id: "103",
          title: "Tears of Steel (Sci-Fi HLS)",
          thumbnailUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
          description: "Clássico open-source em formato VFX cyberpunk com múltiplos fluxos de resolução e trilha cinematográfica.",
          duration: "12 min",
          isLive: false,
          badge: "1080p"
        }
      ]
    },
    {
      id: "2",
      title: "Filmes & Séries em Destaque",
      items: [
        {
          id: "201",
          title: "Sintel - A Jornada do Dragão",
          thumbnailUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
          description: "Uma guerreira solitária atravessa montanhas congeladas e desertos em busca de seu pequeno amigo dragão capturado.",
          duration: "15 min",
          year: "2024",
          rating: "14",
          badge: "HDR10"
        },
        {
          id: "202",
          title: "Tears of Steel (Original Master)",
          thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          description: "Em um futuro distópico em Amsterdã, um grupo de cientistas tenta reescrever o passado para salvar o planeta dos robôs.",
          duration: "12 min",
          year: "2023",
          rating: "12",
          badge: "Dolby 5.1"
        },
        {
          id: "203",
          title: "Big Buck Bunny (Full MP4)",
          thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          description: "Um dia tranquilo na floresta é interrompido por criaturas travessas até que o grande coelho decide dar uma lição.",
          duration: "9 min",
          year: "2022",
          rating: "Livre",
          badge: "60 FPS"
        },
        {
          id: "204",
          title: "Elephants Dream (Surreal CGI)",
          thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          description: "Dois personagens exploram uma colossal e infinita máquina de engrenagens e fios mecânicos com arquitetura surreal.",
          duration: "11 min",
          year: "2021",
          rating: "10",
          badge: "Sci-Fi"
        }
      ]
    },
    {
      id: "3",
      title: "Documentários e Natureza 4K",
      items: [
        {
          id: "301",
          title: "For Bigger Blazes (Natureza Selvagem)",
          thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          description: "Imagens espetaculares de cânions, florestas boreais e rios cristalinos capturados em super slow motion.",
          duration: "15s Demo",
          year: "2024",
          rating: "Livre",
          badge: "4K UHD"
        },
        {
          id: "302",
          title: "For Bigger Escapes (Viagens do Mundo)",
          thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          description: "Refúgios paradisíacos nos Alpes suíços e mares tropicais com fidelidade cromática cinematográfica.",
          duration: "15s Demo",
          year: "2024",
          rating: "Livre",
          badge: "OLED Ready"
        },
        {
          id: "303",
          title: "We Are Going on Bullrun",
          thumbnailUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
          description: "A adrenalina dos superesportivos acelerando através de rotas icônicas americanas.",
          duration: "47s Demo",
          year: "2023",
          rating: "Livre",
          badge: "Action"
        }
      ]
    }
  ]
};
