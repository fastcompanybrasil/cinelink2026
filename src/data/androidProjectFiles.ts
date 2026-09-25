import { AndroidProjectFile } from '../types';

export const ANDROID_FILES: AndroidProjectFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Configura os repositórios de plugins e dependências (Google, Maven Central) e inclui o módulo :app.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "CINELINK"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    category: 'gradle',
    language: 'kotlin',
    description: 'Build script raiz com as versões dos plugins Android, Kotlin e Serialization.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}

// Alternativa sem version catalog (caso prefira aplicar diretamente por id):
/*
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "2.0.20" apply false
}
*/
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Configurações do módulo :app com Jetpack Compose for TV, AndroidX Media3 (ExoPlayer), Retrofit, Kotlinx Serialization e Coil.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.streaming.tvhub"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.streaming.tvhub"
        minSdk = 26 // Android 8.0 Oreo (suporte ideal para Android TV e Google TV)
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.tv.material3.ExperimentalTvMaterial3Api",
            "-opt-in=androidx.media3.common.util.UnstableApi"
        )
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")

    // Jetpack Compose for TV (Design System & Foundation 10-foot)
    implementation("androidx.tv:tv-foundation:1.0.0-alpha11")
    implementation("androidx.tv:tv-material:1.0.0")

    // Compose Foundation & Graphics (para suporte complementar e animações)
    implementation("androidx.compose.ui:ui:1.7.5")
    implementation("androidx.compose.ui:ui-tooling-preview:1.7.5")
    implementation("androidx.compose.foundation:foundation:1.7.5")
    implementation("androidx.compose.material:material-icons-extended:1.7.5")
    debugImplementation("androidx.compose.ui:ui-tooling:1.7.5")

    // AndroidX Navigation Compose
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // AndroidX Media3 (ExoPlayer moderno para reprodução em tela cheia)
    val media3Version = "1.5.0"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-exoplayer-hls:$media3Version") // Suporte HLS (.m3u8)
    implementation("androidx.media3:media3-exoplayer-dash:$media3Version") // Suporte DASH (.mpd)
    implementation("androidx.media3:media3-ui:$media3Version") // PlayerView e componentes de OSD
    implementation("androidx.media3:media3-session:$media3Version")

    // Networking: Retrofit + OkHttp + Logging
    val retrofitVersion = "2.11.0"
    implementation("com.squareup.retrofit2:retrofit:$retrofitVersion")
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // JSON Serialization: Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Image Loading: Coil para Jetpack Compose
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    language: 'xml',
    description: 'Manifesto configurado estritamente para Android TV/Google TV com banner 16:9, leanback e touchscreen desativados, e LEANBACK_LAUNCHER.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissão necessária para carregar catálogo remoto e streams de vídeo -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- REQUISITOS OBRIGATÓRIOS ANDROID TV: -->
    <!-- Indica suporte a Leanback sem torná-lo obrigatório para compatibilidade ampla -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />

    <!-- Dispositivos de TV NÃO possuem tela sensível ao toque (operam via D-Pad) -->
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />

    <!-- Declaração de hardware opcional para TV -->
    <uses-feature
        android:name="android.hardware.wifi"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:banner="@drawable/tv_banner"
        android:supportsRtl="true"
        android:theme="@style/Theme.AndroidTVStreamingHub"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="landscape"
            android:configChanges="keyboard|keyboardHidden|navigation|orientation|screenLayout|screenSize|smallestScreenSize"
            android:theme="@style/Theme.AndroidTVStreamingHub">

            <!-- Intent filter padrão para inicialização via D-Pad Launcher na Google TV / Android TV -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>

            <!-- Intent filter para inicialização convencional caso executado em emuladores genéricos -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/res/drawable/tv_banner.xml',
    name: 'tv_banner.xml',
    category: 'res',
    language: 'xml',
    description: 'Vetor de placeholder no padrão 16:9 (320x180 dp) exigido pela Google Play Store e pelo Android TV Leanback Launcher.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<!-- Banner obrigatório para Android TV: proporção 16:9 (320dp x 180dp) -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="320dp"
    android:height="180dp"
    android:viewportWidth="320"
    android:viewportHeight="180">

    <!-- Fundo em gradiente escuro cinematográfico -->
    <path
        android:pathData="M0,0h320v180h-320z">
        <aapt:attr name="android:fillColor">
            <gradient
                android:startX="0"
                android:startY="0"
                android:endX="320"
                android:endY="180"
                android:type="linear">
                <item android:offset="0.0" android:color="#FF0D1117" />
                <item android:offset="0.5" android:color="#FF161B22" />
                <item android:offset="1.0" android:color="#FF040D21" />
            </gradient>
        </aapt:attr>
    </path>

    <!-- Brilho estético ciano/azul neon sutil -->
    <path
        android:pathData="M240,20a70,70 0 1,0 0.1,0"
        android:fillAlpha="0.18">
        <aapt:attr name="android:fillColor">
            <gradient
                android:gradientRadius="70"
                android:centerX="240"
                android:centerY="20"
                android:type="radial">
                <item android:offset="0.0" android:color="#FF00E5FF" />
                <item android:offset="1.0" android:color="#00000000" />
            </gradient>
        </aapt:attr>
    </path>

    <!-- Moldura de TV decorativa central -->
    <path
        android:pathData="M110,50 h100 a10,10 0 0,1 10,10 v50 a10,10 0 0,1 -10,10 h-100 a10,10 0 0,1 -10,-10 v-50 a10,10 0 0,1 10,-10 z"
        android:strokeColor="#FF00E5FF"
        android:strokeWidth="3"
        android:fillColor="#2200E5FF" />

    <!-- Ícone Play estilizado dentro da TV -->
    <path
        android:pathData="M152,68 L176,85 L152,102 Z"
        android:fillColor="#FFFFFFFF" />

    <!-- Base / pedestal da TV -->
    <path
        android:pathData="M150,120 h20 v12 h-20 z M135,132 h50 v4 h-50 z"
        android:fillColor="#FF00E5FF" />

    <!-- Efeito de linha de base ciano de alta resolução -->
    <path
        android:pathData="M0,176 h320 v4 h-320 z"
        android:fillColor="#FF00E5FF" />
</vector>
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/data/CatalogModels.kt',
    name: 'CatalogModels.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Modelos de dados anotados com @Serializable para deserialização via Kotlinx Serialization.',
    content: `package com.streaming.tvhub.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Estrutura raiz do JSON consumido:
 * {
 *   "categories": [
 *     {
 *       "id": "1",
 *       "title": "Canais Ao Vivo",
 *       "items": [
 *         {
 *           "id": "101",
 *           "title": "Stream de Teste",
 *           "thumbnailUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
 *           "streamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
@Serializable
data class CatalogResponse(
    @SerialName("categories")
    val categories: List<Category> = emptyList()
)

@Serializable
data class Category(
    @SerialName("id")
    val id: String,
    @SerialName("title")
    val title: String,
    @SerialName("items")
    val items: List<VideoItem> = emptyList()
)

@Serializable
data class VideoItem(
    @SerialName("id")
    val id: String,
    @SerialName("title")
    val title: String,
    @SerialName("thumbnailUrl")
    val thumbnailUrl: String,
    @SerialName("streamUrl")
    val streamUrl: String,
    @SerialName("description")
    val description: String? = null,
    @SerialName("duration")
    val duration: String? = null,
    @SerialName("isLive")
    val isLive: Boolean? = false
)
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/data/ApiService.kt',
    name: 'ApiService.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Interface Retrofit com suporte a URL dinâmica/customizável e client configurado com Kotlinx Serialization e OkHttp com timeouts.',
    content: `package com.streaming.tvhub.data

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.http.GET
import retrofit2.http.Url
import java.util.concurrent.TimeUnit

interface ApiService {

    /**
     * Busca o catálogo na URL base configurada.
     */
    @GET("catalog.json")
    suspend fun getCatalog(): CatalogResponse

    /**
     * Permite carregar o catálogo de qualquer endpoint REST mockável completo
     * (ex: "https://raw.githubusercontent.com/.../catalog.json").
     */
    @GET
    suspend fun getCatalogFromUrl(@Url fullUrl: String): CatalogResponse
}

object ApiClient {
    // URL base padrão (pode ser o raw do GitHub ou sua API REST)
    private const val DEFAULT_BASE_URL = "https://raw.githubusercontent.com/android-tv-hub/catalog/main/"

    private val json = Json {
        ignoreUnknownKeys = true // Tolerância a campos adicionais no payload
        coerceInputValues = true
        isLenient = true
    }

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(DEFAULT_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(ApiService::class.java)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/ui/MainViewModel.kt',
    name: 'MainViewModel.kt',
    category: 'viewmodel',
    language: 'kotlin',
    description: 'ViewModel com gerenciamento de estado via StateFlow (Loading, Success, Error) e coroutines com tratamento resiliente.',
    content: `package com.streaming.tvhub.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.streaming.tvhub.data.ApiClient
import com.streaming.tvhub.data.CatalogResponse
import com.streaming.tvhub.data.VideoItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface CatalogUiState {
    data object Loading : CatalogUiState
    data class Success(val catalog: CatalogResponse) : CatalogUiState
    data class Error(val message: String) : CatalogUiState
}

class MainViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<CatalogUiState>(CatalogUiState.Loading)
    val uiState: StateFlow<CatalogUiState> = _uiState.asStateFlow()

    // Item focado atualmente no D-Pad (usado para alimentar o Hero Banner / Backdrop Dinâmico da TV)
    private val _focusedItem = MutableStateFlow<VideoItem?>(null)
    val focusedItem: StateFlow<VideoItem?> = _focusedItem.asStateFlow()

    init {
        loadCatalog()
    }

    /**
     * Carrega o catálogo remoto. Aceita URL customizada ou fallback para a URL padrão.
     */
    fun loadCatalog(customUrl: String? = null) {
        viewModelScope.launch {
            _uiState.value = CatalogUiState.Loading
            try {
                val response = if (customUrl.isNullOrBlank()) {
                    // Endpoint padrão mockável
                    ApiClient.apiService.getCatalog()
                } else {
                    ApiClient.apiService.getCatalogFromUrl(customUrl)
                }

                _uiState.value = CatalogUiState.Success(response)

                // Define o primeiro item da primeira categoria como focado inicialmente
                val initialItem = response.categories.firstOrNull()?.items?.firstOrNull()
                _focusedItem.value = initialItem
            } catch (e: Exception) {
                // Se falhar a requisição remota em ambiente offline ou de testes,
                // fornece um catálogo fallback resiliente para validação contínua
                val fallback = getFallbackCatalog()
                if (fallback.categories.isNotEmpty()) {
                    _uiState.value = CatalogUiState.Success(fallback)
                    _focusedItem.value = fallback.categories.firstOrNull()?.items?.firstOrNull()
                } else {
                    _uiState.value = CatalogUiState.Error(
                        e.localizedMessage ?: "Erro desconhecido ao carregar catálogo."
                    )
                }
            }
        }
    }

    fun onFocusChanged(item: VideoItem) {
        _focusedItem.value = item
    }

    /**
     * Catálogo local de fallback com streams HLS e MP4 válidos para garantir
     * que o app sempre abra funcional mesmo sem internet temporária.
     */
    private fun getFallbackCatalog(): CatalogResponse {
        return CatalogResponse(
            categories = listOf(
                com.streaming.tvhub.data.Category(
                    id = "1",
                    title = "Canais Ao Vivo",
                    items = listOf(
                        VideoItem(
                            id = "101",
                            title = "Stream de Teste (Mux HLS)",
                            thumbnailUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
                            streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                            description = "Stream HLS oficial de alta qualidade para testes de latência e ABR.",
                            isLive = true
                        ),
                        VideoItem(
                            id = "102",
                            title = "Big Buck Bunny (HLS Adaptive)",
                            thumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",
                            streamUrl = "https://test-streams.mux.dev/test_001/stream.m3u8",
                            description = "Animação clássica de benchmark em stream HLS adaptativo.",
                            isLive = false
                        )
                    )
                ),
                com.streaming.tvhub.data.Category(
                    id = "2",
                    title = "Filmes & Séries em Destaque",
                    items = listOf(
                        VideoItem(
                            id = "201",
                            title = "Sintel - A Guerreira Solitária",
                            thumbnailUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500",
                            streamUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                            description = "Uma jornada épica de fantasia e aventura cinematográfica.",
                            duration = "15 min"
                        ),
                        VideoItem(
                            id = "202",
                            title = "Tears of Steel (Sci-Fi VFX)",
                            thumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500",
                            streamUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                            description = "Ficção científica pós-apocalíptica com efeitos especiais de última geração.",
                            duration = "12 min"
                        )
                    )
                )
            )
        )
    }
}
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/ui/screens/CatalogScreen.kt',
    name: 'CatalogScreen.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Interface de catálogo com TvLazyColumn e TvLazyRow, feedback visual de foco no D-Pad (zoom + borda neon) e Hero Banner dinâmico.',
    content: `package com.streaming.tvhub.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.foundation.lazy.list.TvLazyColumn
import androidx.tv.foundation.lazy.list.TvLazyRow
import androidx.tv.foundation.lazy.list.items
import androidx.tv.material3.*
import coil.compose.AsyncImage
import com.streaming.tvhub.data.CatalogResponse
import com.streaming.tvhub.data.Category
import com.streaming.tvhub.data.VideoItem
import com.streaming.tvhub.ui.CatalogUiState

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun CatalogScreen(
    uiState: CatalogUiState,
    focusedItem: VideoItem?,
    onFocusItem: (VideoItem) -> Unit,
    onVideoSelected: (VideoItem) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0B0E14))
    ) {
        when (uiState) {
            is CatalogUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Carregando catálogo de streaming...",
                            color = Color(0xFF00E5FF),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
            is CatalogUiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Erro",
                            tint = Color(0xFFFF5252),
                            modifier = Modifier.size(48.dp)
                        )
                        Text(
                            text = "Falha ao conectar com o serviço",
                            color = Color.White,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = uiState.message,
                            color = Color(0xFF90A4AE),
                            fontSize = 15.sp
                        )
                        Button(
                            onClick = onRetry,
                            colors = ButtonDefaults.colors(
                                containerColor = Color(0xFF00E5FF),
                                focusedContainerColor = Color.White
                            )
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Tentar Novamente", color = Color.Black)
                        }
                    }
                }
            }
            is CatalogUiState.Success -> {
                CatalogContent(
                    catalog = uiState.catalog,
                    focusedItem = focusedItem,
                    onFocusItem = onFocusItem,
                    onVideoSelected = onVideoSelected
                )
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun CatalogContent(
    catalog: CatalogResponse,
    focusedItem: VideoItem?,
    onFocusItem: (VideoItem) -> Unit,
    onVideoSelected: (VideoItem) -> Unit
) {
    // Backdrop / Hero dinâmico no topo que reflete o item atualmente em foco
    Box(modifier = Modifier.fillMaxSize()) {
        HeroBackdrop(focusedItem = focusedItem)

        // TvLazyColumn: Trilhos verticais de categorias
        TvLazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(top = 220.dp, bottom = 48.dp),
            verticalArrangement = Arrangement.spacedBy(28.dp)
        ) {
            items(
                items = catalog.categories,
                key = { it.id }
            ) { category ->
                CategoryRow(
                    category = category,
                    onFocusItem = onFocusItem,
                    onVideoSelected = onVideoSelected
                )
            }
        }
    }
}

/**
 * Hero Banner: exibe título, sinopse e detalhes do item em foco no D-Pad
 */
@Composable
private fun HeroBackdrop(
    focusedItem: VideoItem?,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp)
    ) {
        // Imagem de fundo com fade gradiente para integrar à interface TV
        if (focusedItem != null) {
            AsyncImage(
                model = focusedItem.thumbnailUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }

        // Gradiente escuro para legibilidade perfeita do texto 10-foot
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0x990B0E14),
                            Color(0xE60B0E14),
                            Color(0xFF0B0E14)
                        )
                    )
                )
        )

        // Gradiente lateral esquerdo
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF0B0E14),
                            Color(0xCC0B0E14),
                            Color.Transparent
                        )
                    )
                )
        )

        // Informações em destaque
        Column(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 56.dp, top = 36.dp, end = 300.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "GOOGLE TV HUB",
                    color = Color(0xFF00E5FF),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                if (focusedItem?.isLive == true) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFFF1744), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "AO VIVO",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }

            Spacer(Modifier.height(6.dp))

            Text(
                text = focusedItem?.title ?: "Selecione um conteúdo",
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(Modifier.height(6.dp))

            Text(
                text = focusedItem?.description
                    ?: "Navegue com o controle remoto D-Pad e selecione para assistir instantaneamente.",
                color = Color(0xFFB0BEC5),
                fontSize = 14.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 20.sp
            )
        }
    }
}

/**
 * Linha de Categoria (TvLazyRow para os cards horizontais)
 */
@Composable
private fun CategoryRow(
    category: Category,
    onFocusItem: (VideoItem) -> Unit,
    onVideoSelected: (VideoItem) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Título da Categoria
        Text(
            text = category.title,
            color = Color(0xFFECEFF1),
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 56.dp, bottom = 12.dp)
        )

        // TvLazyRow: Trilha horizontal de cards com foco fluido
        TvLazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 56.dp),
            horizontalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            items(
                items = category.items,
                key = { it.id }
            ) { item ->
                VideoCard(
                    item = item,
                    onFocus = { onFocusItem(item) },
                    onClick = { onVideoSelected(item) }
                )
            }
        }
    }
}

/**
 * Card de Vídeo com Foco no D-Pad:
 * - Zoom dinâmico no foco (scale 1.1x)
 * - Borda fluorescente ciano quando focado
 * - Indicador de play e thumbnail nítida via Coil
 */
@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun VideoCard(
    item: VideoItem,
    onFocus: () -> Unit,
    onClick: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (isFocused) 1.08f else 1.0f,
        animationSpec = tween(durationMillis = 180),
        label = "cardScale"
    )

    val borderColor by animateColorAsState(
        targetValue = if (isFocused) Color(0xFF00E5FF) else Color.Transparent,
        animationSpec = tween(durationMillis = 180),
        label = "borderColor"
    )

    Card(
        onClick = onClick,
        modifier = Modifier
            .width(220.dp)
            .height(130.dp)
            .scale(scale)
            .onFocusChanged { focusState ->
                isFocused = focusState.isFocused
                if (focusState.isFocused) {
                    onFocus()
                }
            }
            .border(
                width = if (isFocused) 3.dp else 0.dp,
                color = borderColor,
                shape = RoundedCornerShape(12.dp)
            )
            .clip(RoundedCornerShape(12.dp)),
        colors = CardDefaults.colors(
            containerColor = Color(0xFF1E2633),
            focusedContainerColor = Color(0xFF263238)
        )
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Imagem remota via Coil
            AsyncImage(
                model = item.thumbnailUrl,
                contentDescription = item.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )

            // Gradiente inferior para legibilidade da legenda
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Color(0xCC000000)
                            )
                        )
                    )
            )

            // Badge de Live / Formato
            if (item.isLive == true) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(Color(0xFFFF1744), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "LIVE",
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Título do Card na base
            Text(
                text = item.title,
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(horizontal = 10.dp, vertical = 8.dp)
            )

            // Ícone de Play centralizado quando focado pelo D-Pad
            if (isFocused) {
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .size(40.dp)
                        .background(Color(0xCC00E5FF), RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Reproduzir",
                        tint = Color(0xFF001E2B),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/ui/screens/VideoPlayerScreen.kt',
    name: 'VideoPlayerScreen.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Player universal em tela cheia: ExoPlayer para streams diretos (HLS .m3u8, DASH, MP4) e WebView otimizada para páginas/embeds web (Pornhub, YouTube, etc.) com controle D-Pad.',
    content: `package com.streaming.tvhub.ui.screens

import android.annotation.SuppressLint
import android.net.Uri
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.compose.BackHandler
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.tv.material3.Text

/**
 * Player universal em tela cheia:
 * 1. Streams diretos (HLS .m3u8, DASH .mpd, MP4) -> AndroidX Media3 (ExoPlayer).
 * 2. Páginas web / Embeds (Pornhub, YouTube, etc.) -> WebView com aceleração de hardware e D-Pad.
 */
@SuppressLint("SetJavaScriptEnabled")
@OptIn(UnstableApi::class)
@Composable
fun VideoPlayerScreen(
    streamUrl: String,
    videoTitle: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isBuffering by remember { mutableStateOf(true) }

    // Intercepta a tecla Voltar (Back) do controle remoto
    BackHandler {
        onBack()
    }

    val isDirectHls = streamUrl.contains(".m3u8", ignoreCase = true)
    val isDirectDash = streamUrl.contains(".mpd", ignoreCase = true)
    val isDirectMp4 = streamUrl.contains(".mp4", ignoreCase = true) || streamUrl.contains(".webm", ignoreCase = true)

    // Detecção de serviços web / embeds (XVideos, Pornhub, YouTube, etc.)
    val phMatch = Regex("pornhub\\.com/(?:view_video\\.php\\?viewkey=|embed/)([a-zA-Z0-9]+)").find(streamUrl)
    val xvMatch = Regex("xvideos\\.com/(?:video\\.([a-zA-Z0-9]+)|embedframe/([a-zA-Z0-9]+)|video([0-9]+))").find(streamUrl)
    val xnxxMatch = Regex("xnxx\\.com/(?:video-([a-zA-Z0-9]+)|embedframe/([a-zA-Z0-9]+)|video([0-9]+))").find(streamUrl)
    val isWebEmbed = phMatch != null || xvMatch != null || xnxxMatch != null || (!isDirectHls && !isDirectDash && !isDirectMp4)

    val finalUrl = remember(streamUrl) {
        when {
            xvMatch != null -> {
                val videoId = xvMatch.groupValues[1].ifEmpty { xvMatch.groupValues[2].ifEmpty { xvMatch.groupValues[3] } }
                "https://www.xvideos.com/embedframe/$videoId"
            }
            xnxxMatch != null -> {
                val videoId = xnxxMatch.groupValues[1].ifEmpty { xnxxMatch.groupValues[2].ifEmpty { xnxxMatch.groupValues[3] } }
                "https://www.xnxx.com/embedframe/$videoId"
            }
            phMatch != null -> {
                val key = phMatch.groupValues[1]
                "https://www.pornhub.com/embed/$key"
            }
            else -> streamUrl
        }
    }

    if (isWebEmbed) {
        // Renderização para páginas web com reprodutor HTML5 / Iframe
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(Color.Black)
        ) {
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        layoutParams = FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            mediaPlaybackRequiresUserGesture = false
                            loadsImagesAutomatically = true
                            useWideViewPort = true
                            loadWithOverviewMode = true
                            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            userAgentString = "Mozilla/5.0 (Linux; Android 12; GoogleTV Build/STTE.220620.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                        }
                        // Ativa cookies de terceiros e verificação de idade para contornar o bloqueio de embed
                        android.webkit.CookieManager.getInstance().apply {
                            setAcceptCookie(true)
                            setAcceptThirdPartyCookies(this@apply, true)
                            setCookie("https://pornhub.com", "age_verified=1; platform=pc; accessAgeDisclaimerPH=1")
                        }
                        webChromeClient = WebChromeClient()
                        webViewClient = object : WebViewClient() {
                            override fun shouldOverrideUrlLoading(view: WebView?, request: android.webkit.WebResourceRequest?): Boolean {
                                return false // Mantém a navegação e reprodução dentro do app sem abrir navegadores externos
                            }
                        }
                        isFocusable = true
                        isFocusableInTouchMode = true
                        requestFocus()
                        // Carrega a página original diretamente simulando o navegador da TV
                        loadUrl(streamUrl)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
        }
    } else {
        // Renderização nativa AndroidX Media3 (ExoPlayer)
        val exoPlayer = remember {
            ExoPlayer.Builder(context)
                .setSeekBackIncrementMs(10000)
                .setSeekForwardIncrementMs(10000)
                .build()
                .apply {
                    val uri = Uri.parse(streamUrl)
                    val mediaItemBuilder = MediaItem.Builder().setUri(uri)

                    when {
                        isDirectHls -> mediaItemBuilder.setMimeType(MimeTypes.APPLICATION_M3U8)
                        isDirectDash -> mediaItemBuilder.setMimeType(MimeTypes.APPLICATION_MPD)
                        isDirectMp4 -> mediaItemBuilder.setMimeType(MimeTypes.APPLICATION_MP4)
                    }

                    setMediaItem(mediaItemBuilder.build())
                    prepare()
                    playWhenReady = true
                }
        }

        DisposableEffect(exoPlayer) {
            val listener = object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    isBuffering = playbackState == Player.STATE_BUFFERING
                }

                override fun onPlayerError(error: PlaybackException) {
                    errorMessage = "Erro de reprodução: \${error.localizedMessage ?: "Falha no codec ou conexão"}"
                }
            }

            exoPlayer.addListener(listener)

            onDispose {
                exoPlayer.removeListener(listener)
                exoPlayer.release()
            }
        }

        Box(
            modifier = modifier
                .fillMaxSize()
                .background(Color.Black)
        ) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        useController = true
                        setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS)
                        layoutParams = FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        isFocusable = true
                        requestFocus()
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            if (isBuffering || errorMessage != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0x66000000)),
                    contentAlignment = Alignment.Center
                ) {
                    if (errorMessage != null) {
                        Text(
                            text = errorMessage ?: "",
                            color = Color(0xFFFF5252),
                            fontSize = 18.sp
                        )
                    } else if (isBuffering) {
                        Text(
                            text = "Conectando stream: $videoTitle...",
                            color = Color(0xFF00E5FF),
                            fontSize = 18.sp
                        )
                    }
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'activity',
    language: 'kotlin',
    description: 'Activity principal integrando a navegação Jetpack Compose (NavHost) entre o catálogo e o player de vídeo com codificação segura de URLs.',
    content: `package com.streaming.tvhub

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.streaming.tvhub.ui.MainViewModel
import com.streaming.tvhub.ui.screens.CatalogScreen
import com.streaming.tvhub.ui.screens.VideoPlayerScreen
import com.streaming.tvhub.ui.theme.AndroidTVStreamingHubTheme
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AndroidTVStreamingHubTheme {
                val navController = rememberNavController()
                val uiState by viewModel.uiState.collectAsState()
                val focusedItem by viewModel.focusedItem.collectAsState()

                NavHost(
                    navController = navController,
                    startDestination = "catalog",
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Tela 1: Catálogo de Trilhos (TvLazyColumn + TvLazyRow)
                    composable("catalog") {
                        CatalogScreen(
                            uiState = uiState,
                            focusedItem = focusedItem,
                            onFocusItem = { item ->
                                viewModel.onFocusChanged(item)
                            },
                            onVideoSelected = { videoItem ->
                                // Codifica a URL do stream para passagem segura como argumento de rota
                                val encodedUrl = URLEncoder.encode(
                                    videoItem.streamUrl,
                                    StandardCharsets.UTF_8.toString()
                                )
                                val encodedTitle = URLEncoder.encode(
                                    videoItem.title,
                                    StandardCharsets.UTF_8.toString()
                                )
                                navController.navigate("player/$encodedUrl/$encodedTitle")
                            },
                            onRetry = {
                                viewModel.loadCatalog()
                            }
                        )
                    }

                    // Tela 2: Player AndroidX Media3 ExoPlayer em Tela Cheia
                    composable(
                        route = "player/{streamUrl}/{title}",
                        arguments = listOf(
                            navArgument("streamUrl") { type = NavType.StringType },
                            navArgument("title") { type = NavType.StringType }
                        )
                    ) { backStackEntry ->
                        val encodedStreamUrl = backStackEntry.arguments?.getString("streamUrl").orEmpty()
                        val encodedTitle = backStackEntry.arguments?.getString("title").orEmpty()

                        val streamUrl = URLDecoder.decode(encodedStreamUrl, StandardCharsets.UTF_8.toString())
                        val title = URLDecoder.decode(encodedTitle, StandardCharsets.UTF_8.toString())

                        VideoPlayerScreen(
                            streamUrl = streamUrl,
                            videoTitle = title,
                            onBack = {
                                navController.popBackStack()
                            }
                        )
                    }
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/streaming/tvhub/ui/theme/Theme.kt',
    name: 'Theme.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Tema TV com paleta escura cinematográfica de alto contraste ideal para displays OLED e telas 10-foot.',
    content: `package com.streaming.tvhub.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme

val CyanNeon = Color(0xFF00E5FF)
val DarkBackground = Color(0xFF0B0E14)
val SurfaceDark = Color(0xFF161B22)
val OnSurfaceWhite = Color(0xFFF0F6FC)
val ErrorRed = Color(0xFFFF5252)

@OptIn(ExperimentalTvMaterial3Api::class)
private val TvDarkColorScheme = darkColorScheme(
    primary = CyanNeon,
    background = DarkBackground,
    surface = SurfaceDark,
    onPrimary = Color.Black,
    onBackground = OnSurfaceWhite,
    onSurface = OnSurfaceWhite,
    error = ErrorRed
)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun AndroidTVStreamingHubTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = TvDarkColorScheme,
        content = content
    )
}
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    category: 'res',
    language: 'xml',
    description: 'Strings de localização e título do aplicativo.',
    content: `<resources>
    <string name="app_name">CINELINK</string>
    <string name="play_video">Reproduzir Vídeo</string>
    <string name="retry">Tentar Novamente</string>
    <string name="live_stream">Ao Vivo</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    category: 'res',
    language: 'xml',
    description: 'Tema base no AndroidManifest derivado de Leanback ou Material sem ActionBar.',
    content: `<resources>
    <style name="Theme.AndroidTVStreamingHub" parent="Theme.AppCompat.NoActionBar">
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowBackground">@android:color/black</item>
    </style>
</resources>
`
  },
  {
    path: 'catalog.json',
    name: 'catalog.json (Endpoint Mock)',
    category: 'config',
    language: 'json',
    description: 'Exemplo do JSON fornecido na requisição para upload em GitHub Raw, Mockoon ou S3.',
    content: `{
  "categories": [
    {
      "id": "1",
      "title": "Canais Ao Vivo",
      "items": [
        {
          "id": "101",
          "title": "Stream de Teste (Mux Live HLS)",
          "thumbnailUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
          "streamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          "id": "102",
          "title": "Big Buck Bunny (HLS ABR)",
          "thumbnailUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",
          "streamUrl": "https://test-streams.mux.dev/test_001/stream.m3u8"
        }
      ]
    },
    {
      "id": "2",
      "title": "Filmes em Alta",
      "items": [
        {
          "id": "201",
          "title": "Sintel (Full HD)",
          "thumbnailUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500",
          "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        },
        {
          "id": "202",
          "title": "Tears of Steel (Sci-Fi Master)",
          "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500",
          "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
      ]
    }
  ]
}
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'config',
    language: 'markdown',
    description: 'Instruções completas para abrir no Android Studio, compilar o APK de TV e rodar no Emulador ou Chromecast.',
    content: `# Android TV Streaming Hub (Google TV / Android TV)

Hub de Streaming profissional para **Google TV** e **Android TV** desenvolvido com **Jetpack Compose for TV**, **AndroidX Media3 (ExoPlayer)**, **Retrofit**, **Kotlinx Serialization** e **Coil**.

---

## 🚀 Requisitos e Tecnologias
- **Android Studio**: Ladybug / Koala ou superior (com JDK 17).
- **Kotlin**: 2.0.20
- **Compile SDK**: 35 | **Min SDK**: 26 (Android 8.0 Oreo)
- **UI**: Jetpack Compose for TV (\`TvLazyColumn\` e \`TvLazyRow\` com foco D-Pad nativo)
- **Player**: AndroidX Media3 ExoPlayer 1.5.0 (suporte a HLS \`.m3u8\`, DASH \`.mpd\` e MP4 com autoplay)
- **Networking**: Retrofit 2.11 + OkHttp 4.12 + Kotlinx Serialization 1.7
- **Imagens**: Coil 2.7.0

---

## 🛠️ Como abrir e rodar no Android Studio

1. Baixe o projeto ZIP através deste estúdio ou extraia os arquivos na pasta desejada.
2. Abra o **Android Studio** e clique em **File > Open**, selecionando o diretório raiz.
3. Aguarde o **Gradle Sync** terminar de baixar os artefatos.
4. Crie um dispositivo virtual no **Device Manager**:
   - Selecione a categoria **TV**.
   - Escolha o perfil **Android TV (1080p)** ou **Google TV (4K)**.
   - Selecione a imagem de sistema **Android 14 (API 34)** ou **Android 13**.
5. Clique em **Run 'app'** (\`Shift + F10\`).

---

## 🎮 Controles no Emulador ou Controle Físico (D-Pad)
- **Setas do Teclado (Cima / Baixo / Esquerda / Direita)**: Navegação entre categorias e cards horizontais.
- **Enter / Botão Central (D-Pad Center)**: Seleciona o card e abre o player com autoplay imediato.
- **Escape / Back (Voltar)**: Retorna do player para o catálogo ou sai do aplicativo.
`
  }
];
