#import <React/RCTBridgeModule.h>

// Documents directory lookup for document notifications and per-file protection
// for downloads (M-06), exposed to JS as `FileManagerModule`.
@interface FileManagerModule : NSObject <RCTBridgeModule>
@end
