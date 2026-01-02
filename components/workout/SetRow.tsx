import { WorkoutLogSet } from "@/stores/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  set: WorkoutLogSet;
  onUpdate: (patch: Partial<WorkoutLogSet>) => void;
  onDelete: () => void;
  onToggleComplete: () => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const DELETE_REVEAL_WIDTH = SCREEN_WIDTH * 0.25; // 25% width for delete button

function SetRow({ set, onUpdate, onDelete, onToggleComplete }: Props) {
  const isDark = useColorScheme() === "dark";
  const lineHeight = Platform.OS === "ios" ? 0 : 30;
  const isAndroid = Platform.OS === "android";
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const swipeableRef = useRef<SwipeableMethods>(null);
  const hasTriggeredHaptic = useRef(false);
  const hintTranslateX = useSharedValue(0);
  const hintStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hintTranslateX.value }],
  }));

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    swipeableRef.current?.close();
    setIsDeleting(true);

    setTimeout(() => {
      onDelete();
    }, 400); // match animation duration
  };

  useEffect(() => {
    if (set.hasSeenSwipeHint) return;

    hintTranslateX.value = withDelay(
      500,
      withSequence(
        withTiming(50, { duration: 500 }),
        withTiming(-50, { duration: 500 }),
        withTiming(0, { duration: 500 }),
      ),
    );

    onUpdate({ hasSeenSwipeHint: true });
  }, []);

  // Left swipe → complete
  const renderLeftActions = () => (
    <View className="flex-1 items-start justify-center rounded-md bg-green-700 px-6">
      <Ionicons name="checkmark-circle" size={28} color="white" />
    </View>
  );

  // Right swipe → delete button (fixed width)
  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleDelete}
      className="items-end justify-center rounded-md bg-red-600 px-6"
    >
      <Ionicons name="trash" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      enabled={!isEditing && !isDeleting}
      overshootLeft={false}
      overshootRight={false}
      overshootFriction={4}
      leftThreshold={80}
      rightThreshold={DELETE_REVEAL_WIDTH}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (hasTriggeredHaptic.current) return;

        hasTriggeredHaptic.current = true;

        if (direction === "right") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          requestAnimationFrame(() => {
            swipeableRef.current?.close();
          });

          onToggleComplete();
        }

        if (direction === "left") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onSwipeableClose={() => {
        hasTriggeredHaptic.current = false;
      }}
    >
      <View className="relative overflow-hidden rounded-md">
        {/* LEFT (complete) */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="absolute inset-y-0 left-0 w-20 items-start justify-center bg-green-600 px-4"
        >
          <Ionicons name="checkmark-circle" size={22} color="white" />
        </Animated.View>

        {/* RIGHT (delete) */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="absolute inset-y-0 right-0 w-20 items-end justify-center bg-red-600 px-4"
        >
          <Ionicons name="trash" size={20} color="white" />
        </Animated.View>

        <Animated.View
          entering={FadeIn}
          exiting={FadeOut.duration(400)}
          style={hintStyle}
          className={`flex-row items-center justify-around rounded-md ${
            set.completed
              ? "bg-green-600 dark:bg-green-600"
              : "bg-white dark:bg-black"
          } ${isAndroid ? "px-2" : "p-2"} `}
        >
          {/* Set number */}
          <Text
            className={`w-10 text-center text-blue-500 ${set.completed ? "text-white" : ""}`}
          >
            {set.setIndex + 1}
          </Text>

          {/* Previous */}
          <Text
            className={`flex-1 text-center text-blue-500 ${set.completed ? "text-white" : ""}`}
          >
            --
          </Text>

          {/* Weight */}
          <TextInput
            value={set.weight?.toString()}
            keyboardType="numeric"
            selectTextOnFocus
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className={`w-16 text-center text-lg ${set.completed ? "text-white" : "text-blue-500"}`}
            placeholder="0"
            placeholderTextColor={isDark ? "#a3a3a3" : "#737373"}
            onChangeText={(text) => onUpdate({ weight: Number(text) })}
            style={{ lineHeight }}
          />

          {/* Reps */}
          <TextInput
            value={set.reps?.toString()}
            keyboardType="numeric"
            selectTextOnFocus
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className={`w-16 text-center text-lg ${set.completed ? "text-white" : "text-blue-500"}`}
            placeholder="0"
            placeholderTextColor={isDark ? "#a3a3a3" : "#737373"}
            onChangeText={(text) => onUpdate({ reps: Number(text) })}
            style={{ lineHeight }}
          />
        </Animated.View>
      </View>
    </Swipeable>
  );
}

export default memo(SetRow);
