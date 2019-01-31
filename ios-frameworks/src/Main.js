import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from 'react-navigation';
import {RNFFmpeg} from 'react-native-ffmpeg';

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

const TabNavigator = createBottomTabNavigator(
    {
        COMMAND: CommandScreen
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
