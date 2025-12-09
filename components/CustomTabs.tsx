// components/CustomTabs.tsx
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function CustomTabs({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const isDark = useColorScheme() === "dark";

  // monochrome palette
  const barBg = isDark ? "#000000" : "#FFFFFF";
  const barBorder = isDark ? "#222222" : "#DDDDDD";
  const activeColor = isDark ? "#FFFFFF" : "#000000";
  const inactiveColor = "#A8A8A8";
  const pillBg = isDark ? "#111111" : "#F2F2F2";

  return (
    <View
      style={{
        backgroundColor: isDark ? "#000000" : "#FFFFFF",
      }}
    >
      {/* tray */}
      <View
        style={{
          backgroundColor: barBg,
          borderColor: barBorder,
          borderWidth: 1,
          borderRadius: 50,
          paddingHorizontal: 12,
          paddingVertical: Platform.OS === "ios" ? 10 : 8,
          marginHorizontal: 20,
          marginBottom: 24,
          height: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const Icon = (options.tabBarIcon as any) || null;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            // Pill button
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              activeOpacity={0.9}
              style={{
                backgroundColor: isFocused ? pillBg : "transparent",
                borderRadius: 24,
                flex: 1,
                alignItems: "center",
                minWidth: isFocused ? 112 : 88,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  minHeight: 40,
                  minWidth: 112,
                  borderRadius: 24,
                  marginHorizontal: 12,
                }}
              >
                {Icon ? (
                  <Icon
                    focused={isFocused}
                    color={isFocused ? activeColor : inactiveColor}
                    size={22}
                  />
                ) : null}

                {/* label only when focused */}
                <Text
                  numberOfLines={1}
                  style={{
                    marginLeft: isFocused ? 8 : 0,
                    color: isFocused ? activeColor : inactiveColor,
                    fontSize: 16,
                    fontWeight: isFocused ? "600" : "400",
                    // hide without shifting layout when not focused
                    opacity: isFocused ? 1 : 0,
                    position: isFocused ? "relative" : "absolute",
                  }}
                >
                  {String(label)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
