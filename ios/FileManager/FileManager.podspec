# Documents-folder lookup for document notifications (local pod, like SecureClipboard).
Pod::Spec.new do |s|
  s.name         = "FileManager"
  s.version      = "1.0.0"
  s.summary      = "Documents directory lookup for document notifications"
  s.homepage     = "https://exchangapay.com"
  s.license      = { :type => "Proprietary" }
  s.author       = { "Exchanga Pay" => "dev@exchangapay.com" }
  s.source       = { :path => "." }

  s.platforms    = { :ios => min_ios_version_supported }
  s.source_files = "*.{h,m}"

  s.dependency "React-Core"
end
