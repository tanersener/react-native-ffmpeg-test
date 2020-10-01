import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import RNFS from 'react-native-fs';
import VideoUtil from './video-util';
import {
    enableLogCallback,
    enableStatisticsCallback,
    executeFFmpegAsync,
    registerNewFFmpegPipe,
    resetStatistics
} from './react-native-ffmpeg-api-wrapper';
import {styles} from './style';
import {showPopup, Toast} from "./popup";
import {PIPE_TEST_TOOLTIP_TEXT} from "./tooltip";
import {ProgressModal} from "./progress_modal";
import Video from 'react-native-video';
import {ffprint} from './util';

export default class PipeTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            statistics: undefined
        };

        this.popupReference = React.createRef();
        this.progressModalReference = React.createRef();
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', (_) => {
            this.pause();
            this.setActive();
        });
    }

    setActive() {
        ffprint("Pipe Tab Activated");
        enableLogCallback(this.logCallback);
        enableStatisticsCallback(this.statisticsCallback);
        showPopup(this.popupReference, PIPE_TEST_TOOLTIP_TEXT);
    }

    logCallback = (log) => {
        ffprint(log.message);
    }

    statisticsCallback = (statistics) => {
        this.setState({statistics: statistics});
        this.updateProgressDialog();
    }

    asyncAssetWriteToPipe(assetName, pipePath) {
        VideoUtil.assetToPipe(assetName, pipePath);
    }

    createVideo = () => {
        let videoFile = this.getVideoFile();
        registerNewFFmpegPipe().then((pipe1) => {
            registerNewFFmpegPipe().then((pipe2) => {
                registerNewFFmpegPipe().then((pipe3) => {

                    // IF VIDEO IS PLAYING STOP PLAYBACK
                    this.pause();

                    VideoUtil.deleteFile(videoFile);

                    ffprint("Testing PIPE with 'mpeg4' codec");

                    this.hideProgressDialog();
                    this.showProgressDialog();

                    let ffmpegCommand = VideoUtil.generateCreateVideoWithPipesScript(
                        pipe1, pipe2, pipe3, videoFile);

                    executeFFmpegAsync(ffmpegCommand, completedExecution => {
                            this.hideProgressDialog();
                            if (completedExecution.returnCode === 0) {
                                ffprint("Create completed successfully; playing video.");
                                this.playVideo();
                            } else {
                                ffprint(`Create failed with rc=${completedExecution.returnCode}.`);
                                showPopup(this.popupReference, "Create failed. Please check log for the details.");
                            }
                        }
                    ).then(executionId => ffprint(`Async FFmpeg process started with arguments \'${ffmpegCommand}\' and executionId ${executionId}.`));

                    this.asyncAssetWriteToPipe(VideoUtil.ASSET_1, pipe1);
                    this.asyncAssetWriteToPipe(VideoUtil.ASSET_2, pipe2);
                    this.asyncAssetWriteToPipe(VideoUtil.ASSET_3, pipe3);
                });
            });
        });
    }

    playVideo() {
        let player = this.player;
        if (player !== undefined) {
            player.seek(0);
        }
        this.setState({paused: false});
    }

    pause() {
        this.setState({paused: true});
    }

    getVideoFile() {
        return `${RNFS.CachesDirectoryPath}/video.mp4`;
    }

    showProgressDialog() {
        // CLEAN STATISTICS
        this.setState({statistics: undefined});
        resetStatistics();
        this.progressModalReference.current.show(`Creating video`);
    }

    updateProgressDialog() {
        let statistics = this.state.statistics;
        if (statistics === undefined) {
            return;
        }

        let timeInMilliseconds = statistics.time;
        if (timeInMilliseconds > 0) {
            let totalVideoDuration = 9000;
            let completePercentage = Math.round((timeInMilliseconds * 100) / totalVideoDuration);
            this.progressModalReference.current.update(`Creating video % ${completePercentage}`);
        }
    }

    hideProgressDialog() {
        this.progressModalReference.current.hide();
    }

    onPlayError = (err) => {
        ffprint('Play error: ' + JSON.stringify(err));
    }

    render() {
        return (
            <View style={styles.screenStyle}>
                <View style={styles.headerViewStyle}>
                    <Text
                        style={styles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={[styles.buttonViewStyle, {paddingTop: 50, paddingBottom: 50}]}>
                    <TouchableOpacity
                        style={styles.buttonStyle}
                        onPress={this.createVideo}>
                        <Text style={styles.buttonTextStyle}>CREATE</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref={this.popupReference} position="center"/>
                <ProgressModal
                    visible={false}
                    ref={this.progressModalReference}/>
                <Video source={{uri: this.getVideoFile()}}
                       ref={(ref) => {
                           this.player = ref
                       }}
                       hideShutterView={true}
                       paused={this.state.paused}
                       onError={this.onPlayError}
                       resizeMode={"stretch"}
                       style={styles.videoPlayerViewStyle}/>
            </View>
        );
    }

}
