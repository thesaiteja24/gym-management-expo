import { BlossomThemeProvider } from "@react-native-blossom-ui/components";
import { DateSelectPicker } from "@react-native-blossom-ui/dates";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import blossomDarkTheme from "../constants/blossomDarkTheme.json";
import blossomLightTheme from "../constants/blossomLightTheme.json";
import RestTimerPickerModal from "./workout/RestTimerPickerModal";

/* ───────────────── Props ───────────────── */

type DateTimePickerModalProps = {
  visible: boolean;
  initialValue: Date;
  title: string;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

/* ───────────────── Component ───────────────── */

export default function DateTimePickerModal({
  visible,
  initialValue,
  title,
  onClose,
  onConfirm,
}: DateTimePickerModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? blossomDarkTheme : blossomLightTheme;
  const minYear = new Date().getFullYear() - 60;

  const [date, setDate] = useState<Date>(initialValue);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  /* Reset date when modal opens */
  useEffect(() => {
    if (visible) setDate(initialValue);
  }, [visible, initialValue]);

  /* derive seconds since midnight for time picker */
  const initialSeconds = useMemo(() => {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  }, [date]);

  /* Handle time picker confirmation */
  const handleTimeConfirm = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const updated = new Date(date);
    updated.setHours(hours);
    updated.setMinutes(minutes);
    updated.setSeconds(0);
    setDate(updated);
    setTimeModalVisible(false);
  };

  /* Handle final confirmation */
  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(date);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="absolute inset-0" onPress={onClose} />

          <View className={`rounded-t-3xl bg-white dark:bg-[#111]`}>
            <Text className="mb-4 p-4 text-center text-xl font-bold text-black dark:text-white">
              {title}
            </Text>

            {/* DATE PICKER INLINE */}
            <View className="mb-6">
              <Text className="mb-2 text-center text-lg font-semibold text-blue-500">
                Date
              </Text>
              <BlossomThemeProvider theme={theme} isDark={isDark}>
                <DateSelectPicker
                  yearProps={{
                    minYear,
                    maxYear: new Date().getFullYear(),
                    currentYear: date.getFullYear(),
                  }}
                  onDateComplete={(selected) => {
                    // Keep month index as-is
                    const monthIndex = selected.month;
                    const updatedDate = new Date(date);
                    updatedDate.setFullYear(
                      selected.year,
                      monthIndex,
                      selected.day,
                    );
                    setDate(updatedDate);
                  }}
                />
              </BlossomThemeProvider>
            </View>

            {/* TIME PICKER */}
            <View className="mb-6 items-center">
              <Text className="mb-2 text-center text-lg font-semibold text-blue-500">
                Time
              </Text>
              <TouchableOpacity
                onPress={() => setTimeModalVisible(true)}
                className="rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-700"
              >
                <Text className="text-lg font-semibold text-blue-500">
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ACTIONS */}
            <View className="flex-row gap-4 p-6">
              <TouchableOpacity
                onPress={onClose}
                className="h-12 flex-1 items-center justify-center rounded-2xl border border-neutral-300 dark:border-neutral-700"
              >
                <Text className="text-lg text-black dark:text-white">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-blue-600"
              >
                <Text className="text-lg font-semibold text-white">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TIME PICKER MODAL */}
      <RestTimerPickerModal
        visible={timeModalVisible}
        initialSeconds={initialSeconds}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={handleTimeConfirm}
      />
    </>
  );
}
