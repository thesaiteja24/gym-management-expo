import { BlossomThemeProvider } from "@react-native-blossom-ui/components";
import { DateSelectPicker } from "@react-native-blossom-ui/dates";
import React, { useRef, useState } from "react";
import { Modal, Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import blossomDarkTheme from "../constants/blossomDarkTheme.json";
import blossomLightTheme from "../constants/blossomLightTheme.json";

/**
 * Props for the CustomDatePicker component
 */
interface Props {
  /**
   * The currently selected date. If null, no date is selected initially.
   */
  value: Date | null;

  /**
   * Optional Nativewind className for styling the displayed date text.
   * Defaults to: "text-base font-medium text-blue-500"
   */
  textClassName?: string;

  /**
   * Callback invoked when the user confirms a date selection.
   * @param date The selected Date object.
   */
  onChange: (date: Date) => void;
}

/**
 * CustomDatePicker
 *
 * A date picker component that displays the selected date and allows users
 * to pick a new date using a modal. Utilizes @react-native-blossom-ui's
 * DateSelectPicker inside a themed BlossomThemeProvider.
 *
 * Features:
 * - Displays currently selected date.
 * - Opens a modal with a date picker when pressed.
 * - Supports canceling selection without updating parent state.
 * - Only updates parent value when "Done" is pressed.
 * - Dismiss modal by tapping outside or pressing "Cancel".
 *
 * @param props.value The currently selected date (or null if none).
 * @param props.textClassName Optional className for styling the displayed text.
 * @param props.onChange Callback called with the confirmed selected date.
 */
export default function CustomDatePicker({
  value,
  textClassName,
  onChange,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const minYear = new Date().getFullYear() - 60;
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);

  const initialDate = value ?? new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // hold in-progress selection without triggering parent state updates
  const draftDateRef = useRef<Date>(initialDate);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleDone = () => {
    const finalDate = selectedDate ?? draftDateRef.current;
    setSelectedDate(finalDate);
    onChange(finalDate);
    close();
  };

  const handleCancel = () => {
    draftDateRef.current = selectedDate;
    close();
  };

  return (
    <>
      <Pressable onPress={open}>
        <Text
          className={textClassName ?? "text-base font-medium text-blue-500"}
        >
          {value ? value.toDateString() : "Select date"}
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="absolute inset-0" onPress={handleCancel} />
          <View
            className={`h-1/4 rounded-t-2xl p-4 ${
              isDark ? "bg-[#111]" : "bg-white"
            }`}
          >
            <Text
              className={`mb-2 text-center text-lg font-semibold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Birthday
            </Text>

            <View className="flex-1 flex-row items-center justify-center">
              <BlossomThemeProvider
                theme={isDark ? blossomDarkTheme : blossomLightTheme}
                isDark={isDark}
              >
                <DateSelectPicker
                  yearProps={{
                    minYear,
                    maxYear: new Date().getFullYear(),
                    currentYear: (value ?? new Date()).getFullYear(),
                  }}
                  onDateComplete={(selected) => {
                    // IMPORTANT: do not call setState here
                    // Check your lib: if month is 1–12, subtract 1; if 0–11, leave as is.
                    const monthIndex = selected.month; // change to (selected.month - 1) if needed
                    draftDateRef.current = new Date(
                      Date.UTC(selected.year, monthIndex, selected.day),
                    );
                  }}
                />
              </BlossomThemeProvider>
            </View>

            <View className="flex flex-row items-center justify-evenly">
              <Pressable onPress={handleCancel} className="self-center py-2">
                <Text className="text-base font-semibold text-red-500">
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={handleDone} className="self-center py-2">
                <Text className="text-base font-semibold text-blue-500">
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
