import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import RNFS from 'react-native-fs';
import VideoUtil from './video-util';
import {enableLogCallback, enableStatisticsCallback, executeFFmpegAsync} from './react-native-ffmpeg-api-wrapper';
import {styles} from './style';
import {showPopup, Toast} from "./popup";
import {VIDSTAB_TEST_TOOLTIP_TEXT} from "./tooltip";
import {ProgressModal} from "./progress_modal";
import Video from 'react-native-video';
import {ffprint} from './util';

export default class VidStabTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.popupReference = React.createRef();
        this.progressModalReference = React.createRef();
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', (_) => {
            this.pauseVideo();
            this.pauseStabilizedVideo();
            this.setActive();
        });
    }

    setActive() {
        ffprint("VidStab Tab Activated");
        enableLogCallback(this.logCallback);
        enableStatisticsCallback(undefined);
        showPopup(this.popupReference, VIDSTAB_TEST_TOOLTIP_TEXT);
    }

    logCallback = (log) => {
        ffprint(log.message);
    }

    stabilizeVideo = () => {
        let image1Path = VideoUtil.assetPath(VideoUtil.ASSET_1);
        let image2Path = VideoUtil.assetPath(VideoUtil.ASSET_2);
        let image3Path = VideoUtil.assetPath(VideoUtil.ASSET_3);
        let shakeResultsFile = this.getShakeResultsFile();
        let videoFile = this.getVideoFile();
        let stabilizedVideoFile = this.getStabilizedVideoFile();

        // IF VIDEO IS PLAYING STOP PLAYBACK
        this.pauseVideo();
        this.pauseStabilizedVideo();

        VideoUtil.deleteFile(shakeResultsFile);
        VideoUtil.deleteFile(videoFile);
        VideoUtil.deleteFile(stabilizedVideoFile);

        ffprint("Testing VID.STAB");

        this.hideProgressDialog();
        this.showCreateProgressDialog();

        let ffmpegCommand = VideoUtil.generateShakingVideoScript(image1Path, image2Path, image3Path, videoFile);

        executeFFmpegAsync(ffmpegCommand, completedExecution => {
                ffprint(
                    `FFmpeg process exited with rc ${completedExecution.returnCode}.`);

                if (completedExecution.returnCode === 0) {
                    ffprint(
                        "Create completed successfully; stabilizing video.");

                    let analyzeVideoCommand = `-y -i ${videoFile} -vf vidstabdetect=shakiness=10:accuracy=15:result=${shakeResultsFile} -f null -`;

                    this.showStabilizeProgressDialog();

                    executeFFmpegAsync(analyzeVideoCommand, secondExecution => {
                        ffprint(
                            `FFmpeg process exited with rc ${secondExecution.returnCode}.`);

                        if (secondExecution.returnCode === 0) {

                            let stabilizeVideoCommand = `-y -i ${videoFile} -vf vidstabtransform=smoothing=30:input=${shakeResultsFile} -c:v mpeg4 ${stabilizedVideoFile}`;

                            executeFFmpegAsync(stabilizeVideoCommand, thirdExecution => {

                                this.hideProgressDialog();

                                if (thirdExecution.returnCode === 0) {
                                    ffprint(
                                        "Stabilize video completed successfully; playing videos.");
                                    this.playVideo();
                                    this.playStabilizedVideo();
                                } else {
                                    showPopup(this.popupReference,
                                        "Stabilize video failed. Please check log for the details.");
                                    ffprint(
                                        `Stabilize video failed with rc=${thirdExecution.returnCode}.`);
                                }

                            }).then(executionId => ffprint(`Async FFmpeg process started with arguments \'${stabilizeVideoCommand}\' and executionId ${executionId}.`));
                        } else {
                            ffprint(
                                `Stabilize video failed with rc=${secondExecution.returnCode}.`);
                            this.hideProgressDialog();
                            showPopup(this.popupReference,
                                "Stabilize video failed. Please check log for the details.");
                        }
                    }).then(executionId => ffprint(`Async FFmpeg process started with arguments \'${analyzeVideoCommand}\' and executionId ${executionId}.`));
                } else {
                    this.hideProgressDialog();
                }
            }
        ).then(executionId => ffprint(`Async FFmpeg process started with arguments \'${ffmpegCommand}\' and executionId ${executionId}.`));
    }

    playVideo() {
        let player = this.videoPlayer;
        if (player !== undefined) {
            player.seek(0);
        }
        this.setState({videoPaused: false});
    }

    pauseVideo() {
        this.setState({videoPaused: true});
    }

    playStabilizedVideo() {
        let player = this.stabilizedVideoPlayer;
        if (player !== undefined) {
            player.seek(0);
        }
        this.setState({stabilizedVideoPaused: false});
    }

    pauseStabilizedVideo() {
        this.setState({stabilizedVideoPaused: true});
    }

    getShakeResultsFile() {
        return `${RNFS.CachesDirectoryPath}/transforms.trf`;
    }

    getVideoFile() {
        return `${RNFS.CachesDirectoryPath}/video-shaking.mp4`;
    }

    getStabilizedVideoFile() {
        return `${RNFS.CachesDirectoryPath}/video-stabilized.mp4`;
    }

    showCreateProgressDialog() {
        this.progressModalReference.current.show(`Creating video`);
    }

    showStabilizeProgressDialog() {
        this.progressModalReference.current.update(`Stabilizing video`);
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
                <Video source={{uri: this.getVideoFile()}}
                       ref={(ref) => {
                           this.videoPlayer = ref
                       }}
                       hideShutterView={true}
                       paused={this.state.videoPaused}
                       // onError={this.onPlayError}
                       resizeMode={"stretch"}
                       style={styles.halfSizeVideoPlayerViewStyle}/>

                <View style={[styles.buttonViewStyle, {paddingTop: 0, paddingBottom: 0}]}>
                    <TouchableOpacity
                        style={[styles.buttonStyle, {width: 160}]}
                        onPress={this.stabilizeVideo}>
                        <Text style={styles.buttonTextStyle}>STABILIZE VIDEO</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref={this.popupReference} position="center"/>
                <ProgressModal
                    visible={false}
                    ref={this.progressModalReference}/>
                <Video source={{uri: this.getStabilizedVideoFile()}}
                       ref={(ref) => {
                           this.stabilizedVideoPlayer = ref
                       }}
                       hideShutterView={true}
                       paused={this.state.stabilizedVideoPaused}
                       // onError={this.onPlayError}
                       resizeMode={"stretch"}
                       style={styles.halfSizeVideoPlayerViewStyle}/>
            </View>
        );
    }

}
