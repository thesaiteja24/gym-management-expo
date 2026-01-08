import CustomHeader from "@/components/navigation/CustomHeader";
import { router, Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: useColorScheme() === "dark" ? "#000000" : "#ffffff",
        },
        header: (props) => {
          const { options } = props;
          const custom = options as any;

          if (options.headerShown === false) return null;

          return (
            <CustomHeader
              title={options.title ?? ""}
              leftIcon={custom.leftIcon}
              onLeftPress={custom.onLeftPress}
              rightIcons={custom.rightIcons}
            />
          );
        },
      }}
    >
      {/* EDIT */}
      <Stack.Screen
        name="edit"
        options={
          {
            title: "Edit Profile",
            leftIcon: "chevron-back-outline",
            onLeftPress: () => router.back(),
            rightIcons: [
              {
                name: "checkmark-done",
                disabled: true,
                color: "green",
              },
            ],
          } as any
        }
      />

      {/* SETTINGS */}
      <Stack.Screen
        name="settings"
        options={
          {
            title: "Settings",
            leftIcon: "chevron-back-outline",
            onLeftPress: () => {
              router.back();
            },
          } as any
        }
      />
    </Stack>
  );
}
