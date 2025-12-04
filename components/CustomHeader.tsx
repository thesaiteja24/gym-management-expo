import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
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
  const theme = useColorScheme(); // "light" | "dark"

  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: isDark ? "#000" : "#fff",
          borderBottomColor: isDark ? "#333" : "#ddd",
        },
      ]}
    >
      {leftIcon ? (
        <TouchableOpacity onPress={onLeftPress} style={styles.left}>
          <Ionicons
            name={leftIcon}
            size={24}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
      ) : null}

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightIcons.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={styles.iconWrapper}
          >
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  left: { width: 40 },
  emptyLeft: { width: 40 },
  rightContainer: {
    flexDirection: "row",
    gap: 16,
  },
  iconWrapper: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
