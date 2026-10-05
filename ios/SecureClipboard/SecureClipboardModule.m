#import "SecureClipboardModule.h"

#import <UIKit/UIKit.h>

// Clipboard writes used by src/utils/clipboard.ts. Every write carries an
// expiration date, so iOS drops the item itself even if the app is suspended
// or killed before the JS timer runs (L-13). setSensitiveString (the TOTP
// setup key) is also localOnly, which keeps it off Universal Clipboard (no
// Handoff to the user's other devices). Both resolve YES when the item was
// set, NO otherwise; never reject.

static NSString *const kPlainTextType = @"public.utf8-plain-text";

@implementation SecureClipboardModule

RCT_EXPORT_MODULE(SecureClipboard)

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

static BOOL WriteExpiring(NSString *text, double ttlMs, BOOL localOnly)
{
  @try {
    NSTimeInterval ttl = MAX(ttlMs, 1000) / 1000.0;
    [[UIPasteboard generalPasteboard]
        setItems:@[ @{kPlainTextType : text ?: @""} ]
         options:@{
           UIPasteboardOptionLocalOnly : @(localOnly),
           UIPasteboardOptionExpirationDate : [NSDate dateWithTimeIntervalSinceNow:ttl],
         }];
    return YES;
  } @catch (NSException *exception) {
    return NO;
  }
}

// `label` is accepted for parity with Android's ClipData label; iOS has none.
RCT_EXPORT_METHOD(setEphemeralString:(NSString *)text
                  label:(NSString *)label
                  ttlMs:(double)ttlMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@(WriteExpiring(text, ttlMs, NO)));
}

RCT_EXPORT_METHOD(setSensitiveString:(NSString *)text
                  label:(NSString *)label
                  ttlMs:(double)ttlMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@(WriteExpiring(text, ttlMs, YES)));
}

// The pasteboard enforces the expiration date itself; nothing to catch up on.
RCT_EXPORT_METHOD(clearExpired)
{
}

@end
