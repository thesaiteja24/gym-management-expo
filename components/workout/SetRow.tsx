import { WeightUnits } from "@/stores/userStore";
import { WorkoutLogSet } from "@/stores/workoutStore";
import { convertWeight } from "@/utils/converter";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { ElapsedTime } from "./ElapsedTime";

/* ───────────────── Constants ───────────────── */

const SCREEN_WIDTH = Dimensions.get("window").width;
const DELETE_REVEAL_WIDTH = SCREEN_WIDTH * 0.25;

/* ───────────────── Props ───────────────── */

type Props = {
  set: WorkoutLogSet;
  hasWeight: boolean;
  hasReps: boolean;
  hasDuration: boolean;
  preferredWeightUnit: WeightUnits;

  onUpdate: (patch: Partial<WorkoutLogSet>) => void;
  onDelete: () => void;
  onToggleComplete: () => void;

  onStartTimer: () => void;
  onStopTimer: () => void;

  onOpenRestPicker: () => void;
};

/* ───────────────── Component ───────────────── */

function SetRow({
  set,
  hasWeight,
  hasReps,
  hasDuration,
  preferredWeightUnit,
  onUpdate,
  onDelete,
  onToggleComplete,
  onStartTimer,
  onStopTimer,
  onOpenRestPicker,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const lineHeight = Platform.OS === "ios" ? undefined : 18;

  /* ───── Local UI state ───── */

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [weightText, setWeightText] = useState("");
  const [repsText, setRepsText] = useState("");

  const swipeableRef = useRef<SwipeableMethods>(null);
  const hasTriggeredHaptic = useRef(false);

  /* ───── Sync inputs when NOT editing ───── */

  useEffect(() => {
    if (!isEditing && hasWeight) {
      setWeightText(
        set.weight != null
          ? convertWeight(set.weight, {
              from: "kg",
              to: preferredWeightUnit,
              precision: 2,
            }).toString()
          : "",
      );
    }
  }, [set.weight, preferredWeightUnit, isEditing, hasWeight]);

  useEffect(() => {
    if (!isEditing && hasReps) {
      setRepsText(set.reps != null ? set.reps.toString() : "");
    }
  }, [set.reps, isEditing, hasReps]);

  /* ───── Swipe hint ───── */

  const hintTranslateX = useSharedValue(0);
  const hasShownHint = useRef(false);

  const hintStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hintTranslateX.value }],
  }));

  useEffect(() => {
    if (set.setIndex !== 0 || hasShownHint.current) return;

    hasShownHint.current = true;

    hintTranslateX.value = withDelay(
      500,
      withSequence(
        withTiming(40, { duration: 400 }),
        withTiming(-40, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ),
    );
  }, [set.setIndex]);

  /* ───── Actions ───── */

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    swipeableRef.current?.close();
    setIsDeleting(true);
    setTimeout(onDelete, 400);
  };

  /* ───── Rest icon color ───── */

  const restColor = set.completed
    ? "#facc15"
    : set.restSeconds != null
      ? "#22c55e"
      : "#9ca3af";

  /* ───────────────── Render helpers ───────────────── */

  const renderLeftActions = () => (
    <View className="flex-1 items-start justify-center rounded-md bg-green-700 px-6">
      <Ionicons name="checkmark-circle" size={28} color="white" />
    </View>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleDelete}
      className="items-end justify-center rounded-md bg-red-600 px-6"
    >
      <Ionicons name="trash" size={24} color="white" />
    </TouchableOpacity>
  );

  /* ───────────────── Render ───────────────── */

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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          requestAnimationFrame(() => swipeableRef.current?.close());
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
        {/* Left background */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="absolute inset-y-0 left-0 w-20 items-start justify-center bg-green-600 px-4"
        >
          <Ionicons name="checkmark-circle" size={22} color="white" />
        </Animated.View>

        {/* Right background */}
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="absolute inset-y-0 right-0 w-20 items-end justify-center bg-red-600 px-4"
        >
          <Ionicons name="trash" size={20} color="white" />
        </Animated.View>

        {/* Foreground */}
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut.duration(400)}
          style={[hintStyle, { height: 42 }]}
          className={`flex-row items-center justify-around rounded-md px-2 ${
            set.completed
              ? "bg-green-600 dark:bg-green-600"
              : "bg-white dark:bg-black"
          }`}
        >
          {/* Set number */}
          <Text
            className={`w-10 text-center ${
              set.completed ? "text-white" : "text-blue-500"
            }`}
          >
            {set.setIndex + 1}
          </Text>

          {/* Previous */}
          <Text
            className={`flex-1 text-center ${
              set.completed ? "text-white" : "text-blue-500"
            }`}
          >
            --
          </Text>

          {/* Rest */}
          <View className="w-16 items-center">
            <TouchableOpacity onPress={onOpenRestPicker}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={22}
                color={restColor}
              />
            </TouchableOpacity>
          </View>

          {/* Weight */}
          {hasWeight && (
            <TextInput
              value={weightText}
              keyboardType="decimal-pad"
              selectTextOnFocus
              onFocus={() => setIsEditing(true)}
              onBlur={() => {
                setIsEditing(false);
                const num = Number(weightText);
                if (!isNaN(num)) {
                  onUpdate({
                    weight: convertWeight(num, {
                      from: preferredWeightUnit,
                      to: "kg",
                    }),
                  });
                }
              }}
              onChangeText={setWeightText}
              placeholder="0"
              placeholderTextColor={isDark ? "#a3a3a3" : "#737373"}
              style={{ lineHeight }}
              className={`w-20 text-center text-lg ${
                set.completed ? "text-white" : "text-blue-500"
              }`}
            />
          )}

          {/* Reps */}
          {hasReps && (
            <TextInput
              value={repsText}
              keyboardType="number-pad"
              selectTextOnFocus
              onFocus={() => setIsEditing(true)}
              onBlur={() => {
                setIsEditing(false);
                const num = Number(repsText);
                if (!isNaN(num)) onUpdate({ reps: num });
              }}
              onChangeText={setRepsText}
              placeholder="0"
              placeholderTextColor={isDark ? "#a3a3a3" : "#737373"}
              style={{ lineHeight }}
              className={`w-16 text-center text-lg ${
                set.completed ? "text-white" : "text-blue-500"
              }`}
            />
          )}

          {/* Duration */}
          {hasDuration && (
            <TouchableOpacity
              onPress={() =>
                set.durationStartedAt ? onStopTimer() : onStartTimer()
              }
              className="flex w-20 flex-row items-center justify-center gap-x-1"
            >
              <MaterialCommunityIcons
                name={set.durationStartedAt ? "stop" : "play"}
                size={24}
                color={set.completed ? "white" : "#3b82f6"}
              />

              <ElapsedTime
                baseSeconds={set.durationSeconds}
                runningSince={set.durationStartedAt}
                textClassName={
                  set.completed
                    ? "text-lg font-semibold text-white"
                    : "text-lg font-semibold text-blue-500"
                }
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Swipeable>
  );
}

export default memo(SetRow);
