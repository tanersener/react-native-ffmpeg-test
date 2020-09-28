import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {createAppContainer, createBottomTabNavigator} from 'react-navigation'
import {LogLevel, RNFFmpeg, RNFFmpegConfig, RNFFprobe} from 'react-native-ffmpeg';
import RNFS from 'react-native-fs';
import {VideoUtil} from './VideoUtil';
import {TestUtil} from './Test';

async function executeFFmpeg(command) {
    await RNFFmpeg.execute(command).then(rc => console.log(`FFmpeg process exited with rc ${rc}.`));
}

async function executeFFmpegWithArguments(commandArguments) {
    await RNFFmpeg.executeWithArguments(commandArguments).then(rc => console.log(`FFmpeg process exited with rc ${rc}`));
}

async function executeFFmpegAsync(command) {
    await RNFFmpeg.executeAsync(command).then(executionId => console.log(`FFmpeg process started with executionId ${executionId}.`));
}

async function executeFFmpegAsyncAndCancel(command) {
    await RNFFmpeg.executeAsync(command).then(executionId => {
        console.log(`FFmpeg process started with executionId ${executionId}.`);
        // executeFFmpegCancel();
        executeFFmpegCancelExecution(executionId);
    });
}

async function executeFFmpegAsyncAndListExecutions(command) {
    await RNFFmpeg.executeAsync(command).then(executionId => console.log(`FFmpeg process started with executionId ${executionId}.`));
    listExecutions();
}

async function executeFFmpegAsyncWithArguments(commandArguments) {
    await RNFFmpeg.executeAsyncWithArguments(commandArguments).then(executionId => console.log(`FFmpeg process started with executionId ${executionId}.`));
}

async function executeFFmpegCancel() {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    await RNFFmpeg.cancel();
    console.log("FFmpeg operation cancelled");
}

async function executeFFmpegCancelExecution(executionId) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    await RNFFmpeg.cancelExecution(executionId);
    console.log(`FFmpeg operation cancelled for ${executionId}`);
}

async function listExecutions() {
    RNFFmpeg.listExecutions().then(executionList => {
        executionList.forEach(execution => {
            console.log(`Execution id is ${execution.executionId}`);
            console.log(`Execution start time is ` + new Date(execution.startTime));
            console.log(`Execution command is ${execution.command}`);
        });
    });
}

async function executeFFprobe(command) {
    await RNFFprobe.execute(command).then(rc => console.log(`FFprobe process exited with rc ${rc}`));
}

async function executeFFprobeWithArguments(commandArguments) {
    await RNFFprobe.executeWithArguments(commandArguments).then(rc => console.log(`FFprobe process exited with rc ${rc}`));
}

function testConfigFunctions() {
    RNFFmpegConfig.getLogLevel().then(level => console.log(`Current log level is ${RNFFmpegConfig.logLevelToString(level)}`));
    console.log("Setting log level to AV_LOG_INFO.");
    RNFFmpegConfig.setLogLevel(LogLevel.AV_LOG_INFO);
    RNFFmpegConfig.getLogLevel().then(level => console.log(`New log level is ${RNFFmpegConfig.logLevelToString(level)}`));

    RNFFmpegConfig.setFontDirectory(RNFS.CachesDirectoryPath, {
        my_easy_font_name: "my complex font name",
        my_font_name_2: "my complex font name"
    });
    console.log("Registered cache directory as font directory.");

    RNFFmpegConfig.setFontconfigConfigurationPath(RNFS.CachesDirectoryPath);
    console.log("Registered cache directory as fontconfig directory.");

    RNFFmpegConfig.getPackageName().then(packageName => console.log(`Package name: ${packageName}`));
    RNFFmpegConfig.getExternalLibraries().then(result => console.log(`External libraries: ${result}`));
    RNFFmpegConfig.getLastReturnCode().then(rc => console.log(`Last return code: ${rc}`));
    RNFFmpegConfig.getLastCommandOutput().then(output => console.log(`Last command output: ${output}`));
    RNFFmpegConfig.registerNewFFmpegPipe().then(pipe => console.log(`Pipe path is ${pipe}`));
    RNFFmpegConfig.getLastReceivedStatistics().then(statistics =>
        console.log('Last statistics; executionId: ' + statistics.executionId + ', frame: ' + statistics.videoFrameNumber.toFixed(1) + ', fps: ' + statistics.videoFps.toFixed(1) + ', quality: ' + statistics.videoQuality.toFixed(1) + ', size: ' + statistics.size + ', time: ' + statistics.time)
    );
}

function testSetEnvironmentVariable() {
    var now = new Date();
    var today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    console.log("Setting FFREPORT environment variables.");
    RNFFmpegConfig.setEnvironmentVariable("FFREPORT", `file=${RNFS.CachesDirectoryPath}/${today}-ffreport.txt`);
}

class CommandScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            command: '',
            commandOutput: ''
        };

        RNFFmpegConfig.getFFmpegVersion().then(version => console.log(`FFmpeg version: ${version}`));
        RNFFmpegConfig.getPlatform().then(platform => console.log(`Platform: ${platform}`));
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
                        onPress={this.runFFmpeg}>
                        <Text style={commandScreenStyles.buttonTextStyle}>RUN FFMPEG</Text>
                    </TouchableOpacity>
                </View>
                <View style={commandScreenStyles.runViewStyle}>
                    <TouchableOpacity
                        style={commandScreenStyles.runButtonStyle}
                        onPress={this.runFFprobe}>
                        <Text style={commandScreenStyles.buttonTextStyle}>RUN FFPROBE</Text>
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
        this.setState({commandOutput: this.state.commandOutput + logData.executionId + ":" + logData.level + ":" + logData.log});
    };

    clearLog() {
        this.setState({commandOutput: ''});
    }

    runWithArguments = () => {
        RNFFmpegConfig.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.clearLog();

        console.log("Testing COMMAND with ARGUMENTS.");

        executeFFmpegWithArguments(["-v", "debug", "-version"]);

        console.log("FFmpeg process started with arguments \"-v debug -version\"");
    };

    runFFmpeg = () => {
        RNFFmpegConfig.enableLogCallback(this.logCallback);

        testConfigFunctions();
        testSetEnvironmentVariable();

        // CLEAR COMMAND OUTPUT FIRST
        this.clearLog();

        console.log('Testing parseArguments.');

        TestUtil.testParseArguments();

        console.log("Testing FFmpeg COMMAND.");

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            executeFFmpeg(this.state.command);
            console.log(`FFmpeg process started with command ${this.state.command}.`);
        } else {
            console.log(`Command is empty.`);
        }
    };

    runAsyncFFmpeg = () => {
        RNFFmpegConfig.enableLogCallback(this.logCallback);

        // CLEAR COMMAND OUTPUT FIRST
        this.clearLog();

        console.log("Testing Async FFmpeg COMMAND.");

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            executeFFmpegAsync(RNFFmpeg.parseArguments(this.state.command));
            console.log(`FFmpeg process started with command ${this.state.command}.`);
        } else {
            console.log(`Command is empty.`);
        }
    };

    runFFprobe = () => {
        RNFFmpegConfig.enableLogCallback(this.logCallback);

        testConfigFunctions();
        testSetEnvironmentVariable();

        // CLEAR COMMAND OUTPUT FIRST
        this.clearLog();

        console.log('Testing parseArguments.');

        TestUtil.testParseArguments();

        console.log("Testing FFprobe COMMAND.");

        if ((this.state.command !== undefined) && (this.state.command.length > 0)) {
            executeFFprobe(this.state.command);
            console.log(`FFmpeg process started with command ${this.state.command}.`);
        } else {
            console.log(`Command is empty.`);
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
        console.log('Statistics; executionId: ' + statisticsData.executionId + ', frame: ' + statisticsData.videoFrameNumber.toFixed(1) + ', fps: ' + statisticsData.videoFps.toFixed(1) + ', quality: ' + statisticsData.videoQuality.toFixed(1) +
            ', size: ' + statisticsData.size + ', time: ' + statisticsData.time);
    };

    executeCallback = (executeData) => {
        console.log(`Async execution ${executeData.executionId} ended with ${executeData.returnCode}`);
        if (executeData.returnCode === 0) {
            this.testGetMediaInformation();
        }
    };

    clearLog() {
        this.setState({encodeOutput: ''});
    }

    testGetMediaInformation = () => {
        RNFFprobe.getMediaInformation(RNFS.CachesDirectoryPath + '/video.mp4').then(info => {
            console.log('\n');
            console.log('Result: ' + JSON.stringify(info));
            console.log('Media Information');
            console.log('Path: ' + info.format.filename);
            console.log('Format: ' + info.format.format_name);
            console.log('Duration: ' + info.format.duration);
            console.log('Start time: ' + info.format.start_time);
            console.log('Bitrate: ' + info.format.bit_rate);
            if (info.streams) {
                for (var i = 0; i < info.streams.length; i++) {
                    console.log('Stream id: ' + info.streams[i].index);
                    console.log('Stream type: ' + info.streams[i].codec_type);
                    console.log('Stream codec: ' + info.streams[i].codec_name);
                    console.log('Stream format: ' + info.streams[i].pix_fmt);
                    console.log('Stream full format: ' + info.streams[i].format_name);
                    console.log('Stream width: ' + info.streams[i].width);
                    console.log('Stream height: ' + info.streams[i].height);
                    console.log('Stream bitrate: ' + info.streams[i].bit_rate);
                    console.log('Stream sar: ' + info.streams[i].sample_aspect_ratio);
                    console.log('Stream dar: ' + info.streams[i].display_aspect_ratio);
                    console.log('Stream average frame rate: ' + info.streams[i].avg_frame_rate);
                    console.log('Stream real frame rate: ' + info.streams[i].r_frame_rate);
                    console.log('Stream time base: ' + info.streams[i].time_base);
                    console.log('Stream codec time base: ' + info.streams[i].codec_time_base);

                    if (info.streams[i].tags) {
                        console.log('Stream tags language: ' + info.streams[i].tags.language);
                        console.log('Stream tags handler name: ' + info.streams[i].tags.handler_name);
                    }
                }
            }
            console.log('\n');
        });
    };

    createVideo = () => {
        RNFFmpegConfig.enableLogCallback(this.logCallback);
        RNFFmpegConfig.enableStatisticsCallback(this.statisticsCallback);
        RNFFmpegConfig.enableExecuteCallback(this.executeCallback);

        this.clearLog();

        console.log("Testing Encoding VIDEO.");

        testConfigFunctions();
        testSetEnvironmentVariable();

        VideoUtil.resourcePath('colosseum.jpg').then((image1) => {
            console.log('Saved resource colosseum.jpg to ' + image1);

            VideoUtil.resourcePath('pyramid.jpg').then((image2) => {
                console.log('Saved resource pyramid.jpg to ' + image2);

                VideoUtil.resourcePath('tajmahal.jpg').then((image3) => {
                    console.log('Saved resource tajmahal.jpg to ' + image3);

                    var videoPath = RNFS.CachesDirectoryPath + '/video.mp4';

                    console.log("FFmpeg process started with arguments");
                    let command = VideoUtil.generateEncodeVideoScript(image1, image2, image3, videoPath, this.state.videoCodec, '');

                    executeFFmpegAsyncAndListExecutions(command);
                    // executeFFmpegAsyncAndCancel(command);
                    // executeFFmpegAsyncWithArguments(RNFFmpeg.parseArguments(command));
                    // this.testGetMediaInformation();

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

export default class Main extends React.Component {
    render() {
        return (
            <AppNavigator/>
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
        width: 120,
        height: 38,
        backgroundColor: '#2ecc71',
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10
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
