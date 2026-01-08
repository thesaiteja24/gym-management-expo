import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor:
              useColorScheme() === "dark" ? "#000000" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
