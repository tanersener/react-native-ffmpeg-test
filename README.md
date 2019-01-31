# react-native-ffmpeg-test
test applications for [react-native-ffmpeg](https://github.com/tanersener/react-native-ffmpeg)

All applications provide the same functionality; performs command execution and video encoding operations. The difference between them is IOS 
dependency management mechanism applied.

**1.** `default` -> Generic `react-native-ffmpeg` integration
  - Using `cocoapods` to download IOS dependencies
  - `cocoapods` not allowed to manage `React` IOS dependencies. `React` dependencies managed manually inside `Xcode`
  - Not using frameworks.
  - Podfile
```
platform :ios, '9.3'

target "ReactNativeFFmpegTest" do

  pod 'React', :path => '../node_modules/react-native', :subspecs => [
    'Core',
    'jschelpers',
    'cxxreact',
    'CxxBridge', # Include this for RN >= 0.47
    'DevSupport', # Include this to enable In-App Devmenu if RN >= 0.43
    'RCTText',
    'RCTImage',
    'RCTNetwork',
    'RCTActionSheet',
    'RCTAnimation',
    'RCTWebSocket', # needed for debugging
  ]

  # To use CocoaPods with React Native, you need to add this specific Yoga spec as well
  pod "yoga", :path => "../node_modules/react-native/ReactCommon/yoga"

  # Third party deps
  pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
  pod 'Folly', :podspec => '../node_modules/react-native/third-party-podspecs/Folly.podspec'
  pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'

  pod 'react-native-ffmpeg', :podspec => '../node_modules/react-native-ffmpeg/ios/react-native-ffmpeg.podspec'

end

# do not allow Cocoapods to manage React dependencies
post_install do |installer|
    installer.pods_project.targets.each do |target|
      targets_to_ignore = %w(React yoga)
      if targets_to_ignore.include? target.name
        target.remove_from_project
      end
    end
end
```

**2.** `ios-frameworks` -> IOS only `react-native-ffmpeg` integration
  - IOS only
  - Using `cocoapods` to download IOS dependencies
  - Allows `cocoapods` to manage `React` IOS dependencies
  - Using frameworks.
  - Podfile
```
platform :ios, '9.3'

use_frameworks!

target "ReactNativeFFmpegIOSFrameworkTest" do

  pod 'React', :path => '../node_modules/react-native', :subspecs => [
    'Core',
    'jschelpers',
    'cxxreact',
    'CxxBridge', # Include this for RN >= 0.47
    'DevSupport', # Include this to enable In-App Devmenu if RN >= 0.43
    'RCTText',
    'RCTImage',
    'RCTNetwork',
    'RCTActionSheet',
    'RCTAnimation',
    'RCTWebSocket', # needed for debugging
  ]

  # To use CocoaPods with React Native, you need to add this specific Yoga spec as well
  pod "yoga", :path => "../node_modules/react-native/ReactCommon/yoga"

  # Third party deps
  pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
  pod 'Folly', :podspec => '../node_modules/react-native/third-party-podspecs/Folly.podspec'
  pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'

  pod 'react-native-ffmpeg', :podspec => '../node_modules/react-native-ffmpeg/ios/react-native-ffmpeg.podspec'

end

```