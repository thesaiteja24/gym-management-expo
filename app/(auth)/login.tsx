import GoogleIcon from "@/assets/components/icons/Google";
import PhoneInputField from "@/components/auth/PhoneInputField";
import { Button } from "@/components/ui/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { useExercise } from "@/stores/exerciseStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const colors = useThemeColor();
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState({
    name: "India",
    dial_code: "+91",
    code: "IN",
  });

  const sendOtp = useAuth((state: any) => state.sendOtp);
  const isLoading = useAuth((state: any) => state.isLoading);
  const googleLogin = useAuth((state: any) => state.googleLogin);
  const isGoogleLoading = useAuth((state: any) => state.isGoogleLoading);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        googleLogin(idToken)
          .then((res: any) => {
            if (res.success) {
              Toast.show({
                type: "success",
                text1: "Google Login Successful",
              });
              router.replace("/home");
            } else {
              Toast.show({
                type: "error",
                text1: res.error?.message || "Google Login Failed",
              });
            }
          })
          .catch((err: any) => {
            Toast.show({
              type: "error",
              text1: err.message || "Google Login Error",
            });
          });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
        });
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Toast.show({
              type: "error",
              text1: "Play services not available or outdated",
            });
            break;
          default:
            Toast.show({
              type: "error",
              text1: "Google Sign-In Error",
              text2: error.message,
            });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: error.message,
        });
      }
    }
  };

  const PHONE_ENABLED = false;

  const onContinue = async () => {
    Keyboard.dismiss();

    try {
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
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to send OTP",
      });
    }
  };

  // fetch intialization data
  const getAllExercises = useExercise((s) => s.getAllExercises);
  const getAllEquipment = useEquipment((s) => s.getAllEquipment);
  const getAllMuscleGroups = useMuscleGroup((s) => s.getAllMuscleGroups);

  useEffect(() => {
    getAllExercises();
    getAllEquipment();
    getAllMuscleGroups();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-[2] justify-center px-6">
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
        {PHONE_ENABLED && (
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Lock in today’s pump. Earn a bigger one tomorrow.
          </Text>
        )}
      </View>

      <View className="justify-center px-6">
        <Text className="text-5xl text-gray-500 dark:text-gray-400">
          Lock in today’s pump. Earn a bigger one tomorrow.
        </Text>
      </View>

      {PHONE_ENABLED && (
        <View className="flex-[2] justify-center px-6">
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
      )}

      <KeyboardAvoidingView
        behavior="position"
        className="flex-[4] justify-center px-6 pb-6"
      >
        {PHONE_ENABLED && (
          <TouchableOpacity
            className="w-full items-center rounded-full bg-primary py-2"
            onPress={onContinue}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="text-lg font-semibold text-white">Continue</Text>
            )}
          </TouchableOpacity>
        )}

        {PHONE_ENABLED && (
          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-500 dark:text-gray-400">Or</Text>
          </View>
        )}
        <Button
          title="Continue with Google"
          onPress={onGoogleButtonPress}
          variant="secondary"
          loading={isGoogleLoading}
          rightIcon={<GoogleIcon />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
