import SetRow from "@/components/workout/SetRow";
import { Exercise, ExerciseType } from "@/stores/exerciseStore";
import { WeightUnits } from "@/stores/userStore";
import { WorkoutLogExercise } from "@/stores/workoutStore";
import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Button } from "../ui/Button";
import RestTimerPickerModal from "./RestTimerPickerModal";

/* ───────────────── Capabilities ───────────────── */

const EXERCISE_CAPABILITIES: Record<
  ExerciseType,
  { hasWeight: boolean; hasReps: boolean; hasDuration: boolean }
> = {
  weighted: { hasWeight: true, hasReps: true, hasDuration: false },
  repsOnly: { hasWeight: false, hasReps: true, hasDuration: false },
  assisted: { hasWeight: false, hasReps: true, hasDuration: false },
  durationOnly: { hasWeight: false, hasReps: false, hasDuration: true },
};

/* ───────────────── Props ───────────────── */

type Props = {
  exercise: WorkoutLogExercise;
  exerciseDetails: Exercise;
  isActive: boolean;
  isDragging: boolean;
  preferredWeightUnit: WeightUnits;

  drag: () => void;
  onPress: () => void;

  onReplaceExercise: () => void;
  onDeleteExercise: () => void;

  onAddSet: () => void;
  onUpdateSet: (setId: string, patch: any) => void;
  onToggleCompleteSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;

  onStartSetTimer: (setId: string) => void;
  onStopSetTimer: (setId: string) => void;

  onSaveRestPreset: (setId: string, seconds: number) => void;
};

/* ───────────────── Component ───────────────── */

function ExerciseRow({
  exercise,
  exerciseDetails,
  isDragging,
  isActive,
  preferredWeightUnit,
  drag,
  onPress,
  onReplaceExercise,
  onDeleteExercise,
  onAddSet,
  onUpdateSet,
  onToggleCompleteSet,
  onDeleteSet,
  onStartSetTimer,
  onStopSetTimer,
  onSaveRestPreset,
}: Props) {
  const isDark = useColorScheme() === "dark";

  const { hasWeight, hasReps, hasDuration } =
    EXERCISE_CAPABILITIES[exerciseDetails.exerciseType];

  /* ───── Local UI state only ───── */

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [restPickerVisible, setRestPickerVisible] = useState(false);
  const [activeRestSetId, setActiveRestSetId] = useState<string | null>(null);

  const menuRef = useRef<View>(null);

  useEffect(() => {
    if (isDragging) {
      setMenuVisible(false);
    }
  }, [isDragging]);

  /* ───────────────── Render ───────────────── */

  return (
    <View
      className="m-4 flex gap-4"
      style={{
        opacity: isActive ? 0.95 : 1,
        transform: [{ scale: isActive ? 1.02 : 1 }],
      }}
    >
      {/* ───── Header / drag handle ───── */}
      <View className="flex-row items-center justify-between">
        <View className="w-8/12">
          <TouchableOpacity
            onPress={onPress}
            onLongPress={drag}
            activeOpacity={0.8}
            className="flex-row items-center gap-4"
          >
            <Image
              source={exerciseDetails.thumbnailUrl}
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: "gray",
              }}
            />

            <Text className="text-xl font-semibold text-black dark:text-white">
              {exerciseDetails.title}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          ref={menuRef}
          onPress={() => {
            menuRef.current?.measureInWindow((x, y, width, height) => {
              setMenuPosition({
                x: x + width - 160,
                y: y + height + 6,
              });
              setMenuVisible(true);
            });
          }}
        >
          <Entypo
            name="dots-three-horizontal"
            size={24}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      {/* ───── Sets header ───── */}
      <View className="flex-row items-center px-2">
        <Text className="w-10 text-lg font-semibold text-black dark:text-white">
          Set
        </Text>

        <Text className="flex-1 text-center text-lg font-semibold text-black dark:text-white">
          Previous
        </Text>

        <View className="w-16 items-center">
          <MaterialIcons
            name="restore"
            size={22}
            color={isDark ? "white" : "black"}
          />
        </View>

        {hasWeight && (
          <View className="w-20 items-center">
            <MaterialCommunityIcons
              name={
                preferredWeightUnit === "kg"
                  ? "weight-kilogram"
                  : "weight-pound"
              }
              size={22}
              color={isDark ? "white" : "black"}
            />
          </View>
        )}

        {hasReps && (
          <View className="w-16 items-center">
            <Entypo name="cycle" size={22} color={isDark ? "white" : "black"} />
          </View>
        )}

        {hasDuration && (
          <View className="w-20 items-center">
            <MaterialCommunityIcons
              name="timer-outline"
              size={22}
              color={isDark ? "white" : "black"}
            />
          </View>
        )}
      </View>

      {/* ───── Sets ───── */}
      {exercise.sets.map((set) => (
        <SetRow
          key={set.id}
          set={set}
          hasWeight={hasWeight}
          hasReps={hasReps}
          hasDuration={hasDuration}
          preferredWeightUnit={preferredWeightUnit}
          onUpdate={(patch) => onUpdateSet(set.id, patch)}
          onToggleComplete={() => onToggleCompleteSet(set.id)}
          onDelete={() => onDeleteSet(set.id)}
          onStartTimer={() => onStartSetTimer(set.id)}
          onStopTimer={() => onStopSetTimer(set.id)}
          onOpenRestPicker={() => {
            setActiveRestSetId(set.id);
            setRestPickerVisible(true);
          }}
        />
      ))}

      {/* ───── Add set ───── */}
      <Button title="Add Set" variant="secondary" onPress={onAddSet} />

      {/* ───── Menu ───── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className="flex-1" onPress={() => setMenuVisible(false)} />

        <View
          style={{
            position: "absolute",
            top: menuPosition.y,
            left: menuPosition.x,
            width: 160,
          }}
          className="rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              onReplaceExercise();
            }}
            className="px-4 py-3"
          >
            <Text className="text-base text-black dark:text-white">
              Replace Exercise
            </Text>
          </TouchableOpacity>

          <View className="h-px bg-neutral-200 dark:bg-neutral-800" />

          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              onDeleteExercise();
            }}
            className="px-4 py-3"
          >
            <Text className="text-base text-red-600">Delete Exercise</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ───── Rest picker ───── */}
      <RestTimerPickerModal
        visible={restPickerVisible}
        initialSeconds={
          activeRestSetId
            ? (exercise.sets.find((s) => s.id === activeRestSetId)
                ?.restSeconds ?? 60)
            : 60
        }
        onClose={() => {
          setRestPickerVisible(false);
          setActiveRestSetId(null);
        }}
        onConfirm={(seconds) => {
          if (!activeRestSetId) return;

          onSaveRestPreset(activeRestSetId, seconds);

          setRestPickerVisible(false);
          setActiveRestSetId(null);
        }}
      />
    </View>
  );
}

export default React.memo(ExerciseRow);
