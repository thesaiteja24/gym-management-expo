import { useRef } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type UpdateState = "idle" | "downloading" | "restarting";

type Props = {
  visible: boolean;
  state: UpdateState;
  onLater: () => void;
  onRestart: () => Promise<void>;
};

export function OtaUpdateModal({ visible, state, onLater, onRestart }: Props) {
  const isBusy = state !== "idle";

  // 🔒 Immediate synchronous lock (no re-render needed)
  const restartLockedRef = useRef(false);

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
          pointerEvents={isBusy ? "none" : "auto"}
        >
          <Text className="text-xl font-bold text-center text-black dark:text-white">
            Update available
          </Text>

          <Text className="mt-3 text-center text-gray-600 dark:text-gray-300">
            {state === "idle" &&
              "A new version of Pump is ready. Restart to apply it."}
            {state === "downloading" && "Downloading update…"}
            {state === "restarting" && "Restarting app…"}
          </Text>

          {/* Progress bar */}
          {state !== "idle" && (
            <View className="mt-5 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <View
                className={`h-full bg-black dark:bg-white ${
                  state === "downloading" ? "w-2/3" : "w-full"
                }`}
              />
            </View>
          )}

          <View className="flex-row mt-6 gap-3">
            {/* Later */}
            <Pressable
              disabled={isBusy}
              onPress={onLater}
              className={`flex-1 py-3 rounded-xl border ${
                isBusy
                  ? "opacity-40 border-gray-300"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              <Text className="text-center text-black dark:text-white">
                Later
              </Text>
            </Pressable>

            {/* Restart */}
            <Pressable
              disabled={isBusy}
              onPress={async () => {
                // 🔐 Guard against multi-tap
                if (restartLockedRef.current) return;
                restartLockedRef.current = true;

                try {
                  await onRestart();
                } catch {
                  // Unlock only if something goes wrong
                  restartLockedRef.current = false;
                }
              }}
              className={`flex-1 py-3 rounded-xl ${
                isBusy ? "bg-gray-400" : "bg-black dark:bg-white"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  isBusy ? "text-white" : "text-white dark:text-black"
                }`}
              >
                Restart
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
