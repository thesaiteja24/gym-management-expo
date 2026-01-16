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
  equipment: any[];

  onClose: () => void;
  onSelect: (equipment: any) => void;
  onLongPress?: (equipment: any) => void;
  onCreatePress?: () => void;
};

export default function EquipmentModal({
  visible,
  loading,
  enableCreate,
  equipment,
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

        <View className="h-[80%] rounded-t-3xl bg-white px-6 pt-6 dark:bg-neutral-900">
          <View
            className={`flex-row items-center ${
              onCreatePress && enableCreate
                ? "justify-between"
                : "justify-center"
            } mb-6`}
          >
            <Text className="text-xl font-bold text-black dark:text-white">
              Equipment
            </Text>

            {onCreatePress && enableCreate && (
              <TouchableOpacity onPress={onCreatePress}>
                <Text className="text-xl text-primary">Create</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator animating size="large" />
          ) : (
            <ScrollView>
              {equipment.map((item) => (
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
                    source={item.thumbnailUrl}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: "gray",
                      backgroundColor: "white",
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
