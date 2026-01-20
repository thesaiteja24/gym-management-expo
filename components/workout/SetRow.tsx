import { useThemeColor } from "@/hooks/useThemeColor";
import { TemplateSet } from "@/stores/template/types";
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
import RPESelectionModal, {
  RPESelectionModalHandle,
} from "./RPESelectionModal";
import SetTypeSelectionModal, {
  SetTypeSelectionModalHandle,
} from "./SetTypeSelectionModal";

/* ───────────────── Constants ───────────────── */

const SCREEN_WIDTH = Dimensions.get("window").width;
const DELETE_REVEAL_WIDTH = SCREEN_WIDTH * 0.25;

/* ───────────────── Props ───────────────── */

/**
 * Props for the SetRow component.
 */
type Props = {
  /** The set data. Union of Active (WorkoutLogSet) and Template (TemplateSet). */
  set: WorkoutLogSet | TemplateSet;
  /** Whether the parent exercise involves weight (e.g. Bench Press). */
  hasWeight: boolean;
  /** Whether the parent exercise involves reps. */
  hasReps: boolean;
  /** Whether the parent exercise involves duration (e.g. Planks). */
  hasDuration: boolean;
  /** User preference for display unit (kg vs lbs). */
  preferredWeightUnit: WeightUnits;
  /** Template mode flag. Affects input interactivity and available actions. */
  isTemplate?: boolean;

  /* ─── Data Actions ─── */
  onUpdate: (patch: Partial<WorkoutLogSet>) => void;
  onDelete: () => void;
  onToggleComplete?: () => void;

  /* ─── Timer Actions (Active Mode Only) ─── */
  onStartTimer?: () => void;
  onStopTimer?: () => void;

  /* ─── UI Actions ─── */
  onOpenRestPicker: () => void;
};

/* ───────────────── Component ───────────────── */

/**
 * A collaborative row for a single set.
 *
 * Features:
 * - **Swipe-to-Delete**: Right swipe reveals delete action (Red).
 * - **Swipe-to-Complete**: Left swipe (Active Mode only) toggles completion (Green).
 * - **Animations**: Uses `react-native-reanimated` for entry/exit and hint animations.
 * - **Dual Mode**: Works for both active workouts (timers, completion) and templates (static inputs).
 */
function SetRow({
  set,
  hasWeight,
  hasReps,
  hasDuration,
  preferredWeightUnit,
  isTemplate = false,
  onUpdate,
  onDelete,
  onToggleComplete,
  onStartTimer,
  onStopTimer,
  onOpenRestPicker,
}: Props) {
  const colors = useThemeColor();
  // @ts-ignore
  const isCompleted = !isTemplate && set.completed;
  const isDark = useColorScheme() === "dark";
  const lineHeight = Platform.OS === "ios" ? undefined : 18;

  /* ───── Local UI state ───── */

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [weightText, setWeightText] = useState("");
  const [repsText, setRepsText] = useState("");
  const [durationText, setDurationText] = useState("");

  const swipeableRef = useRef<SwipeableMethods>(null);
  const hasTriggeredHaptic = useRef(false);

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  // @ts-ignore
  const [noteText, setNoteText] = useState(set.note || "");

  // const [setTypeModalVisible, setSetTypeModalVisible] = useState(false); // Removed
  const setTypeModalRef = useRef<SetTypeSelectionModalHandle>(null);

  // const [rpeModalVisible, setRpeModalVisible] = useState(false); // Removed
  const rpeModalRef = useRef<RPESelectionModalHandle>(null);

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
    if (!isEditing && hasDuration && isTemplate) {
      setDurationText(
        set.durationSeconds != null ? set.durationSeconds.toString() : "",
      );
    }
  }, [set.durationSeconds, isEditing, hasDuration, isTemplate]);

  useEffect(() => {
    if (!isNoteOpen) {
      // @ts-ignore
      setNoteText(set.note ?? "");
    }
  }, [
    // @ts-ignore
    set.note,
    isNoteOpen,
    isTemplate,
  ]);

  /* ───── Swipe hint ───── */

  const hintTranslateX = useSharedValue(0);
  const hasShownHint = useRef(false);

  const hintStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hintTranslateX.value }],
  }));

  useEffect(() => {
    if (set.setIndex !== 0 || hasShownHint.current || isTemplate) return;

    hasShownHint.current = true;

    hintTranslateX.value = withDelay(
      500,
      withSequence(
        withTiming(40, { duration: 400 }),
        withTiming(-40, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ),
    );
  }, [set.setIndex, isTemplate]);

  /* ───── Actions ───── */

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    swipeableRef.current?.close();
    setIsDeleting(true);
    setTimeout(onDelete, 400);
  };

  function getSetTypeColor(
    set: WorkoutLogSet | TemplateSet,
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
        return { style: "text-danger", value: "F" };
      default:
        if (completed) {
          return { style: "text-white", value: set.setIndex + 1 };
        }
        return { style: "text-primary", value: set.setIndex + 1 };
    }
  }

  /* ───── Rest icon color ───── */

  const restColor = isCompleted
    ? "#facc15"
    : set.restSeconds != null
      ? colors.success
      : "#9ca3af";

  /* ───────────────── Render helpers ───────────────── */

  const renderLeftActions = () => {
    if (isTemplate) return null; // Disable left swipe (green) for templates
    return (
      <View className="flex-1 items-start justify-center rounded-md bg-success px-6">
        <Ionicons name="checkmark-circle" size={28} color="white" />
      </View>
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleDelete}
      className="items-end justify-center rounded-md bg-danger px-6"
    >
      <Ionicons name="trash" size={22} color="white" />
    </TouchableOpacity>
  );

  /* ───────────────── Render ───────────────── */

  // Always use Swipeable now, but conditionally enable parts
  const Wrapper = Swipeable;
  const wrapperProps = {
    ref: swipeableRef,
    // enabled: !isEditing && !isDeleting && !setTypeModalVisible, // "visible" check removed as it's now imperative
    enabled: !isEditing && !isDeleting,
    overshootLeft: false,
    overshootRight: false,
    overshootFriction: 4,
    leftThreshold: 80,
    rightThreshold: DELETE_REVEAL_WIDTH,
    renderLeftActions: renderLeftActions,
    renderRightActions: renderRightActions,
    onSwipeableOpen: (direction: "left" | "right") => {
      if (hasTriggeredHaptic.current) return;
      hasTriggeredHaptic.current = true;

      if (direction === "right") {
        if (!isTemplate) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          requestAnimationFrame(() => swipeableRef.current?.close());
          onToggleComplete?.();
        }
      }

      if (direction === "left") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    onSwipeableClose: () => {
      hasTriggeredHaptic.current = false;
    },
  };

  return (
    <View>
      {/* @ts-ignore */}
      <Wrapper {...wrapperProps}>
        <View className="relative overflow-hidden rounded-md">
          {!isTemplate && (
            <>
              {/* Left background */}
              <Animated.View
                entering={FadeIn.duration(1000)}
                className="absolute inset-y-0 left-0 w-20 items-start justify-center bg-success px-4"
              >
                <Ionicons name="checkmark-circle" size={22} color="white" />
              </Animated.View>
            </>
          )}

          {/* Right background - Always present */}
          <Animated.View
            entering={FadeIn.duration(1000)}
            className="absolute inset-y-0 right-0 w-20 items-end justify-center bg-danger px-4"
          >
            <Ionicons name="trash" size={22} color="white" />
          </Animated.View>

          {/* Foreground */}
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut.duration(400)}
            style={[hintStyle, { height: 44 }]}
            className={`flex-row items-center rounded-md ${
              isCompleted
                ? "bg-success dark:bg-success"
                : "bg-white dark:bg-black"
            }`}
          >
            <View className="basis-[35%] flex-row items-center justify-evenly">
              {/* Set number */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTypeModalRef.current?.present();
                }}
                className="items-center"
              >
                <Text
                  className={`text-center text-base font-semibold ${getSetTypeColor(set, set.setType, isCompleted).style}`}
                >
                  {getSetTypeColor(set, set.setType, isCompleted).value}
                </Text>
              </TouchableOpacity>

              {/* Previous */}
              {!isTemplate ? (
                <Text
                  className={`text-center text-base font-medium ${
                    isCompleted
                      ? "text-white"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  --
                </Text>
              ) : (
                <View className="w-8" /> // Spacer
              )}
            </View>

            {/* Rest and Note */}
            <View className="basis-[35%] flex-row items-center justify-between">
              {/* Rest */}
              <TouchableOpacity onPress={onOpenRestPicker}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={22}
                  color={restColor}
                />
              </TouchableOpacity>

              {/* Note - Enabled for Templates too */}
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
                  size={22}
                  color={isCompleted ? "white" : "#6b7280"}
                />
              </TouchableOpacity>

              {/* RPE */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  rpeModalRef.current?.present();
                }}
                className={`w-12 rounded-full py-1 ${
                  isCompleted
                    ? "bg-white"
                    : set.rpe
                      ? "bg-primary"
                      : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              >
                <Text
                  numberOfLines={1}
                  className={`text-center text-sm font-semibold ${
                    isCompleted
                      ? "text-black"
                      : set.rpe
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
                  placeholderTextColor={isCompleted ? "#ffffff" : "#737373"}
                  style={{ lineHeight }}
                  className={`text-center text-base ${
                    isCompleted ? "text-white" : "text-primary"
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
                  placeholderTextColor={isCompleted ? "#ffffff" : "#737373"}
                  style={{ lineHeight }}
                  className={`text-center text-base ${
                    isCompleted ? "text-white" : "text-primary"
                  }`}
                />
              )}

              {/* Duration */}
              {hasDuration && (
                <>
                  {!isTemplate ? (
                    <TouchableOpacity
                      onPress={() =>
                        // @ts-ignore
                        set.durationStartedAt ? onStopTimer() : onStartTimer()
                      }
                      className="flex flex-row items-center justify-center"
                    >
                      <MaterialCommunityIcons
                        name={
                          // @ts-ignore
                          set.durationStartedAt ? "stop" : "play"
                        }
                        size={22}
                        color={isCompleted ? "white" : colors.primary}
                      />

                      <ElapsedTime
                        baseSeconds={set.durationSeconds}
                        // @ts-ignore
                        runningSince={set.durationStartedAt}
                        textClassName={
                          isCompleted
                            ? "text-base font-semibold text-white"
                            : "text-base font-semibold text-primary"
                        }
                      />
                    </TouchableOpacity>
                  ) : (
                    <TextInput
                      value={durationText}
                      keyboardType="number-pad"
                      onFocus={() => setIsEditing(true)}
                      onBlur={() => {
                        setIsEditing(false);
                        const num = Number(durationText);
                        if (!isNaN(num)) onUpdate({ durationSeconds: num });
                      }}
                      onChangeText={setDurationText}
                      placeholder="0s"
                      placeholderTextColor={"#737373"}
                      style={{ lineHeight }}
                      className="text-center text-base text-primary"
                    />
                  )}
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Wrapper>
      {/* Show Note Input if Open (for both modes now) */}
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
            placeholderTextColor={"#9ca3af"}
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
        ref={setTypeModalRef}
        currentType={set.setType}
        onClose={() => {}}
        onSelect={(type) => {
          if (type !== set.setType) {
            onUpdate({ setType: type });
          }
        }}
      />

      <RPESelectionModal
        ref={rpeModalRef}
        currentValue={set.rpe}
        onClose={() => {}}
        onSelect={(value) => {
          onUpdate({ rpe: value });
        }}
      />
    </View>
  );
}

export default memo(SetRow);
