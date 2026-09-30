package com.exchangapay.tst

import android.app.Activity
import android.app.Application
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
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // Block screenshots/recording on every activity (incl. Auth0, Sumsub) except dev/tst builds.
    if (BuildConfig.APP_ENV != "dev" && BuildConfig.APP_ENV != "tst") {
      registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
        override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
          activity.window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
          )
        }
        override fun onActivityStarted(activity: Activity) {}
        override fun onActivityResumed(activity: Activity) {}
        override fun onActivityPaused(activity: Activity) {}
        override fun onActivityStopped(activity: Activity) {}
        override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
        override fun onActivityDestroyed(activity: Activity) {}
      })
    }
    loadReactNative(this)
  }
}
