import { WeightUnits } from "@/stores/userStore";
import { SetType, WorkoutLogSet } from "@/stores/workoutStore";
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
import RPESelectionModal from "./RPESelectionModal";
import SetTypeSelectionModal from "./SetTypeSelectionModal";

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

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(set.note ?? "");

  const [setTypeModalVisible, setSetTypeModalVisible] = useState(false);

  const [rpeModalVisible, setRpeModalVisible] = useState(false);

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

  useEffect(() => {
    if (!isNoteOpen) {
      setNoteText(set.note ?? "");
    }
  }, [set.note, isNoteOpen]);

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

  function getSetTypeColor(
    set: WorkoutLogSet,
    type: SetType,
    completed: boolean,
  ): { style: string; value: string | number } {
    switch (type) {
      case "warmup":
        if (completed) {
          return { style: "text-white", value: "W" };
        }
        return { style: "text-yellow-500", value: "W" };
      case "dropSet":
        if (completed) {
          return { style: "text-white", value: "D" };
        }
        return { style: "text-purple-500", value: "D" };
      case "failureSet":
        if (completed) {
          return { style: "text-white", value: "F" };
        }
        return { style: "text-red-500", value: "F" };
      default:
        if (completed) {
          return { style: "text-white", value: set.setIndex + 1 };
        }
        return { style: "text-blue-500", value: set.setIndex + 1 };
    }
  }

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
    <View>
      <Swipeable
        ref={swipeableRef}
        enabled={!isEditing && !isDeleting && !setTypeModalVisible}
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
            <Ionicons name="checkmark-circle" size={24} color="white" />
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
            style={[hintStyle, { height: 48 }]}
            className={`flex-row items-center rounded-md ${
              set.completed
                ? "bg-green-600 dark:bg-green-600"
                : "bg-white dark:bg-black"
            }`}
          >
            <View className="basis-[30%] flex-row items-center justify-evenly">
              {/* Set number */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSetTypeModalVisible(true);
                }}
                className="items-center"
              >
                <Text
                  className={`text-center text-lg font-bold ${getSetTypeColor(set, set.setType, set.completed).style}`}
                >
                  {getSetTypeColor(set, set.setType, set.completed).value}
                </Text>
              </TouchableOpacity>

              {/* Previous */}
              <Text
                className={`text-center ${
                  set.completed ? "text-white" : "text-blue-500"
                }`}
              >
                --
              </Text>
            </View>

            {/* Rest and Note */}
            <View className="basis-[40%] flex-row items-center justify-evenly">
              {/* Rest */}
              <TouchableOpacity onPress={onOpenRestPicker}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={24}
                  color={restColor}
                />
              </TouchableOpacity>

              {/* Note */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsNoteOpen((v) => !v);
                }}
                className="items-center"
              >
                <MaterialCommunityIcons
                  name={
                    set.note || isNoteOpen ? "note-text" : "note-text-outline"
                  }
                  size={20}
                  color={set.completed ? "white" : "#6b7280"}
                />
              </TouchableOpacity>

              {/* RPE */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRpeModalVisible(true);
                }}
                className={`rounded-full px-2 py-1 ${
                  set.rpe ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    set.rpe
                      ? "text-white"
                      : "text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {set.rpe ? `${set.rpe}` : "RPE"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Load */}
            <View className="basis-[30%] flex-row items-center justify-evenly">
              {/* Weight */}
              {hasWeight && (
                <TextInput
                  value={weightText}
                  keyboardType="decimal-pad"
                  // selectTextOnFocus
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
                  className={`text-center text-lg ${
                    set.completed ? "text-white" : "text-blue-500"
                  }`}
                />
              )}

              {/* Reps */}
              {hasReps && (
                <TextInput
                  value={repsText}
                  keyboardType="number-pad"
                  // selectTextOnFocus
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
                  className={`text-center text-lg ${
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
                  className="flex flex-row items-center justify-center"
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
            </View>
          </Animated.View>
        </View>
      </Swipeable>
      {isNoteOpen && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          className="rounded-md bg-white px-4 dark:bg-black"
        >
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            multiline
            placeholder="Add a note for this set…"
            placeholderTextColor="#9ca3af"
            className="text-base text-black dark:text-white"
            onBlur={() => {
              const trimmed = noteText.trim();
              if (trimmed !== (set.note ?? "")) {
                onUpdate({ note: trimmed || undefined });
              }
            }}
            blurOnSubmit
            style={{ lineHeight: lineHeight }}
          />
        </Animated.View>
      )}

      <SetTypeSelectionModal
        visible={setTypeModalVisible}
        currentType={set.setType}
        onClose={() => setSetTypeModalVisible(false)}
        onSelect={(type) => {
          if (type !== set.setType) {
            onUpdate({ setType: type });
          }
        }}
      />

      <RPESelectionModal
        visible={rpeModalVisible}
        currentValue={set.rpe}
        onClose={() => setRpeModalVisible(false)}
        onSelect={(value) => {
          onUpdate({ rpe: value });
          setRpeModalVisible(false);
        }}
      />
    </View>
  );
}

export default memo(SetRow);
