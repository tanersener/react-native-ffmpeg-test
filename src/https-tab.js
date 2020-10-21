import React from 'react';
import {styles} from './style';
import {showPopup, Toast} from './popup';
import {enableLogCallback, enableStatisticsCallback, getMediaInformation} from './react-native-ffmpeg-api-wrapper';
import {ffprint} from './util';
import {HTTPS_TEST_TOOLTIP_TEXT} from "./tooltip";
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';

const HTTPS_TEST_DEFAULT_URL = "https://download.blender.org/peach/trailer/trailer_1080p.ogg";

export default class HttpsTab extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            urlText: '',
            outputText: ''
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
        ffprint("Https Tab Activated");
        enableLogCallback(this.logCallback);
        enableStatisticsCallback(undefined);
        showPopup(this.popupReference, HTTPS_TEST_TOOLTIP_TEXT);
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

    runGetMediaInformation = () => {
        this.clearLog();

        let testUrl = this.state.urlText;
        if (testUrl !== undefined && testUrl.trim().length > 0) {
            ffprint(`Testing HTTPS with url '${testUrl}'.`);
        } else {
            testUrl = HTTPS_TEST_DEFAULT_URL;
            this.setState({urlText: testUrl});
            ffprint(
                `Testing HTTPS with default url '${testUrl}'.`
            );
        }

        // HTTPS COMMAND ARGUMENTS
        getMediaInformation(testUrl).then((information) => {
            if (information.getMediaProperties() !== undefined) {
                ffprint("---");
                if (information.getMediaProperties().filename !== undefined) {
                    ffprint(`Path: ${information.getMediaProperties().filename}`);
                }
                if (information.getMediaProperties().format_name !== undefined) {
                    ffprint(`Format: ${information.getMediaProperties().format_name}`);
                }
                if (information.getMediaProperties().bit_rate !== undefined) {
                    ffprint(`Bitrate: ${information.getMediaProperties().bit_rate}`);
                }
                if (information.getMediaProperties().duration !== undefined) {
                    ffprint(`Duration: ${information.getMediaProperties().duration}`);
                }
                if (information.getMediaProperties().start_time !== undefined) {
                    ffprint(`Start time: ${information.getMediaProperties().start_time}`);
                }
                if (information.getMediaProperties().nb_streams !== undefined) {
                    ffprint(`Number of streams: ${information.getMediaProperties().nb_streams.toString()}`);
                }
                let tags = information.getMediaProperties().tags;
                if (tags !== undefined) {
                    Object.keys(tags).forEach((key) => {
                        ffprint(`Tag: ${key}:${tags[key]}`);
                    });
                }

                let streams = information.getStreams();
                if (streams !== undefined) {
                    for (let i = 0; i < streams.length; ++i) {
                        let stream = streams[i];
                        ffprint("---");
                        if (stream.getAllProperties().index !== undefined) {
                            ffprint(`Stream index: ${stream.getAllProperties().index.toString()}`);
                        }
                        if (stream.getAllProperties().codec_type !== undefined) {
                            ffprint(`Stream type: ${stream.getAllProperties().codec_type}`);
                        }
                        if (stream.getAllProperties().codec_name !== undefined) {
                            ffprint(`Stream codec: ${stream.getAllProperties().codec_name}`);
                        }
                        if (stream.getAllProperties().codec_long_name !== undefined) {
                            ffprint(`Stream full codec: ${stream.getAllProperties().codec_long_name}`);
                        }
                        if (stream.getAllProperties().pix_fmt !== undefined) {
                            ffprint(`Stream format: ${stream.getAllProperties().pix_fmt}`);
                        }
                        if (stream.getAllProperties().width !== undefined) {
                            ffprint(`Stream width: ${stream.getAllProperties().width.toString()}`);
                        }
                        if (stream.getAllProperties().height !== undefined) {
                            ffprint(`Stream height: ${stream.getAllProperties().height.toString()}`);
                        }
                        if (stream.getAllProperties().bit_rate !== undefined) {
                            ffprint(`Stream bitrate: ${stream.getAllProperties().bit_rate}`);
                        }
                        if (stream.getAllProperties().sample_rate !== undefined) {
                            ffprint(`Stream sample rate: ${stream.getAllProperties().sample_rate}`);
                        }
                        if (stream.getAllProperties().sample_fmt !== undefined) {
                            ffprint(`Stream sample format: ${stream.getAllProperties().sample_fmt}`);
                        }
                        if (stream.getAllProperties().channel_layout !== undefined) {
                            ffprint(`Stream channel layout: ${stream.getAllProperties().channel_layout}`);
                        }
                        if (stream.getAllProperties().sample_aspect_ratio !== undefined) {
                            ffprint(`Stream sample aspect ratio: ${stream.getAllProperties().sample_aspect_ratio}`);
                        }
                        if (stream.getAllProperties().display_aspect_ratio !== undefined) {
                            ffprint(`Stream display aspect ratio: ${stream.getAllProperties().display_aspect_ratio}`);
                        }
                        if (stream.getAllProperties().avg_frame_rate !== undefined) {
                            ffprint(`Stream average frame rate: ${stream.getAllProperties().avg_frame_rate}`);
                        }
                        if (stream.getAllProperties().r_frame_rate !== undefined) {
                            ffprint(`Stream real frame rate: ${stream.getAllProperties().r_frame_rate}`);
                        }
                        if (stream.getAllProperties().time_base !== undefined) {
                            ffprint(`Stream time base: ${stream.getAllProperties().time_base}`);
                        }
                        if (stream.getAllProperties().codec_time_base !== undefined) {
                            ffprint(`Stream codec time base: ${stream.getAllProperties().codec_time_base}`);
                        }
                        let tags = stream.getAllProperties().tags;
                        if (tags !== undefined) {
                            Object.keys(tags).forEach((key) => {
                                ffprint(`Stream tag: ${key}:${tags[key]}`);
                            });
                        }
                    }
                }
            }
        });
    };

    render() {
        return (
            <View style={styles.screenStyle}>
                <View style={styles.headerViewStyle}>
                    <Text style={styles.headerTextStyle}>
                        ReactNativeFFmpegTest
                    </Text>
                </View>
                <View style={styles.textInputViewStyle}>
                    <TextInput
                        style={styles.textInputStyle}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder="Enter https url"
                        underlineColorAndroid="transparent"
                        onChangeText={(urlText) => this.setState({urlText})}
                        value={this.state.urlText}
                    />
                </View>
                <View style={styles.buttonViewStyle}>
                    <TouchableOpacity
                        style={styles.buttonStyle}
                        onPress={this.runGetMediaInformation}>
                        <Text style={styles.buttonTextStyle}>GET INFO</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref={this.popupReference} position="center"/>
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
