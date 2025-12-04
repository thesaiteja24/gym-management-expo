import CustomHeader from "@/components/CustomHeader";
import { router, Tabs } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        header: (props) => {
          const { options } = props;

          // read custom props from options
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
      <Tabs.Screen
        name="home"
        options={
          {
            title: "Home",
            // custom props
            rightIcons: [
              {
                name: "settings-outline",
                onPress: () => router.push("/settings"),
              },
            ],
          } as any
        }
      />

      <Tabs.Screen
        name="workout"
        options={
          {
            title: "Workouts",
          } as any
        }
      />

      <Tabs.Screen
        name="profile"
        options={
          {
            title: "Profile",
            rightIcons: [
              {
                name: "create-outline",
                onPress: () => console.log("Edit clicked"),
              },
              {
                name: "settings-outline",
                onPress: () => router.push("/settings"),
              },
            ],
          } as any
        }
      />
    </Tabs>
  );
}
