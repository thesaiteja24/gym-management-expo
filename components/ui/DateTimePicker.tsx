import { useThemeColor } from "@/hooks/useThemeColor";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* --------------------------------------------------
   Types
-------------------------------------------------- */

/**
 * Props shared between modal and inline modes.
 */
interface BaseDateTimePickerProps {
  /**
   * Current value of the picker.
   * If omitted, defaults to the current date/time.
   */
  value?: Date;

  /**
   * Called when the date changes.
   *
   * - In modal mode: called only after confirmation
   * - In inline mode: called immediately on change
   */
  onUpdate: (date: Date) => void;

  /**
   * Disable time selection and allow date-only picking.
   *
   * @default false
   */
  dateOnly?: boolean;

  /**
   * Force 24-hour or 12-hour time format.
   * Uses device preference if omitted.
   */
  is24Hour?: boolean;
}

/**
 * Props for modal mode.
 */
export interface DateTimePickerModalProps extends BaseDateTimePickerProps {
  /**
   * Render the picker inside a confirmation modal.
   *
   * @default true
   */
  isModal?: true;

  /**
   * Title displayed at the top of the modal.
   *
   * @default "Select date"
   */
  title?: string;

  /**
   * Styling for the displayed value text.
   */
  textClassName?: string;
}

/**
 * Props for inline mode.
 */
export interface DateTimePickerInlineProps extends BaseDateTimePickerProps {
  /**
   * Render the picker inline without a modal.
   */
  isModal: false;
}

/**
 * Props for the DateTimePicker component.
 */
export type DateTimePickerProps =
  | DateTimePickerModalProps
  | DateTimePickerInlineProps;

/* --------------------------------------------------
   Component
-------------------------------------------------- */

/**
 * DateTimePicker
 *
 * A flexible date / date-time picker component with **modal**
 * and **inline** rendering modes.
 *
 * Features:
 * - Date-only or date + time selection
 * - Modal confirmation or inline immediate updates
 * - Optional 12h / 24h time formatting
 * - Dark mode support
 * - Draft state in modal mode
 *
 * ### Modes
 *
 * **Modal mode (default)**
 * - Displays the current value as text
 * - Opens a bottom-sheet modal on press
 * - Changes are staged until confirmed
 *
 * **Inline mode**
 * - Renders the native picker directly
 * - Updates immediately on change
 *
 * @example
 * // Modal date + time picker
 * <DateTimePicker
 *   value={new Date()}
 *   onUpdate={setDate}
 * />
 *
 * @example
 * // Date-only picker
 * <DateTimePicker
 *   dateOnly
 *   value={new Date()}
 *   onUpdate={setDate}
 * />
 *
 * @example
 * // Inline picker
 * <DateTimePicker
 *   isModal={false}
 *   onUpdate={setDate}
 * />
 */
export default function DateTimePicker(props: DateTimePickerProps) {
  const isDark = useColorScheme() === "dark";
  const colors = useThemeColor();

  const { value, onUpdate, dateOnly = false, is24Hour } = props;

  const isModal = props.isModal !== false;

  const initialDate = value ?? new Date();

  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<Date>(initialDate);

  /* Reset draft when modal opens */
  useEffect(() => {
    if (visible) {
      setDraft(initialDate);
    }
  }, [visible, initialDate]);

  /* ---------------------------------------------
     Display string (modal mode)
  --------------------------------------------- */

  const displayValue = useMemo(() => {
    const d = value ?? initialDate;

    if (dateOnly) {
      return d.toLocaleDateString();
    }

    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: is24Hour !== undefined ? !is24Hour : undefined,
    });
  }, [value, dateOnly, is24Hour]);

  /* ---------------------------------------------
     Inline mode
  --------------------------------------------- */

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

  /* ---------------------------------------------
     Modal mode
  --------------------------------------------- */

  const { textClassName, title = "Select date" } = props;

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const confirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpdate(draft);
    close();
  };

  return (
    <>
      <Pressable onPress={open}>
        <Text
          className={textClassName ?? "text-base font-medium"}
          style={!textClassName ? { color: colors.primary } : undefined}
        >
          {displayValue}
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <View
          className="flex-1 justify-end bg-black/40"
          style={{
            marginBottom: useSafeAreaInsets().bottom,
          }}
        >
          <Pressable className="absolute inset-0" onPress={close} />

          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background }}
          >
            <Text
              className="mb-4 text-center text-xl font-bold"
              style={{ color: colors.text }}
            >
              {title}
            </Text>

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

            <View className="mt-6 flex-row gap-4">
              <TouchableOpacity
                onPress={close}
                className="h-12 flex-1 items-center justify-center rounded-2xl border"
                style={{ borderColor: colors.neutral[200] }}
              >
                <Text className="text-lg" style={{ color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirm}
                className="h-12 flex-1 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.primary }}
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
