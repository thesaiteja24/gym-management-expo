import { CHAT_AUDIO_ENDPOINT as chat_audio_endpoint } from "@/constants/urls";
import { askQuestionService, startChatService } from "@/services/coachService";
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
import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

enum CoachState {
  idle,
  recording,
  stopped,
}

export interface CoachMessage {
  id: string;
  role: "coach" | "user";
  text: string;
  thinking: boolean;
}

interface CoachVoice {
  messages: CoachMessage[];
  coachState: CoachState;
  recorderState: RecorderState;
  isPlaying: boolean;
  isThinking: boolean;
  recordedAudioUri: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startPlaying: (uri: string) => Promise<void>;
  stopPlaying: () => Promise<void>;
  clearRecording: () => void;

  startChat: () => Promise<void>;
  askQuestion: () => Promise<void>;
  clearMessages: () => void;
}

export const mockAskQuestionService = async (audioUri: string) => {
  // simulate network + processing time
  await new Promise((res) => setTimeout(res, 1200));

  return {
    success: true,
    data: {
      text: "Alright, I heard you. Let's push one more set — controlled reps.",
    },
  };
};

export function useCoach(): CoachVoice {
  const [coachState, setCoachState] = useState<CoachState>(CoachState.idle);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const audioPlayer = useAudioPlayer();
  const recorderState = useAudioRecorderState(audioRecorder);
  const playerStatus = useAudioPlayerStatus(audioPlayer);
  const isPlaying = playerStatus.playing;

  // Function to start recording the audio
  const startRecording = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setCoachState(CoachState.recording);
  };

  // Function to stop recording the audio
  const stopRecording = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });

    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    setCoachState(CoachState.stopped);
    setRecordedAudioUri(uri);
  };

  // Function to clear the recorded audio
  const startPlaying = async (uri: string) => {
    console.log("Playing audio from:", uri);
    audioPlayer.replace(uri);
    audioPlayer.seekTo(0);
    audioPlayer.play();
  };

  // Function to stop playing the audio
  const stopPlaying = async () => {
    audioPlayer.pause();
    audioPlayer.seekTo(0);
    setCoachState(CoachState.idle);
  };

  // Function to clear the recorded audio
  const clearRecording = () => {
    setRecordedAudioUri(null);
    setCoachState(CoachState.idle);
  };

  const startChat = async () => {
    const thinkingId = Crypto.randomUUID();

    // insert thinking placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        role: "coach",
        text: "",
        thinking: true,
      },
    ]);

    try {
      const response = await startChatService();

      if (!response.success) {
        setIsThinking(false);
        return;
      }

      const { text, ttsId } = response.data;

      // 1. show message instantly
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId ? { ...msg, text, thinking: false } : msg,
        ),
      );

      // 2. fetch audio
      const audioUri = chat_audio_endpoint(ttsId);
      startPlaying(audioUri);
    } catch (e) {
      console.log(e);
      setIsThinking(false);
    }
  };

  const askQuestion = async () => {
    try {
      // 1️⃣ stop recording safely
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      await audioRecorder.stop();

      const uri = audioRecorder.uri;
      if (!uri) return;

      setCoachState(CoachState.stopped);
      setRecordedAudioUri(uri);

      // 2️⃣ create temporary user message ("Sending...")
      const userMessageId = Crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: "user",
          text: "Sending...",
          thinking: true,
        },
      ]);

      setIsThinking(true);

      // 3️⃣ prepare form data
      const formData = new FormData();
      formData.append("audioFile", {
        uri,
        name: `recording-${Date.now()}.m4a`,
        type: "audio/m4a",
      } as any);

      // 4️⃣ send audio for transcription
      const response = await askQuestionService(formData);

      if (!response?.success) {
        throw new Error("Transcription failed");
      }

      const { text: transcription } = response.data;

      // 5️⃣ replace "Sending..." with actual transcription
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessageId
            ? {
                ...msg,
                text: transcription,
                thinking: false,
              }
            : msg,
        ),
      );

      // 6️⃣ add coach thinking placeholder
      const thinkingId = Crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        {
          id: thinkingId,
          role: "coach",
          text: "",
          thinking: true,
        },
      ]);

      // ---- MOCK COACH RESPONSE (temporary) ----
      await new Promise((res) => setTimeout(res, 1200));

      const mockCoachReply =
        "Got it. Let's keep the movement controlled and focus on good form.";

      // 7️⃣ replace coach thinking with mock response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId
            ? {
                ...msg,
                text: mockCoachReply,
                thinking: false,
              }
            : msg,
        ),
      );

      setIsThinking(false);
    } catch (error) {
      console.log("askQuestion error:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.thinking
            ? {
                ...msg,
                text: "I couldn’t process that right now. Try again.",
                thinking: false,
              }
            : msg,
        ),
      );

      setIsThinking(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    })();
  }, []);

  // useEffect(() => {
  //   console.log(recorderState.metering);
  // }, [recorderState.metering]);

  // useEffect(() => {
  //   console.log("isPlaying", isPlaying);
  // }, [isPlaying, audioPlayer.playing]);

  return {
    messages,
    coachState,
    recorderState,
    isPlaying,
    isThinking,
    recordedAudioUri,
    startRecording,
    stopRecording,
    startPlaying,
    stopPlaying,
    clearRecording,

    startChat,
    askQuestion,
    clearMessages,
  };
}
