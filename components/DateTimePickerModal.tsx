import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import CustomDatePicker from "./CustomDatePicker";
import RestTimerPickerModal from "./workout/RestTimerPickerModal";

type Props = {
  visible: boolean;
  initialValue: Date;
  title: string;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export default function DateTimePickerModal({
  visible,
  initialValue,
  title,
  onClose,
  onConfirm,
}: Props) {
  const [date, setDate] = useState<Date>(initialValue);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  useEffect(() => {
    if (visible) setDate(initialValue);
  }, [visible, initialValue]);

  /* derive seconds since midnight for timer picker */
  const initialSeconds = useMemo(() => {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  }, [date]);

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

          <View className="rounded-t-3xl bg-white p-6 dark:bg-[#111]">
            <Text className="mb-4 text-center text-xl font-bold text-black dark:text-white">
              {title}
            </Text>

            {/* DATE */}
            <View className="mb-6 items-center">
              <CustomDatePicker
                value={date}
                onChange={(d) => {
                  const updated = new Date(date);
                  updated.setFullYear(
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate(),
                  );
                  setDate(updated);
                }}
              />
            </View>

            {/* TIME */}
            <TouchableOpacity
              onPress={() => setTimeModalVisible(true)}
              className="mb-6 items-center"
            >
              <Text className="text-lg font-semibold text-blue-500">
                {date.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {/* ACTIONS */}
            <View className="flex-row gap-4">
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

      {/* TIME PICKER */}
      <RestTimerPickerModal
        visible={timeModalVisible}
        initialSeconds={initialSeconds}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={handleTimeConfirm}
      />
    </>
  );
}
