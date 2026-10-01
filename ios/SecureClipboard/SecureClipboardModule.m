#import "SecureClipboardModule.h"

#import <UIKit/UIKit.h>

// Clipboard writes for secrets (the TOTP setup key), used by
// src/utils/clipboard.ts `copySensitive`. localOnly keeps the item off
// Universal Clipboard (no Handoff to the user's other devices), and the
// expiration date has iOS drop it itself even if the app is killed before the
// JS timer runs. Resolves YES when the item was set, NO otherwise; never rejects.

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

// `label` is accepted for parity with Android's ClipData label; iOS has none.
RCT_EXPORT_METHOD(setSensitiveString:(NSString *)text
                  label:(NSString *)label
                  ttlMs:(double)ttlMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    NSTimeInterval ttl = MAX(ttlMs, 1000) / 1000.0;
    [[UIPasteboard generalPasteboard]
        setItems:@[ @{kPlainTextType : text ?: @""} ]
         options:@{
           UIPasteboardOptionLocalOnly : @YES,
           UIPasteboardOptionExpirationDate : [NSDate dateWithTimeIntervalSinceNow:ttl],
         }];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

@end
