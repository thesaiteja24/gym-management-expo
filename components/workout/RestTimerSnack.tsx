import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  visible: boolean;
  remainingSeconds: number;
  onAddTime: (delta: number) => void;
  onSkip: () => void;
};

export default function RestTimerSnack({
  visible,
  remainingSeconds,
  onAddTime,
  onSkip,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const safeAreaInsets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 mx-4 mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-2 shadow-lg dark:border-neutral-800 dark:bg-black"
      style={{ marginBottom: safeAreaInsets.bottom }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-black dark:text-white">
          {formatDuration(remainingSeconds)}
        </Text>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddTime(-10);
          }}
          className="rounded-full bg-neutral-100 px-3 py-2 dark:bg-neutral-900"
        >
          <Text className="text-lg font-semibold text-black dark:text-white">
            −10
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddTime(10);
          }}
          className="rounded-full bg-neutral-100 px-3 py-2 dark:bg-neutral-900"
        >
          <Text className="text-lg font-semibold text-black dark:text-white">
            +10
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSkip();
          }}
          className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-900"
        >
          <Ionicons
            name="play-skip-forward"
            size={24}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
