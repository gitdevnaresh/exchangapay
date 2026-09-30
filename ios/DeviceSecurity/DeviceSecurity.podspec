# Native jailbreak / anti-debug detection (local pod, like AppAttest).
Pod::Spec.new do |s|
  s.name         = "DeviceSecurity"
  s.version      = "1.0.0"
  s.summary      = "Native jailbreak / hook / debugger detection"
  s.homepage     = "https://exchangapay.com"
  s.license      = { :type => "Proprietary" }
  s.author       = { "Exchanga Pay" => "dev@exchangapay.com" }
  s.source       = { :path => "." }

  s.platforms    = { :ios => min_ios_version_supported }
  s.source_files = "*.{h,m}"

  s.dependency "React-Core"
end
