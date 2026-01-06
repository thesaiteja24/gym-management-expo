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
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View
          className="
            w-full
            rounded-2xl
            bg-white
            dark:bg-black
            p-6
            border
            border-gray-200
            dark:border-gray-800
            shadow-xl
            dark:shadow-black
          "
          style={{ elevation: 8 }}
        >
          <Text className="text-xl font-bold text-center text-black dark:text-white">
            {title}
          </Text>

          <Text className="mt-3 text-center text-gray-600 dark:text-gray-300">
            {description}
          </Text>

          <View className="flex-row mt-6 gap-3">
            {/* Cancel */}
            <Pressable
              onPress={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700"
            >
              <Text className="text-center text-black dark:text-white">
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
              className="flex-1 py-3 rounded-xl bg-red-600"
            >
              <Text className="text-center font-semibold text-white">
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
