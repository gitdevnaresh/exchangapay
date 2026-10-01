package com.exchangapay.tst

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash
class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "exchangapay"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootSplashTheme)

    // FLAG_SECURE is applied to every activity in MainApplication (prod only).
    super.onCreate(null)
    applySystemBarInsets()
  }

  /**
   * targetSdk 36 forces edge-to-edge on Android 16, and the windowOptOutEdgeToEdgeEnforcement
   * opt-out is ignored. The JS screens use the core SafeAreaView, which is a no-op on Android, so
   * the system-bar and cutout insets are applied here as padding on the content view. This keeps
   * the previous layout: the root view sits below the status bar and above the navigation bar, and
   * react-native-safe-area-context still reports zero insets. The IME is not included because the
   * activity uses adjustPan.
   */
  private fun applySystemBarInsets() {
    window.setBackgroundDrawable(ColorDrawable(Color.BLACK))
    WindowInsetsControllerCompat(window, window.decorView).run {
      isAppearanceLightStatusBars = false
      isAppearanceLightNavigationBars = false
    }
    val content = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val bars =
          insets.getInsets(
              WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
      view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
      insets
    }
  }
}
