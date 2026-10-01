package com.exchangapay.tst

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** Registers FileManagerModule (same shape as SecureClipboardPackage). */
class FileManagerPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? =
        if (name == FileManagerModule.NAME) FileManagerModule(reactContext) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
        ReactModuleInfoProvider {
            mapOf(
                FileManagerModule.NAME to
                    ReactModuleInfo(
                        FileManagerModule.NAME,
                        FileManagerModule.NAME,
                        false, // canOverrideExistingModule
                        false, // needsEagerInit
                        false, // isCxxModule
                        false  // isTurboModule
                    )
            )
        }
}
