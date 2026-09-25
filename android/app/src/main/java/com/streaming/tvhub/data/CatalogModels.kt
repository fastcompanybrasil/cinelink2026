package com.streaming.tvhub.data

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
