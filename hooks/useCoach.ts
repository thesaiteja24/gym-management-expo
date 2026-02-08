import {
  AudioModule,
  RecorderState,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

enum CoachState {
  idle,
  recording,
  stopped,
}

interface CoachVoice {
  coachState: CoachState;
  recorderState: RecorderState;
  isPlaying: boolean;
  recordedAudioUri: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playRecording: () => Promise<void>;
  clearRecording: () => void;
}

export function useCoach(): CoachVoice {
  const [coachState, setCoachState] = useState<CoachState>(CoachState.idle);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const audioPlayer = useAudioPlayer(recordedAudioUri);
  const recorderState = useAudioRecorderState(audioRecorder);
  const playerStatus = useAudioPlayerStatus(audioPlayer);
  const isPlaying = playerStatus.playing;

  // Function to start recording the audio
  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setCoachState(CoachState.recording);
  };

  // Function to stop recording the audio
  const stopRecording = async () => {
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    setCoachState(CoachState.stopped);
    setRecordedAudioUri(uri);
  };

  // Function to clear the recorded audio
  const playRecording = async () => {
    audioPlayer.seekTo(0);
    audioPlayer.play();
  };

  // Function to clear the recorded audio
  const clearRecording = () => {
    setRecordedAudioUri(null);
    setCoachState(CoachState.idle);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  useEffect(() => {
    console.log(recorderState.metering);
  }, [recorderState.metering]);

  useEffect(() => {
    console.log("isPlaying", isPlaying);
  }, [isPlaying, audioPlayer.playing]);

  return {
    coachState,
    recorderState,
    isPlaying,
    recordedAudioUri,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
  };
}
