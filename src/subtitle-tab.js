import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import RNFS from 'react-native-fs';
import VideoUtil from './video-util';
import {
    enableLogCallback,
    enableStatisticsCallback,
    executeFFmpegAsync,
    executeFFmpegCancelExecution,
    resetStatistics
} from './react-native-ffmpeg-api-wrapper';
import {styles} from './style';
import {showPopup, Toast} from "./popup";
import {SUBTITLE_TEST_TOOLTIP_TEXT} from "./tooltip";
import {ProgressModal} from "./progress_modal";
import Video from 'react-native-video';
import {ffprint} from './util';

export default class SubtitleTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            state: 'IDLE',
            statistics: undefined,
            executionId: 0
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
        ffprint("Subtitle Tab Activated");
        enableLogCallback(this.logCallback);
        enableStatisticsCallback(this.statisticsCallback);
        showPopup(this.popupReference, SUBTITLE_TEST_TOOLTIP_TEXT);
    }

    logCallback = (log) => {
        ffprint(log.message);
    }

    statisticsCallback = (statistics) => {
        this.setState({statistics: statistics});
        this.updateProgressDialog();
    }

    burnSubtitles = () => {
        let image1Path = VideoUtil.assetPath(VideoUtil.ASSET_1);
        let image2Path = VideoUtil.assetPath(VideoUtil.ASSET_2);
        let image3Path = VideoUtil.assetPath(VideoUtil.ASSET_3);
        let subtitlePath = VideoUtil.assetPath(VideoUtil.SUBTITLE_ASSET);
        let videoFile = this.getVideoFile();
        let videoWithSubtitlesFile = this.getVideoWithSubtitlesFile();

        // IF VIDEO IS PLAYING STOP PLAYBACK
        this.pause();

        VideoUtil.deleteFile(videoFile);
        VideoUtil.deleteFile(videoWithSubtitlesFile);

        ffprint("Testing SUBTITLE burning");

        this.hideProgressDialog();
        this.showCreateProgressDialog();

        let ffmpegCommand = VideoUtil.generateEncodeVideoScript(image1Path, image2Path, image3Path, videoFile, "mpeg4", "");

        this.setState({state: 'CREATING'});

        executeFFmpegAsync(ffmpegCommand, completedExecution => {
                ffprint(
                    `FFmpeg process exited with rc ${completedExecution.returnCode}.`);

                if (completedExecution.returnCode === 0) {
                    ffprint(
                        "Create completed successfully; burning subtitles.");

                    let burnSubtitlesCommand =
                        `-y -i ${videoFile} -vf subtitles=${subtitlePath}:force_style='FontName=MyFontName' -c:v mpeg4 ${videoWithSubtitlesFile}`;

                    this.showBurnProgressDialog();

                    ffprint(
                        `FFmpeg process started with arguments\n\'${burnSubtitlesCommand}\'.`);

                    this.setState({state: 'BURNING'});

                    executeFFmpegAsync(burnSubtitlesCommand, secondCompletedExecution => {
                        ffprint(
                            `FFmpeg process exited with rc ${secondCompletedExecution.returnCode}.`);
                        this.hideProgressDialog();

                        if (secondCompletedExecution.returnCode === 0) {
                            ffprint(
                                "Burn subtitles completed successfully; playing video.");
                            this.playVideo();
                        } else if (secondCompletedExecution.returnCode === 255) {
                            showPopup(this.popupReference, "Burn subtitles operation cancelled.");
                            ffprint("Burn subtitles operation cancelled");
                        } else {
                            showPopup(this.popupReference,
                                "Burn subtitles failed. Please check log for the details.");
                            ffprint(
                                `Burn subtitles failed with rc=${secondCompletedExecution.returnCode}.`);
                        }
                    }).then(executionId => {
                            this.setState({executionId: executionId});
                            ffprint(`Async FFmpeg process started with arguments \'${burnSubtitlesCommand}\' and executionId ${executionId}.`);
                        }
                    );
                } else {
                    this.hideProgressDialog();
                }
            }
        ).then(executionId => {
            this.setState({executionId: executionId});
            ffprint(`Async FFmpeg process started with arguments \'${ffmpegCommand}\' and executionId ${executionId}.`);
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

    getVideoWithSubtitlesFile() {
        return `${RNFS.CachesDirectoryPath}/video-with-subtitles.mp4`;
    }

    showCreateProgressDialog() {
        // CLEAN STATISTICS
        this.setState({statistics: undefined});
        resetStatistics();
        this.progressModalReference.current.show(`Creating video`, () => executeFFmpegCancelExecution(this.state.executionId));
    }

    showBurnProgressDialog() {
        // CLEAN STATISTICS
        this.setState({statistics: undefined});
        resetStatistics();
        this.progressModalReference.current.show(`Burning subtitles`, () => executeFFmpegCancelExecution(this.state.executionId));
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

            if (this.state.state === 'CREATING') {
                this.progressModalReference.current.update(`Creating video % ${completePercentage}`);
            } else if (this.state.state === 'BURNING') {
                this.progressModalReference.current.update(`Burning subtitles % ${completePercentage}`);
            }
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
                        style={[styles.buttonStyle, {width: 160}]}
                        onPress={this.burnSubtitles}>
                        <Text style={styles.buttonTextStyle}>BURN SUBTITLES</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref={this.popupReference} position="center"/>
                <ProgressModal
                    visible={false}
                    ref={this.progressModalReference}/>
                <Video source={{uri: this.getVideoWithSubtitlesFile()}}
                       ref={(ref) => {
                           this.player = ref
                       }}
                       hideShutterView={true}
                       paused={this.state.paused}
                       // onError={this.onPlayError}
                       resizeMode={"stretch"}
                       style={styles.videoPlayerViewStyle}/>
            </View>
        );
    }

}
