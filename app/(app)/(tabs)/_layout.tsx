import CustomHeader from "@/components/CustomHeader";
import CustomTabs from "@/components/CustomTabs";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
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
        tabBarShowLabel: false, // labels handled by our CustomTabs
      }}
    >
      <Tabs.Screen
        name="home"
        options={
          {
            title: "Home",
            tabBarIcon: ({
              color,
              focused,
              size,
            }: {
              focused: boolean;
              color: string;
              size: number;
            }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size ?? 22}
                color={color as string}
              />
            ),
            rightIcons: [
              {
                name: "settings-outline",
                onPress: () => router.push("/profile/settings"),
              },
            ],
          } as any
        }
      />

      <Tabs.Screen
        name="exercises"
        options={
          {
            title: "Exercises",
            tabBarIcon: ({
              color,
              focused,
              size,
            }: {
              focused: boolean;
              color: string;
              size: number;
            }) => (
              <Ionicons
                name={focused ? "barbell" : "barbell-outline"}
                size={size ?? 22}
                color={color as string}
              />
            ),
          } as any
        }
      />

      <Tabs.Screen
        name="profile"
        options={
          {
            title: "Profile",
            tabBarIcon: ({
              color,
              focused,
              size,
            }: {
              focused: boolean;
              color: string;
              size: number;
            }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size ?? 22}
                color={color as string}
              />
            ),
            rightIcons: [
              {
                name: "create-outline",
                onPress: () => router.push("/profile/edit"),
              },
              {
                name: "settings-outline",
                onPress: () => router.push("/profile/settings"),
              },
            ],
          } as any
        }
      />
    </Tabs>
  );
}
