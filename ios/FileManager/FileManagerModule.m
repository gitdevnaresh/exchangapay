#import "FileManagerModule.h"

// Used by src/utils/documentNotification.ts. Returns the app's Documents
// directory so a tapped document notification can open a file saved there.
// The file name is validated in JS before it is joined to this path (L-07);
// this module never takes a path from the caller.
//
// Also used by src/utils/fileDownload.ts to lock down downloaded statements
// and images (M-06): per-file NSFileProtectionComplete does not need the
// Data Protection entitlement, so it holds while that entitlement is off.

@implementation FileManagerModule

RCT_EXPORT_MODULE(FileManagerModule)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(getDocumentDirectoryPath:(RCTResponseSenderBlock)callback)
{
  NSString *documents = NSSearchPathForDirectoriesInDomains(
      NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
  callback(@[ documents ?: @"" ]);
}

// M-06: encrypt the file with a key discarded while the device is locked and
// keep it out of iTunes/Finder/iCloud backups. Only paths inside the app's own
// container are accepted.
RCT_EXPORT_METHOD(protectFile:(NSString *)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *raw = [path hasPrefix:@"file://"] ? [path substringFromIndex:7] : path;
  NSString *target = [raw stringByStandardizingPath];
  NSString *home = [NSHomeDirectory() stringByStandardizingPath];
  if (target.length == 0 || ![target hasPrefix:[home stringByAppendingString:@"/"]]) {
    reject(@"E_PATH", @"Path is outside the app container", nil);
    return;
  }

  NSError *error = nil;
  if (![[NSFileManager defaultManager] setAttributes:@{ NSFileProtectionKey : NSFileProtectionComplete }
                                        ofItemAtPath:target
                                               error:&error]) {
    reject(@"E_PROTECT", @"Could not set file protection", error);
    return;
  }
  if (![[NSURL fileURLWithPath:target] setResourceValue:@YES
                                                 forKey:NSURLIsExcludedFromBackupKey
                                                  error:&error]) {
    reject(@"E_BACKUP", @"Could not exclude file from backup", error);
    return;
  }
  resolve(nil);
}

@end
