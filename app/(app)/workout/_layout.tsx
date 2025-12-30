import CustomHeader from "@/components/CustomHeader";
import { router, Stack } from "expo-router";
import React from "react";

export default function WorkoutLayout() {
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
      {/* Muscle Groups */}
      <Stack.Screen
        name="index"
        options={
          {
            title: "Log Your Pump",
            leftIcon: "chevron-back-outline",
            onLeftPress: () => {
              router.back();
            },
            rightIcons: [
              {
                name: "checkmark-done",
                disabled: true,
                color: "red",
              },
            ],
          } as any
        }
      />
    </Stack>
  );
}
