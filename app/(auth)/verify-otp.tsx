import { useAuth } from "@/stores/authStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ChevronDoubleLeftIcon } from "react-native-heroicons/outline";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VerifyOtp() {
  const { data } = useLocalSearchParams();
  const [otp, setOtp] = useState("");

  const isLoading = useAuth((state: any) => state.isLoading);
  const verifyOtp = useAuth((state: any) => state.verifyOtp);

  const onVerifyOtp = async () => {
    // Ensure it's a string, not an array as per expo-router behavior
    const payload = JSON.parse(Array.isArray(data) ? data[0] : data);
    const response = await verifyOtp({ ...payload, otp });

    if (response.success) {
      // Navigate to the next screen or home screen after successful verification
      router.replace("/(auth)/welcome"); // Adjust the path as needed
      Toast.show({
        type: "success",
        text1: response.message || "OTP verified successfully",
      });
    } else {
      Toast.show({
        type: "error",
        text1: response.error?.message || "Failed to verify OTP",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-black">
      {/* Navigate back to Login page */}
      <View
        style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}
      >
        <TouchableOpacity onPress={() => router.back()} className="self-start">
          <ChevronDoubleLeftIcon
            color={useColorScheme() === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      {/* Header text */}
      <View
        style={{ flex: 2, paddingHorizontal: 24, justifyContent: "flex-end" }}
      >
        <View className="flex flex-row gap-2 items-center">
          <Text className="text-3xl font-extrabold text-black dark:text-white mb-2">
            Enter 6-digit code
          </Text>
        </View>
        <Text className="text-base text-gray-500 dark:text-gray-400">
          We sent a verification code to
        </Text>
      </View>

      {/* OTP input and resend text */}
      <View
        style={{ flex: 2, paddingHorizontal: 24, justifyContent: "center" }}
      >
        <OtpInput
          numberOfDigits={6}
          type="numeric"
          onTextChange={(text) => setOtp(text)}
          theme={{
            focusedPinCodeContainerStyle: { borderColor: "blue" },
            filledPinCodeContainerStyle: { borderColor: "green" },
            pinCodeTextStyle: {
              color: useColorScheme() === "dark" ? "white" : "black",
            },
          }}
        />
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          You didn’t receive any code?{" "}
          <Text className="text-blue-600" onPress={() => {}}>
            Resend code
          </Text>
        </Text>
      </View>

      {/* Verify button */}
      <KeyboardAvoidingView
        behavior="position"
        style={{
          flex: 4,
          paddingHorizontal: 24,
          justifyContent: "flex-end",
          paddingBottom: 24,
        }}
      >
        <TouchableOpacity
          className="w-full bg-blue-600 py-2 rounded-full items-center"
          onPress={onVerifyOtp}
          disabled={isLoading || otp.length < 6}
          style={{
            opacity: isLoading || otp.length < 6 ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">Verify</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
