import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import RNFS from 'react-native-fs';
import {
    enableLogCallback,
    enableStatisticsCallback,
    executeFFmpeg,
    executeFFmpegAsync
} from './react-native-ffmpeg-api-wrapper';
import {Picker} from '@react-native-community/picker';
import {styles} from './style';
import {showPopup, Toast} from "./popup";
import {AUDIO_TEST_TOOLTIP_TEXT} from "./tooltip";
import {ProgressModal} from "./progress_modal";
import {ffprint} from './util';
import Test from "./test-api";
import VideoUtil from "./video-util";

export default class AudioTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedCodec: 'mp2 (twolame)',
            outputText: ''
        };

        this.popupReference = React.createRef();
        this.progressModalReference = React.createRef();
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', (_) => {
            this.clearLog();
            this.setActive();
        });
    }

    setActive() {
        ffprint("Audio Tab Activated");
        enableLogCallback(undefined);
        this.createAudioSample();
        enableStatisticsCallback(undefined);
        showPopup(this.popupReference, AUDIO_TEST_TOOLTIP_TEXT);
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

    encodeAudio = () => {
        let audioOutputFile = this.getAudioOutputFile();

        VideoUtil.deleteFile(audioOutputFile);

        let audioCodec = this.state.selectedCodec;

        ffprint(`Testing AUDIO encoding with '${audioCodec}' codec`);

        let ffmpegCommand = this.generateAudioEncodeScript();

        this.hideProgressDialog();
        this.showProgressDialog();

        this.clearLog();

        executeFFmpegAsync(ffmpegCommand, completedExecution => {
                this.hideProgressDialog();
                if (completedExecution.returnCode === 0) {
                    showPopup(this.popupReference, "Encode completed successfully.");
                    ffprint("Encode completed successfully.");
                } else {
                    showPopup(this.popupReference, "Encode failed. Please check log for the details.");
                    ffprint(`Encode failed with rc=${completedExecution.returnCode}.`);
                }

                ffprint("Testing post execution commands.");
                Test.testPostExecutionCommands();
            }
        ).then(executionId => ffprint(`Async FFmpeg process started with arguments \'${ffmpegCommand}\' and executionId ${executionId}.`));
    }

    createAudioSample() {
        let audioSampleFile = this.getAudioSampleFile();

        ffprint("Creating AUDIO sample before the test.");

        VideoUtil.deleteFile(audioSampleFile);

        let ffmpegCommand = `-hide_banner -y -f lavfi -i sine=frequency=1000:duration=5 -c:a pcm_s16le ${audioSampleFile}`;

        ffprint(`Creating audio sample with '${ffmpegCommand}'.`);

        executeFFmpeg(ffmpegCommand).then((result) => {
                if (result === 0) {
                    ffprint("AUDIO sample created");
                } else {
                    ffprint(`Creating AUDIO sample failed with rc=${result}.`);
                    showPopup(this.popupReference, "Creating AUDIO sample failed. Please check log for the details.");
                }
                enableLogCallback(this.logCallback);
            }
        );
    }

    getAudioOutputFile() {
        let audioCodec = this.state.selectedCodec;

        let extension;
        switch (audioCodec) {
            case "mp2 (twolame)":
                extension = "mpg";
                break;
            case "mp3 (liblame)":
            case "mp3 (libshine)":
                extension = "mp3";
                break;
            case "vorbis":
                extension = "ogg";
                break;
            case "opus":
                extension = "opus";
                break;
            case "amr-nb":
                extension = "amr";
                break;
            case "amr-wb":
                extension = "amr";
                break;
            case "ilbc":
                extension = "lbc";
                break;
            case "speex":
                extension = "spx";
                break;
            case "wavpack":
                extension = "wv";
                break;
            default:
                // soxr
                extension = "wav";
                break;
        }

        return `${RNFS.CachesDirectoryPath}/audio.${extension}`;
    }

    getAudioSampleFile() {
        return `${RNFS.CachesDirectoryPath}/audio-sample.wav`;
    }

    showProgressDialog() {
        this.progressModalReference.current.show(`Encoding video`);
    }

    hideProgressDialog() {
        this.progressModalReference.current.hide();
    }

    generateAudioEncodeScript() {
        let audioCodec = this.state.selectedCodec;
        let audioSampleFile = this.getAudioSampleFile();
        let audioOutputFile = this.getAudioOutputFile();

        switch (audioCodec) {
            case "mp2 (twolame)":
                return `-hide_banner -y -i ${audioSampleFile} -c:a mp2 -b:a 192k ${audioOutputFile}`;
            case "mp3 (liblame)":
                return `-hide_banner -y -i ${audioSampleFile} -c:a libmp3lame -qscale:a 2 ${audioOutputFile}`;
            case "mp3 (libshine)":
                return `-hide_banner -y -i ${audioSampleFile} -c:a libshine -qscale:a 2 ${audioOutputFile}`;
            case "vorbis":
                return `-hide_banner -y -i ${audioSampleFile} -c:a libvorbis -b:a 64k ${audioOutputFile}`;
            case "opus":
                return `-hide_banner -y -i ${audioSampleFile} -c:a libopus -b:a 64k -vbr on -compression_level 10 ${audioOutputFile}`;
            case "amr-nb":
                return `-hide_banner -y -i ${audioSampleFile} -ar 8000 -ab 12.2k -c:a libopencore_amrnb ${audioOutputFile}`;
            case "amr-wb":
                return `-hide_banner -y -i ${audioSampleFile} -ar 8000 -ab 12.2k -c:a libvo_amrwbenc -strict experimental ${audioOutputFile}`;
            case "ilbc":
                return `-hide_banner -y -i ${audioSampleFile} -c:a ilbc -ar 8000 -b:a 15200 ${audioOutputFile}`;
            case "speex":
                return `-hide_banner -y -i ${audioSampleFile} -c:a libspeex -ar 16000 ${audioOutputFile}`;
            case "wavpack":
                return `-hide_banner -y -i ${audioSampleFile} -c:a wavpack -b:a 64k ${audioOutputFile}`;
            default:
                // soxr
                return `-hide_banner -y -i ${audioSampleFile} -af aresample=resampler=soxr -ar 44100 ${audioOutputFile}`;
        }
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
                <View>
                    <Picker
                        selectedValue={this.state.selectedCodec}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({selectedCodec: itemValue})
                        }>
                        <Picker.Item label="mp2 (twolame)" value="mp2 (twolame)"/>
                        <Picker.Item label="mp3 (liblame)" value="mp3 (liblame)"/>
                        <Picker.Item label="mp3 (libshine)" value="mp3 (libshine)"/>
                        <Picker.Item label="vorbis" value="vorbis"/>
                        <Picker.Item label="opus" value="opus"/>
                        <Picker.Item label="amr-nb" value="amr-nb"/>
                        <Picker.Item label="amr-wb" value="amr-wb"/>
                        <Picker.Item label="ilbc" value="ilbc"/>
                        <Picker.Item label="soxr" value="soxr"/>
                        <Picker.Item label="speex" value="speex"/>
                        <Picker.Item label="wavpack" value="wavpack"/>
                    </Picker>
                </View>
                <View style={styles.buttonViewStyle}>
                    <TouchableOpacity
                        style={styles.buttonStyle}
                        onPress={this.encodeAudio}>
                        <Text style={styles.buttonTextStyle}>CREATE</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref={this.popupReference} position="center"/>
                <ProgressModal
                    visible={false}
                    ref={this.progressModalReference}/>
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
    }

}
