package com.streaming.tvhub.ui.theme

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
