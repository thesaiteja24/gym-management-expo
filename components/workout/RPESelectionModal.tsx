import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ───────────────── Constants ───────────────── */

const RPE_VALUES = [10, 9.5, 9, 8.5, 8, 7.5, 7] as const;

const RPE_DESCRIPTIONS: Record<number, string> = {
  10: "Max effort. No reps left in reserve.",
  9.5: "Near max. Maybe half a rep left.",
  9: "Very hard. One rep left in reserve.",
  8.5: "Hard. One to two reps left.",
  8: "Challenging but controlled.",
  7.5: "Moderate-hard training effort.",
  7: "Comfortably challenging.",
};

/* ───────────────── Props ───────────────── */

type Props = {
  visible: boolean;
  currentValue?: number | null; // 0 / undefined = unset
  onClose: () => void;
  onSelect: (value?: number) => void; // undefined = reset
};

/* ───────────────── Component ───────────────── */

export default function RPESelectionModal({
  visible,
  currentValue,
  onClose,
  onSelect,
}: Props) {
  const isDark = useColorScheme() === "dark";

  const selectedValue = currentValue && currentValue > 0 ? currentValue : null;

  const description = useMemo(() => {
    if (!selectedValue) {
      return "Select perceived effort for this set.";
    }
    return RPE_DESCRIPTIONS[selectedValue];
  }, [selectedValue]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        className="flex-1 justify-end bg-black/40"
        style={{
          marginBottom: useSafeAreaInsets().bottom,
        }}
      >
        {/* Backdrop */}
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />

        {/* Sheet */}
        <View className="absolute bottom-0 w-full rounded-t-3xl bg-white p-6 dark:bg-neutral-900">
          {/* Header */}
          <Text className="mb-4 text-center text-lg font-bold text-black dark:text-white">
            Select RPE
          </Text>

          <View className="flex-row">
            {/* ───── Left: Scale ───── */}
            <View className="gap-4 rounded-full bg-slate-50 px-2 py-4 dark:bg-neutral-800">
              {RPE_VALUES.map((value) => {
                const isSelected = value === selectedValue;

                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                      // Tap again → reset to 0
                      if (isSelected) {
                        onSelect(undefined);
                      } else {
                        onSelect(value);
                      }
                    }}
                    className={`flex-row items-center justify-center gap-4 px-2 ${isSelected ? "rounded-full bg-blue-100 dark:bg-blue-900" : ""}`}
                  >
                    <Text
                      className={`text-center text-base ${
                        isSelected
                          ? "font-semibold text-primary"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ───── Right: Detail ───── */}
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl font-bold text-black dark:text-white">
                {selectedValue ?? "--"}
              </Text>

              <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </Text>
            </View>
          </View>

          {/* Footer hint */}
          <Text className="mt-6 text-center text-xs text-neutral-400">
            Tap selected value again to clear RPE
          </Text>
        </View>
      </View>
    </Modal>
  );
}
