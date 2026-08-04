package com.exchangapay.tst

import android.os.Bundle
import android.view.WindowManager
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

    // Security finding H-09. One flag, three protections:
    //   - screenshots are blocked (the shutter fires, the file is black)
    //   - screen recording and casting capture a black frame
    //   - the OS stops writing a recents-thumbnail of the last screen to disk
    //
    // That last one is the reason this is not optional. The thumbnail is written
    // automatically whenever the app is backgrounded, so a full card number and
    // CVV were being persisted to disk with no user action at all, and left
    // there for anyone with later device access.
    //
    // Set before super.onCreate so it is in force before any view is attached —
    // the window exists from Activity.attach(), well before this point.
    //
    // React Native's Modal creates its own Dialog window, which does NOT inherit
    // Activity flags in general. RN copies FLAG_SECURE across explicitly when the
    // host Activity has it set (ReactModalHostView.showOrUpdate), so the card
    // details Overlay in CardDetailsInfo.tsx is covered by this too. Verified
    // against the RN 0.83 source in node_modules; re-check on a major upgrade.
    window.setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    )

    super.onCreate(null)
  }
}
