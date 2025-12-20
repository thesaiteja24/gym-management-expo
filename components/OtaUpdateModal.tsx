import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onLater: () => void;
  onRestart: () => void;
};

export function OtaUpdateModal({ visible, onLater, onRestart }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full rounded-2xl bg-white dark:bg-black p-6">
          <Text className="text-xl font-bold text-center text-black dark:text-white">
            Update available
          </Text>

          <Text className="mt-3 text-center text-gray-600 dark:text-gray-300">
            A new version of Pump is ready. Restart now to get the latest
            features and fixes.
          </Text>

          <View className="flex-row mt-6 gap-3">
            <Pressable
              onPress={onLater}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700"
            >
              <Text className="text-center text-black dark:text-white">
                Later
              </Text>
            </Pressable>

            <Pressable
              onPress={onRestart}
              className="flex-1 py-3 rounded-xl bg-black dark:bg-white"
            >
              <Text className="text-center text-white dark:text-black font-semibold">
                Restart
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
