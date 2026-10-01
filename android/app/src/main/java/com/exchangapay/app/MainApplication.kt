package com.exchangapay.tst

import android.app.Activity
import android.app.Application
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          // Play Integrity lives in this app rather than in a library, so
          // autolinking does not see it and it has to be registered by hand.
          add(PlayIntegrityPackage())
          // Native root / hook detection.
          add(DeviceSecurityPackage())
          // Opens the Downloads screen from a document notification tap.
          add(FileManagerPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // Block screenshots/recording on every activity (incl. Auth0, Sumsub) except dev/tst builds.
    val blockScreenCapture = BuildConfig.APP_ENV != "dev" && BuildConfig.APP_ENV != "tst"
    registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
      override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        val window = activity.window
        if (blockScreenCapture) {
          window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
          )
        }
        // M-12 tapjacking: drop touches while another app's window covers ours, and on
        // API 31+ hide other apps' overlays while ours is shown. Applied in every environment.
        window.decorView.filterTouchesWhenObscured = true
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          window.setHideOverlayWindows(true)
        }
      }
      override fun onActivityStarted(activity: Activity) {}
      override fun onActivityResumed(activity: Activity) {}
      override fun onActivityPaused(activity: Activity) {}
      override fun onActivityStopped(activity: Activity) {}
      override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
      override fun onActivityDestroyed(activity: Activity) {}
    })
    loadReactNative(this)
  }
}
