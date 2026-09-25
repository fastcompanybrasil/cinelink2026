package com.streaming.tvhub

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
