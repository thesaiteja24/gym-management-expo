import CustomHeader from "@/components/CustomHeader";
import { router, Stack } from "expo-router";
import React from "react";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
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
      {/* EXERCISES LIST */}
      <Stack.Screen
        name="index"
        options={
          {
            title: "Home",
            rightIcons: [
              {
                name: "settings-outline",
                onPress: () => router.push("/profile/settings"),
              },
            ],
          } as any
        }
      />
    </Stack>
  );
}
