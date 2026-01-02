import { ActivityIndicator } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  loading: boolean;
  equipment: any[];

  onClose: () => void;
  onSelect: (equipment: any) => void;
  onLongPress?: (equipment: any) => void;
};

export default function EquipmentModal({
  visible,
  loading,
  equipment,
  onClose,
  onSelect,
  onLongPress,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="h-[80%] rounded-t-3xl bg-white p-6 dark:bg-[#111]">
          <Text className="mb-6 text-center text-xl font-bold text-black dark:text-white">
            Equipment
          </Text>

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
