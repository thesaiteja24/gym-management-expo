import { BlossomThemeProvider } from "@react-native-blossom-ui/components";
import { DateSelectPicker } from "@react-native-blossom-ui/dates";
import React, { useRef, useState } from "react";
import { Modal, Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import blossomDarkTheme from "../constants/blossomDarkTheme.json";
import blossomLightTheme from "../constants/blossomLightTheme.json";

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
}

export default function CustomDatePicker({ value, onChange }: Props) {
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
    const finalDate = draftDateRef.current ?? selectedDate;
    setSelectedDate(finalDate);
    onChange(finalDate);
    close();
  };

  return (
    <>
      <Pressable onPress={open}>
        <Text className="text-base font-medium text-blue-500">
          {value ? value.toDateString() : "Select date"}
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={close}
      >
        <View
          className="flex-1 justify-end bg-black/40"
          style={{ paddingBottom: insets.bottom }}
        >
          <View
            className={`h-1/4 rounded-t-2xl p-4 ${
              isDark ? "bg-[#111]" : "bg-white"
            }`}
          >
            <Text
              className={`text-center mb-2 text-lg font-semibold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Birthday
            </Text>

            <View className="flex-row justify-center items-center flex-1">
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
                      Date.UTC(selected.year, monthIndex, selected.day)
                    );
                  }}
                />
              </BlossomThemeProvider>
            </View>

            <Pressable onPress={handleDone} className="self-center py-2">
              <Text className="text-blue-500 text-base font-semibold">
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
