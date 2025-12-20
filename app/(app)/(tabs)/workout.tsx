import { useEquipment } from "@/stores/equipmentStore";
import { ActivityIndicator, View } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Modal, ScrollView, Text, TouchableOpacity } from "react-native";

export default function Workout() {
  const handleEquipmentPress = () => {
    setShowModal(true);
  };
  const [showModal, setShowModal] = React.useState(false);
  const equipmentLoading = useEquipment((s) => s.equipmentLoading);
  const equipmentList = useEquipment((s) => s.equipmentList);
  const getAllEquipment = useEquipment((s) => s.getAllEquipment);

  useEffect(() => {
    getAllEquipment();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black p-4">
      <TouchableOpacity
        onPress={handleEquipmentPress}
        className="flex flex-row items-center justify-start w-full gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
      >
        <Text className="text-black dark:text-white font-semibold text-xl">
          Equipment
        </Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={showModal}>
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: "flex-end" }}
          className="bg-black/40"
          onTouchEnd={() => setShowModal(false)}
        >
          <TouchableOpacity
            className="bg-white dark:bg-[#111] rounded-t-3xl p-6 pt-4 min-h-[80%]"
            activeOpacity={1}
          >
            <Text className="text-black dark:text-white text-xl font-bold text-center mb-8">
              Equipment
            </Text>
            {equipmentLoading ? (
              <ActivityIndicator
                animating={equipmentLoading}
                size="large"
                className="mt-8"
              />
            ) : (
              equipmentList.map((equipment) => (
                <View
                  key={equipment.id}
                  className="flex-row items-center justify-between gap-4 pb-4"
                >
                  <Text className="text-black dark:text-white text-xl font-semibold py-2">
                    {equipment.title}
                  </Text>
                  <Image
                    cachePolicy={"memory-disk"}
                    source={equipment.thumbnailUrl}
                    style={{
                      borderRadius: 100,
                      borderColor: "gray",
                      borderWidth: 1,
                      width: 50,
                      height: 50,
                      backgroundColor: "white",
                    }}
                    contentFit="contain"
                  />
                </View>
              ))
            )}
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
