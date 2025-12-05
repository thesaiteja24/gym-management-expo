import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconName = keyof typeof Ionicons.glyphMap;

type CustomHeaderProps = {
  title: string;
  leftIcon?: IoniconName;
  rightIcons?: { name: IoniconName; onPress: () => void }[];
  onLeftPress?: () => void;
};

export default function CustomHeader({
  title,
  leftIcon,
  rightIcons = [],
  onLeftPress,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const headerHeight =
    Platform.OS === "ios" ? 44 + insets.top : 56 + insets.top;

  return (
    <View
      className="flex flex-row w-full items-center justify-between px-4 bg-white dark:bg-black border-b border-b-[#ddd] dark:border-b-[#333]"
      style={{ height: headerHeight, paddingTop: insets.top }}
    >
      {/* Left icon */}

      {leftIcon && (
        <TouchableOpacity onPress={onLeftPress}>
          <Ionicons
            name={leftIcon}
            size={24}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
      )}

      {/* Title */}
      {leftIcon && (
        // If left icon exists → center the title
        <View
          className="absolute left-0 right-0 items-center"
          style={{ marginTop: insets.top }}
        >
          <Text
            className="font-semibold text-2xl text-black dark:text-white"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}

      {!leftIcon && (
        <Text
          className="font-semibold text-2xl text-black dark:text-white"
          numberOfLines={1}
        >
          {title}
        </Text>
      )}

      {/* Right icons */}
      <View className="flex flex-row items-center w-16 justify-end">
        {rightIcons.map((item, index) => (
          <TouchableOpacity key={index} onPress={item.onPress} className="px-2">
            <Ionicons
              name={item.name}
              size={24}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
