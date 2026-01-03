import { useWorkout } from "@/stores/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RestTimerSnack() {
  const {
    restRunning,
    restSeconds,
    restStartedAt,
    stopRestTimer,
    adjustRestTimer,
  } = useWorkout();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!restRunning) return;

    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [restRunning]);

  if (!restRunning || restSeconds == null || restStartedAt == null) {
    return null;
  }

  const elapsed = Math.floor((now - restStartedAt) / 1000);
  const remaining = Math.max(0, restSeconds - elapsed);

  // Auto stop
  if (remaining === 0) {
    stopRestTimer();
    return null;
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-black px-4 py-3 dark:bg-neutral-900">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">
          Rest • {format(remaining)}
        </Text>

        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => adjustRestTimer(-10)}>
            <Text className="text-lg text-white">−10</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => adjustRestTimer(10)}>
            <Text className="text-lg text-white">+10</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopRestTimer}>
            <Ionicons name="close-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
