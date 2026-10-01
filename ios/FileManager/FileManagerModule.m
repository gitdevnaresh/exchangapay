#import "FileManagerModule.h"

// Used by src/utils/documentNotification.ts. Returns the app's Documents
// directory so a tapped document notification can open a file saved there.
// The file name is validated in JS before it is joined to this path (L-07);
// this module never takes a path from the caller.

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

@end
