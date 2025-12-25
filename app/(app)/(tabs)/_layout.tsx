import CustomHeader from "@/components/CustomHeader";
import CustomTabs from "@/components/CustomTabs";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
      screenOptions={{
        tabBarShowLabel: false,
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
      {/* HOME (simple screen → Tabs owns header) */}
      <Tabs.Screen
        name="home"
        options={
          {
            title: "Home",
            headerShown: false,
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
                color={color}
              />
            ),
          } as any
        }
      />

      {/* EXERCISES (stacked section → disable tab header) */}
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          headerShown: false,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              size={size ?? 22}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE (stacked section → disable tab header) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size ?? 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
