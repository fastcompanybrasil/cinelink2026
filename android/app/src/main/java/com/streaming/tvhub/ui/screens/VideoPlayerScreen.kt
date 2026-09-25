package com.streaming.tvhub.ui.screens

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
    val phMatch = Regex("pornhub\.com/(?:view_video\.php\?viewkey=|embed/)([a-zA-Z0-9]+)").find(streamUrl)
    val xvMatch = Regex("xvideos\.com/(?:video\.([a-zA-Z0-9]+)|embedframe/([a-zA-Z0-9]+)|video([0-9]+))").find(streamUrl)
    val xnxxMatch = Regex("xnxx\.com/(?:video-([a-zA-Z0-9]+)|embedframe/([a-zA-Z0-9]+)|video([0-9]+))").find(streamUrl)
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
                    errorMessage = "Erro de reprodução: ${error.localizedMessage ?: "Falha no codec ou conexão"}"
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
