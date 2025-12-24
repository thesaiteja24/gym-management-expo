import { ROLES as roles } from "@/constants/roles";
import { ActivityIndicator } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  visible: boolean;
  onClose: () => void;
  role?: string;
  loading: boolean;
  muscleGroups: any[];
  onDelete: (v: { id: string; title: string }) => void;
};

export default function MuscleGroupModal({
  visible,
  onClose,
  role,
  loading,
  muscleGroups,
  onDelete,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/40 justify-end">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="h-[80%] bg-white dark:bg-[#111] rounded-t-3xl p-6">
          <View
            className={`flex-row ${
              role === roles.systemAdmin ? "justify-between" : "justify-center"
            } mb-6`}
          >
            <Text className="text-xl font-bold text-black dark:text-white">
              Muscle Groups
            </Text>

            {role === roles.systemAdmin && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/muscle-groups/create");
                }}
              >
                <Text className="text-blue-500 text-xl">Create</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator animating size="large" />
          ) : (
            <ScrollView>
              {muscleGroups.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row justify-between pb-4"
                  onPress={() =>
                    role === roles.systemAdmin
                      ? (() => {
                          router.push(`/muscle-groups/${item.id}`);
                          onClose();
                        })()
                      : Toast.show({ type: "info", text1: "Coming Soon" })
                  }
                  onLongPress={() =>
                    role === roles.systemAdmin &&
                    onDelete({ id: item.id, title: item.title })
                  }
                  delayLongPress={700}
                >
                  <Text className="text-xl font-semibold text-black dark:text-white">
                    {item.title}
                  </Text>

                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: "gray",
                    }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
