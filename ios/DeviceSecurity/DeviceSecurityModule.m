#import "DeviceSecurityModule.h"

#import <dlfcn.h>
#import <mach-o/dyld.h>
#import <stdio.h>
#import <stdlib.h>
#import <sys/stat.h>
#import <sys/sysctl.h>
#import <TargetConditionals.h>
#import <unistd.h>

// Native jailbreak / anti-debug detection, used by src/security/deviceIntegrity.ts.
// Never rejects; a failing probe just reports no signal.

static NSString *const kSandboxProbePath = @"/private/exchangapay_native_jb_probe.txt";

static NSArray<NSString *> *JailbreakPaths(void) {
  return @[
    @"/Applications/Cydia.app",
    @"/Applications/Sileo.app",
    @"/Applications/Zebra.app",
    @"/Applications/blackra1n.app",
    @"/Applications/FakeCarrier.app",
    @"/Applications/Icy.app",
    @"/Applications/IntelliScreen.app",
    @"/Applications/MxTube.app",
    @"/Applications/RockApp.app",
    @"/Applications/SBSettings.app",
    @"/Applications/WinterBoard.app",
    @"/Library/MobileSubstrate/MobileSubstrate.dylib",
    @"/Library/MobileSubstrate/DynamicLibraries",
    @"/System/Library/LaunchDaemons/com.ikey.bbot.plist",
    @"/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
    @"/bin/bash",
    @"/bin/sh",
    @"/etc/apt",
    @"/etc/ssh/sshd_config",
    @"/private/var/lib/apt",
    @"/private/var/lib/cydia",
    @"/private/var/stash",
    @"/private/var/tmp/cydia.log",
    @"/usr/bin/sshd",
    @"/usr/libexec/cydia",
    @"/usr/libexec/sftp-server",
    @"/usr/sbin/sshd",
    @"/usr/sbin/frida-server",
    @"/usr/lib/frida",
    @"/var/cache/apt",
    @"/var/lib/cydia",
    @"/var/binpack",
  ];
}

// Rootless jailbreaks (Dopamine, palera1n rootless). /var/jb is a symlink
// into /private/preboot/<hash>/jb, whose target the sandbox may hide, so these
// are checked with lstat (the link itself) as well as the normal probes.
static NSArray<NSString *> *RootlessJailbreakPaths(void) {
  return @[
    @"/var/jb",
    @"/private/var/jb",
    @"/var/jb/usr/bin/su",
    @"/var/jb/Applications/Sileo.app",
    @"/var/jb/Applications/Zebra.app",
    @"/var/jb/usr/lib/ellekit",
    @"/var/jb/usr/lib/libellekit.dylib",
    @"/var/jb/Library/MobileSubstrate/DynamicLibraries",
    @"/.procursus_strapped",
  ];
}

static NSArray<NSString *> *SuspiciousDylibTokens(void) {
  return @[
    @"mobilesubstrate",
    @"substrate",
    @"substitute",
    @"cynject",
    @"cycript",
    @"libhooker",
    @"tweakinject",
    @"frida",
    // Rootless-era hooking runtimes.
    @"ellekit",
    @"systemhook",
    @"rootlesshooks",
  ];
}

@implementation DeviceSecurityModule

RCT_EXPORT_MODULE(DeviceSecurityIOS)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

+ (void)enableAntiDebug
{
  const int ptDenyAttach = 31; // PT_DENY_ATTACH
#if defined(__arm64__) && !TARGET_OS_SIMULATOR
  // Issue the ptrace syscall (SYS_ptrace = 26) directly. The dlsym path
  // below goes through libsystem's ptrace symbol, which a single hook disables;
  // a raw svc does not pass through any symbol an attacker can interpose.
  register long x0 __asm__("x0") = ptDenyAttach;
  register long x1 __asm__("x1") = 0;
  register long x2 __asm__("x2") = 0;
  register long x3 __asm__("x3") = 0;
  register long x16 __asm__("x16") = 26;
  __asm__ volatile("svc #0x80"
                   : "+r"(x0)
                   : "r"(x1), "r"(x2), "r"(x3), "r"(x16)
                   : "memory", "cc");
  (void)x0;
#endif
  // ptrace is not in the public iOS SDK headers, so resolve it at runtime.
  // Kept as a second layer (and for non-arm64 builds).
  void *handle = dlopen(NULL, RTLD_NOW);
  if (handle == NULL) {
    return;
  }
  typedef int (*PtraceFn)(int request, pid_t pid, caddr_t addr, int data);
  PtraceFn ptraceFn = (PtraceFn)dlsym(handle, "ptrace");
  if (ptraceFn != NULL) {
    ptraceFn(ptDenyAttach, 0, 0, 0);
  }
  dlclose(handle);
}

RCT_EXPORT_METHOD(getJailbreakStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray<NSString *> *reasons = [NSMutableArray array];
  @try {
    if ([DeviceSecurityModule hasJailbreakFiles]) {
      [reasons addObject:@"native_jailbreak_file"];
    }
    if ([DeviceSecurityModule canWriteOutsideSandbox]) {
      [reasons addObject:@"native_sandbox_write"];
    }
    if ([DeviceSecurityModule hasSuspiciousDylib]) {
      [reasons addObject:@"native_suspicious_dylib"];
    }
    if ([DeviceSecurityModule isBeingTraced]) {
      [reasons addObject:@"native_debugger_attached"];
    }
  } @catch (__unused NSException *exception) {
    // Report whatever was collected before the fault.
  }
  resolve(@{
    @"compromised" : @(reasons.count > 0),
    @"reasons" : reasons,
  });
}

+ (BOOL)hasJailbreakFiles
{
  NSFileManager *fm = [NSFileManager defaultManager];
  for (NSString *path in JailbreakPaths()) {
    if ([fm fileExistsAtPath:path]) {
      return YES;
    }
    // fopen catches some files that fileExistsAtPath misses.
    FILE *file = fopen(path.fileSystemRepresentation, "r");
    if (file != NULL) {
      fclose(file);
      return YES;
    }
  }
  for (NSString *path in RootlessJailbreakPaths()) {
    struct stat info;
    if (lstat(path.fileSystemRepresentation, &info) == 0 || [fm fileExistsAtPath:path]) {
      return YES;
    }
  }
  return NO;
}

// A write outside the app container only succeeds if the sandbox is broken.
+ (BOOL)canWriteOutsideSandbox
{
  NSError *error = nil;
  BOOL written = [@"1" writeToFile:kSandboxProbePath
                        atomically:YES
                          encoding:NSUTF8StringEncoding
                             error:&error];
  if (!written) {
    return NO;
  }
  [[NSFileManager defaultManager] removeItemAtPath:kSandboxProbePath error:nil];
  return YES;
}

+ (BOOL)isXcodeInjectedLibrary:(NSString *)path
{
  for (NSString *prefix in @[
         @"/Developer/",
         @"/System/Developer/",
         @"/usr/lib/libLogRedirect.dylib",
         @"/usr/lib/libBacktraceRecording.dylib",
         @"/usr/lib/libMainThreadChecker.dylib",
         @"/usr/lib/libViewDebuggerSupport.dylib",
       ]) {
    if ([path hasPrefix:prefix]) {
      return YES;
    }
  }
  return NO;
}

// A Substrate/Frida/Cycript image loaded into this process means a hook.
+ (BOOL)hasSuspiciousDylib
{
  // dyld ignores this for App Store / TestFlight apps, so an injected
  // library here means tampering. Xcode sets it for its own tools when it
  // launches a build (QA runs), so those paths are allowed.
  const char *inserted = getenv("DYLD_INSERT_LIBRARIES");
  if (inserted != NULL && inserted[0] != '\0') {
    for (NSString *entry in [[NSString stringWithUTF8String:inserted] componentsSeparatedByString:@":"]) {
      if (entry.length > 0 && ![DeviceSecurityModule isXcodeInjectedLibrary:entry]) {
        return YES;
      }
    }
  }
  uint32_t count = _dyld_image_count();
  NSArray<NSString *> *tokens = SuspiciousDylibTokens();
  for (uint32_t i = 0; i < count; i++) {
    const char *namePtr = _dyld_get_image_name(i);
    if (namePtr == NULL) {
      continue;
    }
    NSString *name = [[NSString stringWithUTF8String:namePtr] lowercaseString];
    for (NSString *token in tokens) {
      if ([name containsString:token]) {
        return YES;
      }
    }
  }
  return NO;
}

// The kernel sets P_TRACED on a process a debugger is attached to.
+ (BOOL)isBeingTraced
{
  struct kinfo_proc info;
  size_t size = sizeof(info);
  int mib[4] = {CTL_KERN, KERN_PROC, KERN_PROC_PID, getpid()};
  memset(&info, 0, sizeof(info));
  if (sysctl(mib, 4, &info, &size, NULL, 0) != 0) {
    return NO;
  }
  return (info.kp_proc.p_flag & P_TRACED) != 0;
}

@end
