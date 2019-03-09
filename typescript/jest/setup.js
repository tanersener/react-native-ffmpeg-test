jest.mock('react-native-ffmpeg', () => {
    return {
        execute: jest.fn(),
        executeWithArguments: jest.fn(),
        getPackageName: jest.fn(),
        getExternalLibraries: jest.fn(),
        getLastReturnCode: jest.fn(),
        getLastCommandOutput: jest.fn(),
        setFontDirectory: jest.fn(),
        setFontconfigConfigurationPath: jest.fn(),
        enableLogCallback: jest.fn(),
        getLastReceivedStatistics: jest.fn(),
        getMediaInformation: jest.fn(),
        enableStatisticsCallback: jest.fn()
    };
});

jest.mock('react-native-fs', () => {
    return {
        CachesDirectoryPath: jest.fn(),
        MainBundlePath: jest.fn(),
        copyFileAssets: jest.fn(),
    }
});

jest.mock('react-navigation', () => {
    return {
        createAppContainer: jest.fn(),
        createBottomTabNavigator: jest.fn(),
    }
});
