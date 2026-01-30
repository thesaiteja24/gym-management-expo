import { ExerciseType } from "@/stores/exerciseStore";
import { WorkoutHistoryItem } from "@/stores/workoutStore";
import { formatDate, formatDurationFromDates } from "@/utils/time";
import { calculateWorkoutMetrics } from "@/utils/workout";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WorkoutCard({
  workout,
  exerciseTypeMap,
  index = 0,
}: {
  workout: WorkoutHistoryItem;
  exerciseTypeMap: Map<string, ExerciseType>;
  index?: number;
}) {
  const duration = formatDurationFromDates(workout.startTime, workout.endTime);
  const volume = calculateWorkoutMetrics(workout, exerciseTypeMap).tonnage;

  // Guard against missing exercises array
  const exercises = workout.exercises || [];
  const previewExercises = exercises.slice(0, 3);
  const remaining = exercises.length - previewExercises.length;

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(1);

  useEffect(() => {
    const delay = index * 100 + 500;
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, { damping: 10, stiffness: 300 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      style={animatedStyle}
      // onPressIn={onPressIn}
      // onPressOut={onPressOut}
      onPress={() => {
        router.push(`/(app)/workout/${workout.id}`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Header */}
      <View className="mb-4 flex-col justify-between gap-2">
        <View className="flex-row items-center justify-between gap-4">
          <Text className="line-clamp-1 text-lg font-medium text-black dark:text-white">
            {workout.title || "Workout"}
          </Text>
          <Text className="self-end rounded-full bg-blue-200 px-2 py-1 text-right text-xs font-normal text-blue-600">
            {workout.syncStatus}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-4">
          {workout?.user?.firstName && (
            <Text className="flex-1 text-base font-medium text-primary">
              {workout?.user?.firstName + " " + workout?.user?.lastName}
            </Text>
          )}

          <Text className="flex-1 text-sm font-normal text-primary">
            <Text className="text-sm font-medium text-black dark:text-white">
              Duration:
            </Text>{" "}
            {duration}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <Text className="flex-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
            {formatDate(workout.startTime)}
          </Text>
          <Text className="flex-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
            Volume: {volume} kg
          </Text>
        </View>
      </View>

      {/* Exercise preview */}
      {previewExercises.map((ex: any) => (
        <View key={ex.id} className="mb-2 flex-row items-center gap-3">
          <Image
            cachePolicy="disk"
            source={ex.exercise.thumbnailUrl}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              borderColor: "#ccc",
              borderWidth: 1,
            }}
            contentFit="cover"
          />

          <Text
            numberOfLines={1}
            className="flex-1 text-base font-medium text-black dark:text-white"
          >
            {ex.sets.length} sets of {ex.exercise.title}
          </Text>
        </View>
      ))}

      {remaining > 0 && (
        <Text className="mt-1 text-center text-sm text-primary">
          See {remaining} more exercise{remaining > 1 ? "s" : ""}
        </Text>
      )}
    </AnimatedPressable>
  );
}
