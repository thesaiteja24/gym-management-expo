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
import DatePicker from "react-native-date-picker";

/* ───────────────── Types ───────────────── */

/**
 * Props for DateTimePicker
 */
export interface DateTimePickerProps {
  /**
   * Current value. Defaults to today if not provided.
   */
  value?: Date;

  /**
   * Called with the final confirmed date.
   */
  onUpdate: (date: Date) => void;

  /**
   * If true, only date is selectable (no time).
   * @default false
   */
  dateOnly?: boolean;

  /**
   * If true, picker opens in a modal.
   * If false, picker renders inline.
   * @default true
   */
  isModal?: boolean;

  /**
   * Force 24h or 12h format.
   * Defaults to device preference.
   */
  is24Hour?: boolean;

  /**
   * NativeWind className for displayed value.
   */
  textClassName?: string;

  /**
   * Optional modal title.
   */
  title?: string;
}

/* ───────────────── Component ───────────────── */

export default function DateTimePicker({
  value,
  onUpdate,
  dateOnly = false,
  isModal = true,
  is24Hour,
  textClassName,
  title = "Select date",
}: DateTimePickerProps) {
  const isDark = useColorScheme() === "dark";

  const initialDate = value ?? new Date();

  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<Date>(initialDate);

  /* Reset draft when opened */
  useEffect(() => {
    if (visible) {
      setDraft(initialDate);
    }
  }, [visible, initialDate]);

  /* ───────────── Display string ───────────── */

  const displayValue = useMemo(() => {
    const d = value ?? initialDate;

    if (dateOnly) {
      return d.toLocaleDateString();
    }

    return d.toLocaleString(undefined, {
      hour12: is24Hour !== undefined ? !is24Hour : undefined,
    });
  }, [value, dateOnly, is24Hour]);

  /* ───────────── Handlers ───────────── */

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const confirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpdate(draft);
    close();
  };

  /* ───────────── Inline mode ───────────── */

  if (!isModal) {
    return (
      <DatePicker
        date={initialDate}
        onDateChange={onUpdate}
        mode={dateOnly ? "date" : "datetime"}
        theme={isDark ? "dark" : "light"}
        is24hourSource={
          is24Hour !== undefined ? (is24Hour ? "locale" : "device") : "device"
        }
      />
    );
  }

  /* ───────────── Modal mode ───────────── */

  return (
    <>
      <Pressable onPress={open}>
        <Text
          className={textClassName ?? "text-base font-medium text-blue-500"}
        >
          {displayValue}
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="absolute inset-0" onPress={close} />

          <View className="rounded-t-3xl bg-white p-6 dark:bg-[#111]">
            {/* Title */}
            <Text className="mb-4 text-center text-xl font-bold text-black dark:text-white">
              {title}
            </Text>

            {/* Picker */}
            <DatePicker
              date={draft}
              onDateChange={setDraft}
              mode={dateOnly ? "date" : "datetime"}
              theme={isDark ? "dark" : "light"}
              is24hourSource={
                is24Hour !== undefined
                  ? is24Hour
                    ? "locale"
                    : "device"
                  : "device"
              }
              style={{ alignSelf: "center" }}
            />

            {/* Actions */}
            <View className="mt-6 flex-row gap-4">
              <TouchableOpacity
                onPress={close}
                className="h-12 flex-1 items-center justify-center rounded-2xl border border-neutral-300 dark:border-neutral-700"
              >
                <Text className="text-lg text-black dark:text-white">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirm}
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
    </>
  );
}
