import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  loading: boolean;
  enableCreate?: boolean;
  muscleGroups: any[];

  onClose: () => void;
  onSelect: (muscleGroup: any) => void;
  onLongPress?: (muscleGroup: any) => void;
  onCreatePress?: () => void;
};

export default function MuscleGroupModal({
  visible,
  loading,
  enableCreate,
  muscleGroups,
  onClose,
  onSelect,
  onLongPress,
  onCreatePress,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        className="flex-1 justify-end bg-black/40"
        style={{
          marginBottom: useSafeAreaInsets().bottom,
        }}
      >
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="h-[80%] rounded-t-3xl bg-white px-6 pt-6 dark:bg-[#111]">
          <View
            className={`flex-row items-center ${
              onCreatePress && enableCreate
                ? "justify-between"
                : "justify-center"
            } mb-6`}
          >
            <Text className="text-xl font-bold text-black dark:text-white">
              Muscle Groups
            </Text>

            {onCreatePress && enableCreate && (
              <TouchableOpacity onPress={onCreatePress}>
                <Text className="text-xl text-blue-500">Create</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator animating size="large" />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {muscleGroups.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center justify-between pb-4"
                  onPress={() => onSelect(item)}
                  onLongPress={() => onLongPress?.(item)}
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
