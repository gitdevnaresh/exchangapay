# ProGuard / R8 rules — security finding C-08.
#
# Obfuscation is defence in depth, NOT secrecy. It raises the cost of reading the
# app; it does not hide anything from a determined attacker, and it does nothing
# about string literals (API URLs, key names) which survive minification intact.
# Secrets must still be removed at the source — see C-01, C-04, C-06.
#
# ---------------------------------------------------------------------------
# WHAT IS ALREADY COVERED, AND DELIBERATELY NOT REPEATED HERE
#
# React Native core ships its own consumer rules inside the react-android AAR
# (node_modules/react-native/ReactAndroid/proguard-rules.pro). Those already keep:
#   @DoNotStrip / @DoNotStripAny (Facebook, JNI and Yoga variants)
#   classes implementing NativeModule and JavaScriptModule
#   @ReactProp / @ReactPropGroup methods
#   all native <methods>, com.facebook.jni.**, react.bridge.**, turbomodule.core.**
# Re-declaring them here would be noise. Likewise reanimated, worklets, svg and
# notifee ship consumer rules of their own.
#
# Everything below is what those do NOT cover.
# ---------------------------------------------------------------------------


# --- Crash-report readability -----------------------------------------------
# Without these, every Crashlytics and Sentry stack trace becomes unreadable.
# The Crashlytics gradle plugin uploads mapping.txt automatically; sentry.gradle
# does the same when SENTRY_AUTH_TOKEN is present (see C-02).
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepattributes Exceptions,RuntimeVisible*Annotation*,AnnotationDefault
-renamesourcefileattribute SourceFile


# --- Hermes -----------------------------------------------------------------
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**


# --- Firebase (app, messaging, crashlytics) ---------------------------------
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**


# --- Sentry -----------------------------------------------------------------
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**


# --- SumSub KYC SDK ---------------------------------------------------------
# Heavy reflection + Kotlin serialisation internally; keep it whole.
-keep class com.sumsub.** { *; }
-dontwarn com.sumsub.**


# --- Auth0 ------------------------------------------------------------------
-keep class com.auth0.** { *; }
-dontwarn com.auth0.**


# --- Native modules linked by this app --------------------------------------
# Each of these crosses the JNI / TurboModule boundary by name.
-keep class com.oblador.keychain.** { *; }
-keep class com.mrousavy.camera.** { *; }
-keep class com.margelo.nitro.** { *; }
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.reactnativecommunity.** { *; }
-keep class com.zoontek.** { *; }
-keep class com.horcrux.svg.** { *; }
-keep class com.imagepicker.** { *; }
-keep class com.ReactNativeBlobUtil.** { *; }
-keep class com.henninghall.date_picker.** { *; }
-keep class com.agastya.androidinappupdates.** { *; }
-keep class io.invertase.firebase.** { *; }


# --- Networking (OkHttp / Okio, used by RN and most SDKs) -------------------
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase


# --- Kotlin -----------------------------------------------------------------
-dontwarn kotlin.**
-dontwarn kotlinx.**
-keepclassmembers class **$WhenMappings { <fields>; }
-keepclassmembers class kotlin.Metadata { public <methods>; }
# kotlinx.serialization generated serializers are looked up reflectively.
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}


# --- Standard Android / JVM patterns ----------------------------------------
# Enums are resolved by name via valueOf().
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
# Views inflated from XML and their setters.
-keepclassmembers class * extends android.view.View {
    void set*(***);
    *** get*();
}
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}


# --- Strip debug logging from release builds --------------------------------
# Requires proguard-android-optimize.txt as the base file; with the plain
# proguard-android.txt, optimisation is off and these are silently ignored.
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
