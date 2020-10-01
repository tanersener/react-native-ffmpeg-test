import React from 'react';
import {RNFFmpeg, RNFFmpegConfig, RNFFprobe} from 'react-native-ffmpeg';
import {ffprint} from './util';

export async function executeFFmpeg(command) {
    return await RNFFmpeg.execute(command)
}

export function executeFFmpegWithArguments(commandArguments) {
    RNFFmpeg.executeWithArguments(commandArguments).then(rc => ffprint(`FFmpeg process exited with rc ${rc}`));
}

export async function executeFFmpegAsync(command, callback) {
    return await RNFFmpeg.executeAsync(command, callback);
}

export function executeFFmpegAsyncWithArguments(commandArguments, callback) {
    RNFFmpeg.executeAsyncWithArguments(commandArguments, callback).then(executionId => ffprint(`FFmpeg process started with executionId ${executionId}.`));
}

export function executeFFmpegCancel() {
    RNFFmpeg.cancel();
}

export function executeFFmpegCancelExecution(executionId) {
    RNFFmpeg.cancelExecution(executionId);
}

export function getLastCommandOutput() {
    return RNFFmpegConfig.getLastCommandOutput();
}

export function getLogLevel() {
    return RNFFmpegConfig.getLogLevel();
}

export function setLogLevel(logLevel) {
    return RNFFmpegConfig.setLogLevel(logLevel);
}

export function enableLogCallback(logCallback) {
    RNFFmpegConfig.enableLogCallback(logCallback);
}

export function enableStatisticsCallback(statisticsCallback) {
    RNFFmpegConfig.enableStatisticsCallback(statisticsCallback);
}

export function listExecutions() {
    RNFFmpeg.listExecutions().then(executionList => {
        executionList.forEach(execution => {
            ffprint(`Execution id is ${execution.executionId}`);
            ffprint(`Execution start time is ` + new Date(execution.startTime));
            ffprint(`Execution command is ${execution.command}`);
        });
    });
}

export async function executeFFprobe(command) {
    return await RNFFprobe.execute(command);
}

export function executeFFprobeWithArguments(commandArguments) {
    RNFFprobe.executeWithArguments(commandArguments).then(rc => ffprint(`FFprobe process exited with rc ${rc}`));
}

export function resetStatistics() {
    RNFFmpegConfig.resetStatistics();
}

export function parseArguments(command) {
    return RNFFmpeg.parseArguments(command);
}

export function getFFmpegVersion() {
    return RNFFmpegConfig.getFFmpegVersion();
}

export function getPlatform() {
    return RNFFmpegConfig.getPlatform();
}

export function getPackageName() {
    return RNFFmpegConfig.getPackageName();
}

export function getExternalLibraries() {
    return RNFFmpegConfig.getExternalLibraries();
}

export function getLastReturnCode() {
    return RNFFmpegConfig.getLastReturnCode();
}

export function getLastReceivedStatistics() {
    return RNFFmpegConfig.getLastReceivedStatistics();
}

export function setFontDirectory(path, mapping) {
    RNFFmpegConfig.setFontDirectory(path, mapping);
}

export function setEnvironmentVariable(name, value) {
    RNFFmpegConfig.setEnvironmentVariable(name, value);
}

export function getMediaInformation(path) {
    return RNFFprobe.getMediaInformation(path);
}

export function registerNewFFmpegPipe() {
    return RNFFmpegConfig.registerNewFFmpegPipe();
}
