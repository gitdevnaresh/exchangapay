import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// Opaque cover shown over the UI whenever it must not be captured.
  private var privacyOverlay: UIView?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Block debugger attach in Release builds (Debug is skipped so Xcode still works).
    #if !DEBUG
    if let deviceSecurity = NSClassFromString("DeviceSecurityModule") as? NSObject.Type {
      _ = deviceSecurity.perform(NSSelectorFromString("enableAntiDebug"))
    }
    #endif

    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "exchangapay",
      in: window,
      launchOptions: launchOptions
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(screenCaptureDidChange),
      name: UIScreen.capturedDidChangeNotification,
      object: nil
    )
    // A recording or mirroring session may already be running at launch, in
    // which case no notification is coming — check the current state once.
    screenCaptureDidChange()

    return true
  }

  // MARK: - Screen-capture protection
  //
  // iOS has no FLAG_SECURE equivalent, so this is two separate defences:
  //
  //   1. THE SNAPSHOT. When the app resigns active, iOS photographs the screen
  //      and writes it to disk for the app switcher. On a screen showing a card
  //      number and CVV, that persists card data with no user action at all.
  //      Covering the UI before the photograph is taken is the only fix.
  //
  //   2. SCREEN RECORDING AND MIRRORING. isCaptured covers both. Note that this
  //      blanks the app during AirPlay and QuickTime capture as well as
  //      RecordScreen — deliberate: those are the same leak, and a card app that
  //      stays visible while being mirrored to an unknown display is the problem.
  //
  // Screenshots themselves cannot be blocked on iOS at all. They can only be
  // detected after the fact (userDidTakeScreenshotNotification), which is worth
  // wiring to fraud telemetry but is not prevention, so it is not done here.

  /// Opaque, not blurred. A blur is a filter over content that is still present
  /// in the layer being captured, and heavy blurs on large glyphs — which is
  /// exactly what a card number is — do not reliably destroy legibility.
  /// Reuses the launch assets so the app switcher shows the splash, not a slab.
  private func makePrivacyOverlay() -> UIView {
    let bounds = window?.bounds ?? UIScreen.main.bounds
    let overlay = UIView(frame: bounds)
    overlay.backgroundColor = .systemBackground
    overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    if let background = UIImage(named: "LaunchBackground") {
      let backgroundView = UIImageView(image: background)
      backgroundView.frame = overlay.bounds
      backgroundView.contentMode = .scaleAspectFill
      backgroundView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      overlay.addSubview(backgroundView)
    }

    if let logo = UIImage(named: "LaunchLogo") {
      let logoView = UIImageView(image: logo)
      logoView.contentMode = .scaleAspectFit
      logoView.translatesAutoresizingMaskIntoConstraints = false
      overlay.addSubview(logoView)
      NSLayoutConstraint.activate([
        logoView.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
        logoView.centerYAnchor.constraint(equalTo: overlay.centerYAnchor),
        logoView.widthAnchor.constraint(lessThanOrEqualTo: overlay.widthAnchor, multiplier: 0.5),
      ])
    }

    return overlay
  }

  // Off for dev/tst builds so QA can record the screen; on for prod and unknown envs.
  private lazy var captureProtectionEnabled: Bool = {
    let env = (NSClassFromString("RNCConfig") as? NSObject.Type)?
      .perform(NSSelectorFromString("envFor:"), with: "APP_ENV")?
      .takeUnretainedValue() as? String
    return env != "dev" && env != "tst"
  }()

  private func showPrivacyOverlay() {
    guard captureProtectionEnabled, privacyOverlay == nil, let window = window else { return }
    let overlay = makePrivacyOverlay()
    window.addSubview(overlay)
    window.bringSubviewToFront(overlay)
    privacyOverlay = overlay
  }

  private func hidePrivacyOverlay() {
    privacyOverlay?.removeFromSuperview()
    privacyOverlay = nil
  }

  func applicationWillResignActive(_ application: UIApplication) {
    // Must be synchronous. This is the last point before iOS takes the snapshot;
    // anything deferred to the next runloop tick is already too late.
    showPrivacyOverlay()
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    // Do not uncover while a recording is still running — returning to the app
    // mid-recording is precisely when the card screen would be captured.
    guard !UIScreen.main.isCaptured else { return }
    hidePrivacyOverlay()
  }

  @objc private func screenCaptureDidChange() {
    if UIScreen.main.isCaptured {
      showPrivacyOverlay()
    } else if UIApplication.shared.applicationState == .active {
      hidePrivacyOverlay()
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
