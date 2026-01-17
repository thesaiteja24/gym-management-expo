import { useThemeColor } from "@/hooks/useThemeColor";
import { useRef } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
};

export function DeleteConfirmModal({
  visible,
  title = "Delete item?",
  description = "This action cannot be undone.",
  onCancel,
  onConfirm,
  confirmText = "Delete",
}: Props) {
  const colors = useThemeColor();
  const lockedRef = useRef(false);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View
          className="w-full rounded-2xl border p-6 shadow-xl"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.neutral[200],
            shadowColor: "#000",
            elevation: 8,
          }}
        >
          <Text
            className="text-center text-lg font-bold"
            style={{ color: colors.text }}
          >
            {title}
          </Text>

          <Text
            className="mt-3 text-center text-sm"
            style={{ color: colors.neutral[500] }}
          >
            {description}
          </Text>

          <View className="mt-6 flex-row gap-3">
            {/* Cancel */}
            <Pressable
              onPress={onCancel}
              className="flex-1 rounded-xl border py-3"
              style={{ borderColor: colors.neutral[200] }}
            >
              <Text
                className="text-center text-base"
                style={{ color: colors.text }}
              >
                Cancel
              </Text>
            </Pressable>
            {/* Delete */}
            <Pressable
              onPress={async () => {
                if (lockedRef.current) return;
                lockedRef.current = true;
                await onConfirm();
              }}
              className="flex-1 rounded-xl py-3"
              style={{ backgroundColor: colors.danger }}
            >
              <Text className="text-center text-base font-semibold text-white">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
