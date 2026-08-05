#import "AppAttestModule.h"

#import <CommonCrypto/CommonDigest.h>
#import <DeviceCheck/DeviceCheck.h>

/**
 * H-04 — Apple App Attest.
 *
 * Everything in src/security/deviceIntegrity.ts runs inside the process an
 * attacker controls and can be patched out. This cannot: the key pair below is
 * generated inside the Secure Enclave, Apple's servers vouch for it, and the
 * private half never leaves the hardware. The app is only a courier.
 *
 * TWO-PHASE, WHICH IS WHY THIS RETURNS A JSON ENVELOPE RATHER THAN A TOKEN:
 *
 *   First call ever  — generate a key, ask Apple to attest it, return
 *                      {"type":"attestation","keyId":…,"attestation":…,"nonce":…}
 *                      The backend verifies the attestation object against
 *                      Apple's App Attest root CA, checks the app ID and the
 *                      client-data hash, then PINS the resulting public key to
 *                      the account. This happens once per install.
 *
 *   Every call after — {"type":"assertion","keyId":…,"assertion":…,"nonce":…}
 *                      The backend verifies the assertion signature with the
 *                      pinned public key and checks that the counter increases,
 *                      which is what makes replay detectable.
 *
 * WHAT THE BACKEND MUST DO, or none of this is worth anything:
 *   - Verify server-side. A client that checks its own attestation has checked
 *     nothing, because that check is what the attacker rewrites.
 *   - Issue the nonce itself, single-use and short-lived. The hash signed here is
 *     SHA-256 of the nonce string exactly as passed in; the server must hash the
 *     nonce it issued the same way and compare.
 *   - Reject the request when verification fails. An app that hides a button is
 *     not a control.
 *
 * ENTITLEMENT: this compiles and ships without
 * com.apple.developer.devicecheck.appattest-environment, and stays inert until
 * the entitlement is added to a provisioning profile that carries the App Attest
 * capability. Adding the entitlement to the app before the profile has it breaks
 * code signing, so that step belongs to whoever manages the Apple account — not
 * to this file. Until then every call rejects and the JS side sends no header.
 */

/**
 * Not the private key — that never leaves the Secure Enclave. This is Apple's
 * identifier for it, and it is useless to anyone who does not also hold the
 * hardware. NSUserDefaults rather than the Keychain on purpose: a Keychain entry
 * can outlive an app reinstall while the key itself does not, which would leave
 * the app holding an id for a key that no longer exists.
 */
static NSString *const kAppAttestKeyIdDefaultsKey = @"com.exchangapay.appattest.keyId";

static NSString *const kErrorDomain = @"app_attest_unavailable";

@implementation AppAttestModule

RCT_EXPORT_MODULE();

/** Nothing here touches UIKit, so keep it off the main queue during startup. */
+ (BOOL)requiresMainQueueSetup {
  return NO;
}

static NSData *SHA256OfString(NSString *value) {
  NSData *input = [value dataUsingEncoding:NSUTF8StringEncoding];
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(input.bytes, (CC_LONG)input.length, digest);
  return [NSData dataWithBytes:digest length:CC_SHA256_DIGEST_LENGTH];
}

static NSString *EnvelopeJSON(NSDictionary *payload) {
  NSError *error = nil;
  NSData *json = [NSJSONSerialization dataWithJSONObject:payload options:0 error:&error];
  if (error || json == nil) {
    return nil;
  }
  return [[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding];
}

/**
 * Reject rather than resolve-with-null on every failure path. The JS side turns
 * a rejection into "no token" and sends the request anyway — failing open is
 * deliberate while the backend does not yet enforce, because blocking here would
 * only break legitimate users, and an attacker patches this out regardless.
 */
RCT_EXPORT_METHOD(attest : (NSString *)nonce
                  resolver : (RCTPromiseResolveBlock)resolve
                  rejecter : (RCTPromiseRejectBlock)reject) {
  if (nonce.length == 0) {
    reject(kErrorDomain, @"A nonce is required to attest", nil);
    return;
  }

  if (@available(iOS 14.0, *)) {
    DCAppAttestService *service = DCAppAttestService.sharedService;
    // NO on a simulator, on hardware without the Secure Enclave, and when the
    // App Attest entitlement is absent.
    if (!service.isSupported) {
      reject(kErrorDomain, @"App Attest is not supported on this device", nil);
      return;
    }

    NSData *clientDataHash = SHA256OfString(nonce);
    NSString *storedKeyId =
        [[NSUserDefaults standardUserDefaults] stringForKey:kAppAttestKeyIdDefaultsKey];

    if (storedKeyId.length > 0) {
      [self assertWithService:service
                        keyId:storedKeyId
               clientDataHash:clientDataHash
                        nonce:nonce
                      resolve:resolve
                       reject:reject];
    } else {
      [self enrolWithService:service
              clientDataHash:clientDataHash
                       nonce:nonce
                     resolve:resolve
                      reject:reject];
    }
    return;
  }

  reject(kErrorDomain, @"App Attest requires iOS 14 or later", nil);
}

/** One-time: create the Secure Enclave key and have Apple vouch for it. */
- (void)enrolWithService:(DCAppAttestService *)service
          clientDataHash:(NSData *)clientDataHash
                   nonce:(NSString *)nonce
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject API_AVAILABLE(ios(14.0)) {
  [service generateKeyWithCompletionHandler:^(NSString *_Nullable keyId, NSError *_Nullable error) {
    if (error != nil || keyId.length == 0) {
      reject(kErrorDomain, error.localizedDescription ?: @"Could not generate an App Attest key", error);
      return;
    }

    [service attestKey:keyId
        clientDataHash:clientDataHash
     completionHandler:^(NSData *_Nullable attestation, NSError *_Nullable attestError) {
       if (attestError != nil || attestation == nil) {
         reject(kErrorDomain,
                attestError.localizedDescription ?: @"Could not attest the App Attest key",
                attestError);
         return;
       }

       // Stored only after Apple accepted the key. Storing it earlier would
       // leave the app asserting with a key the backend never registered.
       [[NSUserDefaults standardUserDefaults] setObject:keyId forKey:kAppAttestKeyIdDefaultsKey];

       NSString *envelope = EnvelopeJSON(@{
         @"type" : @"attestation",
         @"keyId" : keyId,
         @"attestation" : [attestation base64EncodedStringWithOptions:0],
         @"nonce" : nonce,
       });
       envelope != nil ? resolve(envelope)
                       : reject(kErrorDomain, @"Could not encode the attestation", nil);
     }];
  }];
}

/** Steady state: sign the server's nonce with the already-registered key. */
- (void)assertWithService:(DCAppAttestService *)service
                    keyId:(NSString *)keyId
           clientDataHash:(NSData *)clientDataHash
                    nonce:(NSString *)nonce
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject API_AVAILABLE(ios(14.0)) {
  [service generateAssertion:keyId
              clientDataHash:clientDataHash
           completionHandler:^(NSData *_Nullable assertion, NSError *_Nullable error) {
             if (error != nil || assertion == nil) {
               // DCErrorInvalidKey: the key is gone — restored backup, or the
               // enclave dropped it. Forget the id so the next call re-enrols
               // instead of failing forever.
               if ([error.domain isEqualToString:DCErrorDomain] &&
                   error.code == DCErrorInvalidKey) {
                 [[NSUserDefaults standardUserDefaults]
                     removeObjectForKey:kAppAttestKeyIdDefaultsKey];
               }
               reject(kErrorDomain,
                      error.localizedDescription ?: @"Could not produce an App Attest assertion",
                      error);
               return;
             }

             NSString *envelope = EnvelopeJSON(@{
               @"type" : @"assertion",
               @"keyId" : keyId,
               @"assertion" : [assertion base64EncodedStringWithOptions:0],
               @"nonce" : nonce,
             });
             envelope != nil ? resolve(envelope)
                             : reject(kErrorDomain, @"Could not encode the assertion", nil);
           }];
}

@end
