package com.exchangapay.tst

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** Registers DeviceSecurityModule (same shape as PlayIntegrityPackage). */
class DeviceSecurityPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? =
        if (name == DeviceSecurityModule.NAME) DeviceSecurityModule(reactContext) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
        ReactModuleInfoProvider {
            mapOf(
                DeviceSecurityModule.NAME to
                    ReactModuleInfo(
                        DeviceSecurityModule.NAME,
                        DeviceSecurityModule.NAME,
                        false, // canOverrideExistingModule
                        false, // needsEagerInit
                        false, // isCxxModule
                        false  // isTurboModule
                    )
            )
        }
}
