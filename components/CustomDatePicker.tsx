import { BlossomThemeProvider } from "@react-native-blossom-ui/components";
import { DateSelectPicker } from "@react-native-blossom-ui/dates";
import React, { useState } from "react";
import { Modal, Pressable, Text, useColorScheme, View } from "react-native";
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

  const [visible, setVisible] = useState(false);

  const initialDate = value ?? new Date();
  const day = initialDate.getDate();
  const month = initialDate.getMonth();
  const year = initialDate.getFullYear();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleDone = () => {
    onChange(selectedDate);
    close();
  };

  return (
    <>
      {/* Pressable text to open picker */}
      <Pressable onPress={open}>
        <Text className="text-base font-medium text-blue-500">
          {value ? value.toDateString() : "Select date"}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={close}
      >
        <View className="flex-1 justify-end bg-black/40">
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
                    minYear: minYear,
                    maxYear: new Date().getFullYear(),
                    currentYear: year,
                  }}
                  onDateComplete={(selected) => {
                    const newDate = new Date(
                      selected.year,
                      selected.month,
                      selected.day
                    );
                    setSelectedDate(newDate);
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
