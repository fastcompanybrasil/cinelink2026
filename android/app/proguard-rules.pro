# ProGuard rules for Android TV Streaming Hub
-keepattributes *Annotation*
-keepclassmembers class * {
    @kotlinx.serialization.Serializable *;
}
-keep class com.streaming.tvhub.data.** { *; }
-keep class androidx.media3.** { *; }
