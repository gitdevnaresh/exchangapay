#import <React/RCTBridgeModule.h>

// Native jailbreak / anti-debug detection, exposed to JS as `DeviceSecurityIOS`.
@interface DeviceSecurityModule : NSObject <RCTBridgeModule>

// Blocks debugger attach (PT_DENY_ATTACH). Called from AppDelegate in Release only.
+ (void)enableAntiDebug;

@end
