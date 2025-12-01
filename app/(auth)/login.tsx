import InputField from "@/components/InputField";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState({
    name: "India",
    dial_code: "+91",
    code: "IN",
  });

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-black">
      <View
        style={{ flex: 2, paddingHorizontal: 24, justifyContent: "center" }}
      >
        <View className="flex flex-row gap-2 items-center">
          <Text className="text-3xl font-extrabold text-black dark:text-white mb-2">
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
        <Text className="text-sm text-gray-400 dark:text-gray-500 mb-4">
          Enter your mobile number to continue.
        </Text>

        <InputField
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
          className="w-full bg-blue-600 py-2 rounded-full items-center"
          onPress={() => {
            /* send OTP */
          }}
        >
          <Text className="text-white font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
