# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in the Android SDK's default proguard file.

# Keep the JavaScript interface bridge used by the bundled AttendEase SPA
# so window.AttendEasePrint keeps working in release builds.
-keepclassmembers class com.attendease.android.PrintBridge {
    @android.webkit.JavascriptInterface <methods>;
}
