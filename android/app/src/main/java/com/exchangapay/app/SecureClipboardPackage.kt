package com.exchangapay.tst

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** Registers SecureClipboardModule (same shape as DeviceSecurityPackage). */
class SecureClipboardPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? =
        if (name == SecureClipboardModule.NAME) SecureClipboardModule(reactContext) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
        ReactModuleInfoProvider {
            mapOf(
                SecureClipboardModule.NAME to
                    ReactModuleInfo(
                        SecureClipboardModule.NAME,
                        SecureClipboardModule.NAME,
                        false, // canOverrideExistingModule
                        false, // needsEagerInit
                        false, // isCxxModule
                        false  // isTurboModule
                    )
            )
        }
}
