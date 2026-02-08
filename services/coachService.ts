import {
  ASK_QUESTION_ENDPOINT as ask_question_endpoint,
  CHAT_AUDIO_ENDPOINT as chat_audio_endpoint,
  START_CHAT_ENDPOINT as start_chat_endpoint,
} from "@/constants/urls";
import { handleApiResponse } from "@/utils/handleApiResponse";
import client from "./api";

export async function startChatService() {
  try {
    const res = await client.get(start_chat_endpoint);

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function streamTTSService(id: string) {
  try {
    const res = await client.get(chat_audio_endpoint(id));

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}

export async function askQuestionService(data: FormData) {
  try {
    const res = await client.post(ask_question_endpoint, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse(res);
  } catch (error: any) {
    const errData = error.response?.data;
    throw new Error(errData?.message || error.message || "Network error");
  }
}
