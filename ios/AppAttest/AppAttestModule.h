#import <React/RCTBridgeModule.h>

/**
 * H-04 — Apple App Attest, the iOS half of Tier 1.
 *
 * See AppAttestModule.m for the flow and for what the backend has to do with
 * what this returns. Nothing here is a security control on its own.
 */
@interface AppAttestModule : NSObject <RCTBridgeModule>
@end
