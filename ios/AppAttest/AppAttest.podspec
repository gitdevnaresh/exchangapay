#
# H-04 — Apple App Attest bridge.
#
# Shipped as a local development pod rather than as loose files in the Xcode
# project: `pod install` wires it up reproducibly, and nobody has to hand-edit
# project.pbxproj, where a mistake corrupts the project for everyone.
#
require "json"

Pod::Spec.new do |s|
  s.name         = "AppAttest"
  s.version      = "1.0.0"
  s.summary      = "Apple App Attest bridge for device attestation (H-04)"
  s.description  = <<-DESC
    Obtains a hardware-backed attestation or assertion from Apple's App Attest
    service and hands it to JS, which forwards it to the backend for
    verification. Inert until the App Attest entitlement is present on the
    provisioning profile.
  DESC
  s.homepage     = "https://exchangapay.com"
  s.license      = { :type => "Proprietary" }
  s.author       = { "Exchanga Pay" => "dev@exchangapay.com" }
  s.source       = { :path => "." }

  # App Attest itself needs iOS 14; the module compiles below that and rejects at
  # runtime, so the pod tracks the app's own floor rather than raising it.
  s.platforms    = { :ios => min_ios_version_supported }
  s.source_files = "*.{h,m}"
  s.frameworks   = "DeviceCheck"

  s.dependency "React-Core"
end
