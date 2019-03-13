import * as React from 'react'
import {Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {createAppContainer, createBottomTabNavigator} from 'react-navigation'
import { LogLevel, LogMessage, RNFFmpeg, Statistics} from 'react-native-ffmpeg'
import * as RNFS from 'react-native-fs'
import {VideoUtil} from './VideoUtil'

async function execute(command: string) {
    await RNFFmpeg.execute(command, ' ').then(result => console.log('FFmpeg process exited with rc ' + result.rc));
}

async function executeWithDelimiter(command: string, delimiter: string) {
    await RNFFmpeg.execute(command, delimiter).then(result => console.log('FFmpeg process exited with rc ' + result.rc));
}

async function executeWithArguments(commandArguments: string[]) {
    await RNFFmpeg.executeWithArguments(commandArguments).then(data => {
        console.log('FFmpeg process exited with rc ' + data.rc)
    })
}

class CommandScreen extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            command: '',
            commandOutput: ''
        }
    }

    render() {
        return (
            <View style={commandScreenStyles.screenStyle}>
                <View style={commandScreenStyles.headerViewStyle}>
                    <Text style={commandScreenStyles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={commandScreenStyles.commandTextViewStyle}>
                    <TextInput
                        style={commandScreenStyles.commandTextInputStyle}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder='Enter command'
                        underlineColorAndroid='transparent'
                        onChangeText={this.updateCommand}
                        value={this.state.command}
                    />
                </View>
                <View style={commandScreenStyles.runViewStyle}>
                    <TouchableOpacity style={commandScreenStyles.runButtonStyle} onPress={this.run}>
                        <Text style={commandScreenStyles.buttonTextStyle}>RUN</Text>
                    </TouchableOpacity>
                </View>
                <View style={commandScreenStyles.commandOutputViewStyle}>
                    <ScrollView style={commandScreenStyles.commandOutputScrollViewStyle}>
                        <Text style={commandScreenStyles.commandOutputTextStyle}>{this.state.commandOutput}</Text>
                    </ScrollView>
                </View>
            </View>
        );
    }

    private updateCommand = (command) => {
        return this.setState({command});
    };

    logCallback = (logData: LogMessage) => {
        this.setState({commandOutput: this.state.commandOutput + logData.log});
    };

    setLogLevel() {
        console.log('Setting log level to AV_LOG_DEBUG.');

        RNFFmpeg.setLogLevel(LogLevel.AV_LOG_DEBUG);
    }

    printExternalLibraries() {
        console.log('Printing external libraries.');

        RNFFmpeg.getPackageName().then(result => {
            console.log('Package name: ' + result.packageName);
        });

        RNFFmpeg.getExternalLibraries().then(result => {
            console.log('External libraries: ' + result);
        });
    }

    printLastCommandResult() {
        console.log('Printing last command result.');

        RNFFmpeg.getLastReturnCode().then(result => {
            console.log('Last return code: ' + result.lastRc);
        });

        RNFFmpeg.getLastCommandOutput().then(result => {
            console.log('Last command output: ' + result.lastCommandOutput);
        });
    }

    setCustomFontDirectory() {
        console.log('Registering cache directory as font directory.');

        RNFFmpeg.setFontDirectory(RNFS.CachesDirectoryPath, {
            my_easy_font_name: 'my complex font name',
            my_font_name_2: 'my complex font name'
        });
    }

    setFontconfigConfguration() {
        console.log('Registering cache directory as fontconfig directory.');

        RNFFmpeg.setFontconfigConfigurationPath(RNFS.CachesDirectoryPath);
    }

    runWithDelimiter = () => {
        this.setLogLevel();

        this.printExternalLibraries();

        this.printLastCommandResult();

        RNFFmpeg.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.setState({commandOutput: ''});

        console.log('Testing COMMAND with DELIMITER.');

        console.log('FFmpeg process started with command and delimiter.');
        console.log(this.state.command);

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            executeWithDelimiter(this.state.command, '%');
        }

    };

    runWithArguments = () => {
        RNFFmpeg.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.setState({commandOutput: ''});

        console.log('Testing COMMAND with ARGUMENTS.');

        console.log('FFmpeg process started with arguments');

        executeWithArguments(['-v', 'debug', '-version']);
    };

    run = () => {

        RNFFmpeg.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.setState({commandOutput: ''});

        this.setFontconfigConfguration();
        this.setCustomFontDirectory();

        console.log('Testing COMMAND.');

        console.log('FFmpeg process started with command.');
        console.log(this.state.command);

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            execute(this.state.command);
        }
    };

}

class VideoScreen extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            videoCodec: 'mpeg4',
            encodeOutput: ''
        };
    }

    render() {
        return (
            <View style={videoScreenStyles.screenStyle}>
                <View style={videoScreenStyles.headerViewStyle}>
                    <Text style={videoScreenStyles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={videoScreenStyles.videoCodecTextViewStyle}>
                    <TextInput
                        style={videoScreenStyles.videoCodecTextInputStyle}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder='video codec'
                        underlineColorAndroid='transparent'
                        onChangeText={this.updateVideoCodec}
                        value={this.state.videoCodec}
                    />
                </View>
                <View style={videoScreenStyles.createViewStyle}>
                    <TouchableOpacity style={videoScreenStyles.createButtonStyle} onPress={this.createVideo}>
                        <Text style={videoScreenStyles.buttonTextStyle}>CREATE</Text>
                    </TouchableOpacity>
                </View>
                <View style={commandScreenStyles.commandOutputViewStyle}>
                    <ScrollView style={commandScreenStyles.commandOutputScrollViewStyle}>
                        <Text style={commandScreenStyles.commandOutputTextStyle}>{this.state.encodeOutput}</Text>
                    </ScrollView>
                </View>
            </View>
        );
    }

    private updateVideoCodec = (videoCodec) => {
        return this.setState({videoCodec});
    };

    logCallback = (logData) => {
        this.setState({encodeOutput: this.state.encodeOutput + logData.log});
    };

    statisticsCallback = (statisticsData: Statistics) => {
        console.log(`Statistics; frame: ${statisticsData.videoFrameNumber.toFixed(1)}, fps: ${statisticsData.videoFps.toFixed(1)}, quality: ${statisticsData.videoQuality.toFixed(1)}, size: ${statisticsData.size}, time: ${statisticsData.time}`);
    };

    getLastReceivedStatistics = () => {
        RNFFmpeg.getLastReceivedStatistics().then(stats => console.log('Stats: ' + JSON.stringify(stats)));
    };

    getMediaInformation = () => {
        RNFFmpeg.getMediaInformation(RNFS.CachesDirectoryPath + '/video.mp4').then(info => {
            console.log('\n');
            console.log('Result: ' + JSON.stringify(info));
            console.log('Media Information');
            console.log('Path: ' + info.path);
            console.log('Format: ' + info.format);
            console.log('Duration: ' + info.duration);
            console.log('Start time: ' + info.startTime);
            console.log('Bitrate: ' + info.bitrate);
            if (info.streams) {
                for (const stream of info.streams) {
                    console.log('Stream id: ' + stream.index);
                    console.log('Stream type: ' + stream.type);
                    console.log('Stream codec: ' + stream.codec);
                    console.log('Stream full codec: ' + stream.fullCodec);
                    console.log('Stream format: ' + stream.format);
                    console.log('Stream full format: ' + stream.fullFormat);
                    console.log('Stream width: ' + stream.width);
                    console.log('Stream height: ' + stream.height);
                    console.log('Stream bitrate: ' + stream.bitrate);
                    console.log('Stream sample rate: ' + stream.sampleRate);
                    console.log('Stream sample format: ' + stream.sampleFormat);
                    console.log('Stream channel layout: ' + stream.channelLayout);
                    console.log('Stream sar: ' + stream.sampleAspectRatio);
                    console.log('Stream dar: ' + stream.displayAspectRatio);
                    console.log('Stream average frame rate: ' + stream.averageFrameRate);
                    console.log('Stream real frame rate: ' + stream.realFrameRate);
                    console.log('Stream time base: ' + stream.timeBase);
                    console.log('Stream codec time base: ' + stream.codecTimeBase);
                }
            }
            console.log('\n');
        });
    };

    createVideo = () => {
        RNFFmpeg.enableLogCallback(this.logCallback);
        RNFFmpeg.enableStatisticsCallback(this.statisticsCallback);

        console.log('Testing VIDEO.');

        VideoUtil.resourcePath('colosseum.jpg').then((image1) => {
            console.log('Saved resource colosseum.jpg to ' + image1);

            VideoUtil.resourcePath('pyramid.jpg').then((image2) => {
                console.log('Saved resource pyramid.jpg to ' + image2);

                VideoUtil.resourcePath('tajmahal.jpg').then((image3) => {
                    console.log('Saved resource tajmahal.jpg to ' + image3);

                    const videoPath = RNFS.CachesDirectoryPath + '/video.mp4';

                    console.log('FFmpeg process started with arguments');
                    const command = VideoUtil.generateEncodeVideoScript(image1, image2, image3, videoPath, this.state.videoCodec, '');
                    console.log(command);

                    execute(command).then(rc => {
                        this.getMediaInformation();
                    });

                }).catch((err) => {
                    console.log('Failed to save resource: tajmahal.jpg');
                    console.log(err.message, err.code);
                });
            }).catch((err) => {
                console.log('Failed to save resource: pyramid.jpg');
                console.log(err.message, err.code);
            });
        }).catch((err) => {
            console.log('Failed to save resource: colosseum.jpg');
            console.log(err.message, err.code);
        })
    };

}

const TabNavigator = createBottomTabNavigator(
    {
        COMMAND: CommandScreen,
        VIDEO: VideoScreen,
    },
    {
        tabBarOptions: {
            activeTintColor: 'dodgerblue',
            inactiveTintColor: 'gray',
            showIcon: false,
            labelStyle: {
                fontSize: 12,
                fontWeight: 'bold',
                flex: 1,
                textAlign: 'center',
                marginBottom: 12
            }
        },
    }
);

const AppNavigator = createAppContainer(TabNavigator);

export default class Main extends React.Component<any, any> {
    navigator;

    render() {
        return (
            <AppNavigator
                ref={nav => {
                    this.navigator = nav;
                }}
            />
        );
    }
}

const commandScreenStyles = StyleSheet.create({
    screenStyle: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        marginTop: Platform.select({ios: 20, android: 0})
    },
    headerViewStyle: {
        paddingTop: 16,
        paddingBottom: 10,
        backgroundColor: '#F46842'
    },
    headerTextStyle: {
        alignSelf: 'center',
        height: 32,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        borderColor: 'lightgray',
        borderRadius: 5,
        borderWidth: 0
    },
    commandTextViewStyle: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingRight: 20,
        paddingLeft: 20
    },
    commandTextInputStyle: {
        height: 36,
        fontSize: 12,
        borderColor: '#3498db',
        borderRadius: 5,
        borderWidth: 1
    },
    runViewStyle: {
        alignSelf: 'center',
        paddingBottom: 20
    },
    runButtonStyle: {
        justifyContent: 'center',
        width: 100,
        height: 38,
        backgroundColor: '#2ecc71',
        borderRadius: 5
    },
    buttonTextStyle: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
    },
    commandOutputViewStyle: {
        padding: 20
    },
    commandOutputScrollViewStyle: {
        padding: 4,
        backgroundColor: '#f1c40f',
        borderColor: '#f39c12',
        borderRadius: 5,
        borderWidth: 1,
        height: 200,
        maxHeight: 200
    },
    commandOutputTextStyle: {
        color: 'black'
    }
});

const videoScreenStyles = StyleSheet.create({
    screenStyle: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        marginTop: Platform.select({ios: 20, android: 0})
    },
    headerViewStyle: {
        paddingTop: 16,
        paddingBottom: 10,
        backgroundColor: '#F46842'
    },
    headerTextStyle: {
        alignSelf: 'center',
        height: 32,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        borderColor: 'lightgray',
        borderRadius: 5,
        borderWidth: 0
    },
    videoCodecTextViewStyle: {
        paddingTop: 40,
        paddingBottom: 40,
        width: 100,
        alignSelf: 'center'
    },
    videoCodecTextInputStyle: {
        height: 36,
        fontSize: 12,
        borderColor: '#3498db',
        borderRadius: 5,
        borderWidth: 1,
        textAlign: 'center'
    },
    createViewStyle: {
        alignSelf: 'center',
        paddingBottom: 20
    },
    createButtonStyle: {
        justifyContent: 'center',
        width: 100,
        height: 38,
        backgroundColor: '#2ecc71',
        borderRadius: 5
    },
    buttonTextStyle: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
    }
});
