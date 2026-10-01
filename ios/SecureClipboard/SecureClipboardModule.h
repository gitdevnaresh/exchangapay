#import <React/RCTBridgeModule.h>

// Local-only, expiring pasteboard writes for secrets, exposed to JS as `SecureClipboard`.
@interface SecureClipboardModule : NSObject <RCTBridgeModule>
@end
