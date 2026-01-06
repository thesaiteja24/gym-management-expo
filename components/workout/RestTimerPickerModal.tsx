import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { TimerPicker } from "react-native-timer-picker";

/**
 * Props for RestTimerPickerModal
 */
export type RestTimerPickerModalProps = {
  /**
   * Whether the modal is visible
   * @default false
   */
  visible: boolean;

  /**
   * Initial duration in seconds
   * @default 60
   */
  initialSeconds?: number;

  /**
   * Called when the modal is closed without confirming
   */
  onClose: () => void;

  /**
   * Called when the user confirms a duration
   * @param seconds Total duration in seconds
   */
  onConfirm: (seconds: number) => void;
};

/**
 * RestTimerPickerModal
 *
 * A modal picker for hours, minutes, and seconds.
 * Converts selected duration to total seconds and passes it to `onConfirm`.
 */
export default function RestTimerPickerModal({
  visible,
  initialSeconds = 60,
  onClose,
  onConfirm,
}: RestTimerPickerModalProps) {
  const isDark = useColorScheme() === "dark";

  /* ---------------------------------------------
     Derive initial values
  --------------------------------------------- */
  const initialHours = Math.floor(initialSeconds / 3600);
  const remainingAfterHours = initialSeconds % 3600;
  const initialMinutes = Math.floor(remainingAfterHours / 60);
  const initialSecs = remainingAfterHours % 60;

  /* ---------------------------------------------
     State
  --------------------------------------------- */
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSecs);

  /* ---------------------------------------------
     Reset when modal opens
  --------------------------------------------- */
  useEffect(() => {
    if (!visible) return;

    setHours(initialHours);
    setMinutes(initialMinutes);
    setSeconds(initialSecs);
  }, [visible, initialHours, initialMinutes, initialSecs]);

  /* ---------------------------------------------
     Actions
  --------------------------------------------- */
  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleConfirm = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfirm(totalSeconds);
    onClose();
  };

  const handlePickerFeedback = () => {
    // Trigger a light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={handleCancel} />

        <View className="h-[55%] rounded-t-3xl bg-white p-6 dark:bg-[#111]">
          {/* Title */}
          <Text className="mb-6 text-center text-xl font-bold text-black dark:text-white">
            Rest Timer
          </Text>

          {/* Picker */}
          <View className="flex-1 items-center justify-center">
            <TimerPicker
              padWithNItems={2}
              hourLabel="hr"
              minuteLabel="min"
              secondLabel="sec"
              pickerFeedback={handlePickerFeedback}
              initialValue={{ hours, minutes, seconds }}
              onDurationChange={({ hours, minutes, seconds }) => {
                setHours(hours);
                setMinutes(minutes);
                setSeconds(seconds);
              }}
              styles={{
                backgroundColor: "transparent",
                pickerItem: {
                  color: isDark ? "white" : "black",
                  fontSize: 22,
                },
                pickerLabel: {
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontSize: 14,
                },
              }}
            />
          </View>

          {/* Actions */}
          <View className="mt-4 flex-row gap-4">
            <TouchableOpacity
              onPress={handleCancel}
              className="h-12 flex-1 justify-center rounded-2xl border border-neutral-300 dark:border-neutral-700"
            >
              <Text className="text-center text-lg font-semibold text-black dark:text-white">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className="h-12 flex-1 justify-center rounded-2xl bg-blue-600"
            >
              <Text className="text-center text-lg font-semibold text-white">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
