package com.streaming.tvhub.data

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
