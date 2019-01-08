import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from 'react-navigation';
import {RNFFmpeg} from 'react-native-ffmpeg';
import RNFS from 'react-native-fs';
import {VideoUtil} from './VideoUtil';

async function execute(command) {
    await RNFFmpeg.execute(command, " ").then(result => console.log("FFmpeg process exited with rc " + result.rc));
}

async function executeWithDelimiter(command, delimiter) {
    await RNFFmpeg.execute(command, delimiter).then(result => console.log("FFmpeg process exited with rc " + result.rc));
}

async function executeWithArguments(commandArguments) {
    await RNFFmpeg.executeWithArguments(commandArguments).then(data => {
        console.log("FFmpeg process exited with rc " + data.rc);
    });
}

class CommandScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            command: '',
            commandOutput: ''
        };
    }

    render() {
        return (
            <View style={commandScreenStyles.screenStyle}>
                <View style={commandScreenStyles.headerViewStyle}>
                    <Text
                        style={commandScreenStyles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={commandScreenStyles.commandTextViewStyle}>
                    <TextInput
                        style={commandScreenStyles.commandTextInputStyle}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder="Enter command"
                        underlineColorAndroid="transparent"
                        onChangeText={(command) => this.setState({command})}
                        value={this.state.command}
                    />
                </View>
                <View style={commandScreenStyles.runViewStyle}>
                    <TouchableOpacity
                        style={commandScreenStyles.runButtonStyle}
                        onPress={this.run}>
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
    };

    logCallback = (logData) => {
        this.setState({commandOutput: this.state.commandOutput + logData.log});
    };

    printExternalLibraries() {
        console.log("Printing external libraries.");

        RNFFmpeg.getPackageName().then(result => {
            console.log("Package name: " + result.packageName);
        });

        RNFFmpeg.getExternalLibraries().then(result => {
            console.log("External libraries: " + result);
        });
    }

    printLastCommandResult() {
        console.log("Printing last command result.");

        RNFFmpeg.getLastReturnCode().then(result => {
            console.log("Last return code: " + result.lastRc);
        });

        RNFFmpeg.getLastCommandOutput().then(result => {
            console.log("Last command output: " + result.lastCommandOutput);
        });
    }

    runWithDelimiter = () => {
        this.printExternalLibraries();

        this.printLastCommandResult();

        RNFFmpeg.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.setState({commandOutput: ''});

        console.log("Testing COMMAND with DELIMITER.");

        console.log("FFmpeg process started with command and delimiter.");
        console.log(this.state.command);

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            executeWithDelimiter(this.state.command, "%");
        }

    };

    runWithArguments = () => {
        RNFFmpeg.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.setState({commandOutput: ''});

        console.log("Testing COMMAND with ARGUMENTS.");

        console.log("FFmpeg process started with arguments");

        executeWithArguments(["-v", "debug", "-version"]);
    };

    run = () => {

        RNFFmpeg.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.setState({commandOutput: ''});

        console.log("Testing COMMAND.");

        console.log("FFmpeg process started with command.");
        console.log(this.state.command);

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            execute(this.state.command);
        }
    };

}

class VideoScreen extends React.Component {
    constructor(props) {
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
                    <Text
                        style={videoScreenStyles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={videoScreenStyles.videoCodecTextViewStyle}>
                    <TextInput
                        style={videoScreenStyles.videoCodecTextInputStyle}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder="video codec"
                        underlineColorAndroid="transparent"
                        onChangeText={(videoCodec) => this.setState({videoCodec})}
                        value={this.state.videoCodec}
                    />
                </View>
                <View style={videoScreenStyles.createViewStyle}>
                    <TouchableOpacity
                        style={videoScreenStyles.createButtonStyle}
                        onPress={this.createVideo}>
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

    logCallback = (logData) => {
        this.setState({encodeOutput: this.state.encodeOutput + logData.log});
    };

    statisticsCallback = (statisticsData) => {
        console.log('Statistics; frame: ' + statisticsData.videoFrameNumber.toFixed(1) + ', fps: ' + statisticsData.videoFps.toFixed(1) + ', quality: ' + statisticsData.videoQuality.toFixed(1) +
            ', size: ' + statisticsData.size + ', time: ' + statisticsData.time);
    };

    getMediaInformation = () => {
        RNFFmpeg.getMediaInformation(RNFS.CachesDirectoryPath + '/video.mp4').then(result => {
            console.log('\n');
            console.log('Result: ' + JSON.stringify(result));
            console.log('Media Information');
            if (result.path) {
                console.log('Path: ' + result.path);
            }
            if (result.format) {
                console.log('Format: ' + result.format);
            }
            if (result.duration) {
                console.log('Duration: ' + result.duration);
            }
            if (result.startTime) {
                console.log('Start time: ' + result.startTime);
            }
            if (result.bitrate) {
                console.log('Bitrate: ' + result.bitrate);
            }
            if (result.streams) {
                for (var i = 0; i < result.streams.length; i++) {
                    if (result.streams[i].index) {
                        console.log('Stream id: ' + result.streams[i].index);
                    }
                    if (result.streams[i].type) {
                        console.log('Stream type: ' + result.streams[i].type);
                    }
                    if (result.streams[i].codec) {
                        console.log('Stream codec: ' + result.streams[i].codec);
                    }
                    if (result.streams[i].fullCodec) {
                        console.log('Stream full codec: ' + result.streams[i].fullCodec);
                    }
                    if (result.streams[i].format) {
                        console.log('Stream format: ' + result.streams[i].format);
                    }
                    if (result.streams[i].fullFormat) {
                        console.log('Stream full format: ' + result.streams[i].fullFormat);
                    }
                    if (result.streams[i].width) {
                        console.log('Stream width: ' + result.streams[i].width);
                    }
                    if (result.streams[i].height) {
                        console.log('Stream height: ' + result.streams[i].height);
                    }
                    if (result.streams[i].bitrate) {
                        console.log('Stream bitrate: ' + result.streams[i].bitrate);
                    }
                    if (result.streams[i].sampleRate) {
                        console.log('Stream sample rate: ' + result.streams[i].sampleRate);
                    }
                    if (result.streams[i].sampleFormat) {
                        console.log('Stream sample format: ' + result.streams[i].sampleFormat);
                    }
                    if (result.streams[i].channelLayout) {
                        console.log('Stream channel layout: ' + result.streams[i].channelLayout);
                    }
                    if (result.streams[i].sampleAspectRatio) {
                        console.log('Stream sar: ' + result.streams[i].sampleAspectRatio);
                    }
                    if (result.streams[i].displayAspectRatio) {
                        console.log('Stream dar: ' + result.streams[i].displayAspectRatio);
                    }
                    if (result.streams[i].averageFrameRate) {
                        console.log('Stream average frame rate: ' + result.streams[i].averageFrameRate);
                    }
                    if (result.streams[i].realFrameRate) {
                        console.log('Stream real frame rate: ' + result.streams[i].realFrameRate);
                    }
                    if (result.streams[i].timeBase) {
                        console.log('Stream time base: ' + result.streams[i].timeBase);
                    }
                    if (result.streams[i].codecTimeBase) {
                        console.log('Stream codec time base: ' + result.streams[i].codecTimeBase);
                    }
                }
            }
            console.log('\n');
        });
    };

    createVideo = () => {
        RNFFmpeg.enableLogCallback(this.logCallback);
        RNFFmpeg.enableStatisticsCallback(this.statisticsCallback);

        console.log("Testing VIDEO.");

        VideoUtil.resourcePath('colosseum.jpg').then((image1) => {
            console.log('Saved resource colosseum.jpg to ' + image1);

            VideoUtil.resourcePath('pyramid.jpg').then((image2) => {
                console.log('Saved resource pyramid.jpg to ' + image2);

                VideoUtil.resourcePath('tajmahal.jpg').then((image3) => {
                    console.log('Saved resource tajmahal.jpg to ' + image3);

                    var videoPath = RNFS.CachesDirectoryPath + '/video.mp4';

                    console.log("FFmpeg process started with arguments");
                    let command = VideoUtil.generateEncodeVideoScript(image1, image2, image3, videoPath, this.state.videoCodec, '');
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
        });
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
            showIcon: 'false',
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

export default class Main extends React.Component {
    render() {
        return <TabNavigator/>;
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
        alignSelf: "center",
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
        alignSelf: "center",
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
        textAlign: "center",
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
        alignSelf: "center",
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
        alignSelf: "center"
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
        alignSelf: "center",
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
        textAlign: "center",
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
    }
});
