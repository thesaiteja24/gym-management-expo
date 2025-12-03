import {
  API_BASE_URL as api_base_url,
  REFRESH_TOKEN_URL as refresh_token_url,
} from "@/constants/urls";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";

const client = axios.create({
  baseURL: api_base_url,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to requests (async)
client.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

// ----- Refresh token machinery -----
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: AxiosResponse<any>) => void;
  reject: (err: any) => void;
  originalConfig: AxiosRequestConfig;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      if (token && p.originalConfig.headers) {
        p.originalConfig.headers["Authorization"] = `Bearer ${token}`;
      }
      // retry the original request
      client(p.originalConfig)
        .then((res) => p.resolve(res))
        .catch((e) => p.reject(e));
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (err: AxiosError | any) => {
    const originalConfig = err?.config;

    // proceed only for 401 responses that are not from refresh endpoint
    if (
      err?.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !originalConfig.url?.includes(refresh_token_url)
    ) {
      // mark it to prevent infinite loops
      originalConfig._retry = true;

      try {
        if (isRefreshing) {
          // queue this request and return a promise that resolves when refreshed
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, originalConfig });
          });
        }

        isRefreshing = true;

        // get userId from secure storage (your refresh API expects userId)
        const userJson = await SecureStore.getItemAsync("user");
        const user = userJson ? JSON.parse(userJson) : null;
        const userId = user?.id;

        if (!userId) {
          throw new Error("No user id for refresh");
        }

        // call refresh endpoint using fetch to avoid circular imports
        // include current token (optional)
        const oldToken = await SecureStore.getItemAsync("accessToken");
        const refreshRes = await fetch(`${api_base_url}${refresh_token_url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(oldToken ? { Authorization: `Bearer ${oldToken}` } : {}),
          },
          body: JSON.stringify({ userId }),
        });

        if (!refreshRes.ok) {
          const body = await refreshRes.text();
          throw new Error(`Refresh failed: ${refreshRes.status} ${body}`);
        }

        const json = await refreshRes.json();
        const newAccessToken =
          json?.data?.accessToken ?? json?.accessToken ?? null;

        if (!newAccessToken) {
          throw new Error("Refresh did not return accessToken");
        }

        // store new token
        await SecureStore.setItemAsync("accessToken", newAccessToken);

        // update default header for axios
        client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        // replay queued requests
        processQueue(null, newAccessToken);

        isRefreshing = false;

        // retry original request with new token
        if (originalConfig.headers) {
          originalConfig.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }
        return client(originalConfig);
      } catch (refreshError) {
        // refresh failed -> reject all queued and clear token
        processQueue(refreshError, null);
        isRefreshing = false;

        // clear credentials
        try {
          await SecureStore.deleteItemAsync("accessToken");
        } catch (e) {
          // ignore
        }

        console.error("Token refresh failed");

        // Re-throw original error (or a more explicit one)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default client;
