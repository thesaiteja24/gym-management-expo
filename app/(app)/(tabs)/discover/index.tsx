import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, useColorScheme } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiscoverScreen() {
  const colors = useColorScheme();

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4 dark:bg-black">
      <Animated.View
        style={headerAnimatedStyle}
        className="mb-4 flex-row items-center justify-between"
      >
        <Text
          numberOfLines={1}
          className="text-2xl font-semibold text-black dark:text-white"
        >
          Discover
        </Text>
        <Pressable
          onPress={() => {
            router.push("/(app)/profile/search");
          }}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="black" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
