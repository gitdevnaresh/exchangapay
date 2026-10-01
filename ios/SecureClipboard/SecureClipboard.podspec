# Local-only, expiring clipboard writes for secrets (local pod, like DeviceSecurity).
Pod::Spec.new do |s|
  s.name         = "SecureClipboard"
  s.version      = "1.0.0"
  s.summary      = "Local-only, expiring pasteboard writes"
  s.homepage     = "https://exchangapay.com"
  s.license      = { :type => "Proprietary" }
  s.author       = { "Exchanga Pay" => "dev@exchangapay.com" }
  s.source       = { :path => "." }

  s.platforms    = { :ios => min_ios_version_supported }
  s.source_files = "*.{h,m}"

  s.dependency "React-Core"
end
