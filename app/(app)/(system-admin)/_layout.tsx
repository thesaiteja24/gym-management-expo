import CustomHeader from "@/components/CustomHeader";
import { router, Stack } from "expo-router";
import React from "react";

export default function SystemAdminLayout() {
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
        name="muscle-group/[id]"
        options={
          {
            title: "Edit Muscle Group",
            leftIcon: "chevron-back-outline",
            onLeftPress: () => {
              router.back();
            },
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
    </Stack>
  );
}
