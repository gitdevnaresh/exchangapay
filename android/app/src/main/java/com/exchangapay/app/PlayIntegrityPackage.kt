package com.exchangapay.tst

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * Registers PlayIntegrityModule (H-04). Written as a BaseReactPackage because the
 * app runs the new architecture (newArchEnabled=true): the module info below is
 * what lets the bridgeless runtime resolve a legacy module lazily instead of
 * instantiating every package eagerly at startup.
 */
class PlayIntegrityPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? =
        if (name == PlayIntegrityModule.NAME) PlayIntegrityModule(reactContext) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
        ReactModuleInfoProvider {
            mapOf(
                PlayIntegrityModule.NAME to
                    ReactModuleInfo(
                        PlayIntegrityModule.NAME,
                        PlayIntegrityModule.NAME,
                        false, // canOverrideExistingModule
                        false, // needsEagerInit — requested on demand, never at startup
                        false, // isCxxModule
                        false  // isTurboModule — plain module, served via the interop layer
                    )
            )
        }
}
