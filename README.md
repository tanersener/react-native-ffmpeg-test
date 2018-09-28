# react-native-ffmpeg-test
test applications for [react-native-ffmpeg](https://github.com/tanersener/react-native-ffmpeg)


**1.** `default` -> Generic `react-native-ffmpeg` integration
  - Using `cocoapods` to download IOS dependencies
  - Allows `cocoapods` to manage `React` IOS dependencies
  - Not using frameworks.

**2.** `manual-dependency` -> Generic `react-native-ffmpeg` integration
  - Using `cocoapods` to download IOS dependencies
  - `cocoapods` not allowed to manage `React` IOS dependencies. `React` dependencies managed manually inside `Xcode`
  - Not using frameworks.

**3.** `ios-frameworks` -> IOS only `react-native-ffmpeg` integration
  - IOS only
  - Using `cocoapods` to download IOS dependencies
  - `cocoapods` not allowed to manage `React` IOS dependencies. `React` dependencies managed manually inside `Xcode`
  - **Using** frameworks.
  - Not stable, still under development

