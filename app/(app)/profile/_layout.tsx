import CustomHeader from "@/components/CustomHeader";
import { router, Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => {
          const { options } = props;

          const custom = options as any;

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
      <Stack.Screen
        name="edit"
        options={
          {
            title: "Edit Profile",
            leftIcon: "chevron-back-outline",
            onLeftPress: () => {
              router.back();
            },
          } as any
        }
      />
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
