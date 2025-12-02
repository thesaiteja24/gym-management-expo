import { API_BASE_URL } from "@/constants/urls";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// atatch token to requests
client.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) { }
    return config
});

export default client;