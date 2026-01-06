import PhoneInputField from "@/components/auth/PhoneInputField";
import { useAuth } from "@/stores/authStore";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState({
    name: "India",
    dial_code: "+91",
    code: "IN",
  });

  const sendOtp = useAuth((state: any) => state.sendOtp);
  const isLoading = useAuth((state: any) => state.isLoading);

  const onContinue = async () => {
    Keyboard.dismiss();

    const payload = { countryCode: country.dial_code, phone, resend: false };
    const response = await sendOtp(payload);

    if (response.success) {
      // Navigate to OTP verification screen
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          data: JSON.stringify({
            countryCode: payload.countryCode,
            phone: payload.phone,
          }),
        },
      });
      Toast.show({
        type: "success",
        text1: response.message || "OTP sent successfully",
      });
    } else {
      Toast.show({
        type: "error",
        text1: response.error?.message || "Failed to send OTP",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-black">
      <View
        style={{ flex: 2, paddingHorizontal: 24, justifyContent: "center" }}
      >
        <View className="flex flex-row items-center gap-2">
          <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">
            Welcome to
          </Text>
          <Text
            className="text-3xl text-black dark:text-white"
            style={{
              fontFamily: "Monoton",
              includeFontPadding: false,
            }}
          >
            PUMP
          </Text>
        </View>
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Lock in today’s pump. Earn a bigger one tomorrow.
        </Text>
      </View>

      <View
        style={{ flex: 2, paddingHorizontal: 24, justifyContent: "center" }}
      >
        <Text className="mb-4 text-sm text-gray-400 dark:text-gray-500">
          Enter your mobile number to continue.
        </Text>

        <PhoneInputField
          value={phone}
          onChangeText={setPhone}
          initialCountry={country.code}
          onCountryChange={(c: any) => setCountry(c)}
        />
      </View>

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
          className="w-full items-center rounded-full bg-blue-600 py-2"
          onPress={onContinue}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-lg font-semibold text-white">Continue</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
