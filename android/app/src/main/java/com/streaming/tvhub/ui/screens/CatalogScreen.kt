package com.streaming.tvhub.ui.screens

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
