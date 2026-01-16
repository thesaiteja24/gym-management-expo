import { useRef } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteConfirmModal({
  visible,
  title = "Delete item?",
  description = "This action cannot be undone.",
  onCancel,
  onConfirm,
}: Props) {
  const lockedRef = useRef(false);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View
          className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-black dark:shadow-black"
          style={{ elevation: 8 }}
        >
          <Text className="text-center text-lg font-bold text-black dark:text-white">
            {title}
          </Text>

          <Text className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">
            {description}
          </Text>

          <View className="mt-6 flex-row gap-3">
            {/* Cancel */}
            <Pressable
              onPress={onCancel}
              className="flex-1 rounded-xl border border-gray-300 py-3 dark:border-gray-700"
            >
              <Text className="text-center text-base text-black dark:text-white">
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
              className="flex-1 rounded-xl bg-red-600 py-3"
            >
              <Text className="text-center text-base font-semibold text-white">
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
