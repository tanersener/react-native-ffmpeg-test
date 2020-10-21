import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {styles} from './style';
import {CONCURRENT_EXECUTION_TEST_TOOLTIP_TEXT} from './tooltip';
import {showPopup, Toast} from './popup';
import {
    enableLogCallback,
    enableStatisticsCallback,
    executeFFmpegAsync,
    executeFFmpegCancel,
    executeFFmpegCancelExecution,
    listExecutions
} from './react-native-ffmpeg-api-wrapper';
import {ffprint} from './util';
import VideoUtil from "./video-util";
import RNFS from "react-native-fs";

export default class ConcurrentExecutionTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            outputText: '',
            executionId1: 0,
            executionId2: 0,
            executionId3: 0
        };

        this.popupReference = React.createRef();
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', (_) => {
            this.clearLog();
            this.setActive();
        });
    }

    setActive() {
        ffprint("Concurrent Execution Tab Activated");
        enableLogCallback(this.logCallback);
        enableStatisticsCallback(undefined);
        showPopup(this.popupReference, CONCURRENT_EXECUTION_TEST_TOOLTIP_TEXT);
    }

    logCallback = (log) => {
        this.appendLog(log.message);
    };

    appendLog(logMessage) {
        this.setState({outputText: this.state.outputText + logMessage});
    };

    clearLog() {
        this.setState({outputText: ''});
    }

    encodeVideoOne = () => {
        this.encodeVideo(1);
    }

    encodeVideoTwo = () => {
        this.encodeVideo(2);
    }

    encodeVideoThree = () => {
        this.encodeVideo(3);
    }

    encodeVideo(buttonNumber) {
        let image1Path = VideoUtil.assetPath(VideoUtil.ASSET_1);
        let image2Path = VideoUtil.assetPath(VideoUtil.ASSET_2);
        let image3Path = VideoUtil.assetPath(VideoUtil.ASSET_3);
        let videoFile = this.getVideoFile(buttonNumber);
        ffprint(`Testing CONCURRENT EXECUTION for button ${buttonNumber}.`);

        let ffmpegCommand = VideoUtil.generateEncodeVideoScript(image1Path, image2Path, image3Path, videoFile, "mpeg4", "");

        executeFFmpegAsync(ffmpegCommand, completedExecution => {
                if (completedExecution.returnCode === 255) {
                    ffprint(`FFmpeg process ended with cancel for button ${buttonNumber} with executionId ${completedExecution.executionId}.`);
                } else {
                    ffprint(`FFmpeg process ended with rc ${completedExecution.returnCode} for button ${buttonNumber} with executionId ${completedExecution.executionId}.`);
                }
            }
        ).then(executionId => {
            ffprint(`Async FFmpeg process started for button ${buttonNumber} with arguments '${ffmpegCommand}' and executionId ${executionId}.`);
            switch (buttonNumber) {
                case 1:
                    this.setState({executionId1: executionId});
                    break;
                case 2:
                    this.setState({executionId2: executionId});
                    break;
                default:
                    this.setState({executionId3: executionId});
            }

            this.runListFFmpegExecutions();
        });
    }

    getVideoFile(buttonNumber) {
        return `${RNFS.CachesDirectoryPath}/video${buttonNumber}.mp4`;
    }

    runListFFmpegExecutions() {
        listExecutions();
    }

    runCancelOne = () => {
        this.runCancel(1)
    }

    runCancelTwo = () => {
        this.runCancel(2)
    }

    runCancelThree = () => {
        this.runCancel(3)
    }

    runCancelAll = () => {
        this.runCancel(0)
    }

    runCancel(buttonNumber) {
        let executionId = 0;

        switch (buttonNumber) {
            case 1:
                executionId = this.state.executionId1;
                break;
            case 2:
                executionId = this.state.executionId2;
                break;
            case 3:
                executionId = this.state.executionId3;
        }

        ffprint(
            `Cancelling FFmpeg process for button ${buttonNumber} with executionId ${executionId}.`);

        if (executionId === 0) {
            executeFFmpegCancel();
        } else {
            executeFFmpegCancelExecution(executionId);
        }
    }

    render() {
        return (
            <View style={styles.screenStyle}>
                <View style={styles.headerViewStyle}>
                    <Text style={styles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={[styles.buttonViewStyle, {paddingTop: 20, flexDirection: 'row'}]}>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 92}]}
                        onPress={this.encodeVideoOne}>
                        <Text style={styles.buttonTextStyle}>ENCODE 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 92, marginHorizontal: 20}]}
                        onPress={this.encodeVideoTwo}>
                        <Text style={styles.buttonTextStyle}>ENCODE 2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 92}]}
                        onPress={this.encodeVideoThree}>
                        <Text style={styles.buttonTextStyle}>ENCODE 3</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref={this.popupReference} position="center"/>
                <View style={[styles.buttonViewStyle, {paddingBottom: 0, flexDirection: 'row'}]}>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 86}]}
                        onPress={this.runCancelOne}>
                        <Text style={styles.buttonTextStyle}>CANCEL 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 86, marginHorizontal: 10}]}
                        onPress={this.runCancelTwo}>
                        <Text style={styles.buttonTextStyle}>CANCEL 2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 86, marginRight: 10}]}
                        onPress={this.runCancelThree}>
                        <Text style={styles.buttonTextStyle}>CANCEL 3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 80}]}
                        onPress={this.runCancelAll}>
                        <Text style={styles.buttonTextStyle}>CANCEL ALL</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.outputViewStyle}>
                    <ScrollView
                        ref={(view) => {
                            this.scrollViewReference = view;
                        }}
                        onContentSizeChange={(width, height) => this.scrollViewReference.scrollTo({y: height})}
                        style={styles.outputScrollViewStyle}>
                        <Text style={styles.outputTextStyle}>{this.state.outputText}</Text>
                    </ScrollView>
                </View>
            </View>
        );
    };

}
