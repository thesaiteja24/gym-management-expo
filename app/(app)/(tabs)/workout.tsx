import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import { ROLES as roles } from "@/constants/roles";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";
import { ActivityIndicator, View } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Workout() {
  const role = useAuth((s) => s.user?.role);
  const [showEquipmentModal, setShowEquipmentModal] = React.useState(false);
  const equipmentLoading = useEquipment((s) => s.equipmentLoading);
  const equipmentList = useEquipment((s) => s.equipmentList);
  const getAllEquipment = useEquipment((s) => s.getAllEquipment);

  const [showMuscleGroupsModal, setShowMuscleGroupsModal] =
    React.useState(false);
  const [deleteMuscleGroupId, setDeleteMuscleGroupId] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const muscleGroupLoading = useMuscleGroup((s) => s.muscleGroupLoading);
  const muscleGroupList = useMuscleGroup((s) => s.muscleGroupList);
  const getAllMuscleGroups = useMuscleGroup((s) => s.getAllMuscleGroups);
  const deleteMuscleGroup = useMuscleGroup((s) => s.deleteMuscleGroup);

  const handleEquipmentPress = () => {
    setShowEquipmentModal(true);
  };
  const handleMuscleGroupsPress = () => {
    setShowMuscleGroupsModal(true);
  };

  useEffect(() => {
    getAllEquipment();
  }, []);

  useEffect(() => {
    getAllMuscleGroups();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black p-4">
      <View className="flex flex-row w-full gap-4">
        <TouchableOpacity
          onPress={handleEquipmentPress}
          className="flex-1 flex-row items-center justify-start gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
        >
          <Text className="text-black dark:text-white font-semibold text-xl">
            Equipment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMuscleGroupsPress}
          className="flex-1 flex-row items-center justify-start gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
        >
          <Text className="text-black dark:text-white font-semibold text-xl">
            Muscle Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Equipment modal */}
      <Modal animationType="slide" transparent visible={showEquipmentModal}>
        <View className="flex-1 bg-black/40 justify-end">
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowEquipmentModal(false)}
          />

          {/* Modal content */}
          <View className="bg-white dark:bg-[#111] rounded-t-3xl p-6 pt-4 h-[80%]">
            <Text className="text-black dark:text-white text-xl font-bold text-center mb-6">
              Equipment
            </Text>

            {equipmentLoading ? (
              <ActivityIndicator animating size="large" className="mt-8" />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {equipmentList.map((equipment) => (
                  <View
                    key={equipment.id}
                    className="flex-row items-center justify-between gap-4 pb-4"
                  >
                    <Text className="text-black dark:text-white text-xl font-semibold py-2">
                      {equipment.title}
                    </Text>
                    <Image
                      cachePolicy="memory-disk"
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
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Muscle Groups modal */}
      <Modal animationType="slide" transparent visible={showMuscleGroupsModal}>
        <View className="flex-1 bg-black/40 justify-end">
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowMuscleGroupsModal(false)}
          />

          {/* Modal content */}
          <View className="bg-white dark:bg-[#111] rounded-t-3xl p-6 pt-4 h-[80%]">
            <Text className="text-black dark:text-white text-xl font-bold text-center mb-6">
              Muscle Groups
            </Text>

            {muscleGroupLoading ? (
              <ActivityIndicator animating size="large" className="mt-8" />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {muscleGroupList.map((muscleGroup) => (
                  <TouchableOpacity
                    key={muscleGroup.id}
                    className="flex-row items-center justify-between gap-4 pb-4"
                    onPress={() => {
                      setShowMuscleGroupsModal(false);
                      if (role === roles.systemAdmin) {
                        router.push(`/muscle-group/${muscleGroup.id}`);
                      } else {
                        Toast.show({
                          type: "info",
                          text1: "Coming Soon",
                        });
                      }
                    }}
                    onLongPress={() => {
                      if (role !== roles.systemAdmin) return;

                      setDeleteMuscleGroupId({
                        id: muscleGroup.id,
                        title: muscleGroup.title,
                      });
                    }}
                    delayLongPress={1000}
                  >
                    <Text className="text-black dark:text-white text-xl font-semibold py-2">
                      {muscleGroup.title}
                    </Text>
                    <Image
                      cachePolicy="memory-disk"
                      source={{ uri: muscleGroup.thumbnailUrl }}
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
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {/* Delete Muscle Group Confirm Modal */}
      {deleteMuscleGroupId && (
        <DeleteConfirmModal
          visible
          title={`Delete "${deleteMuscleGroupId.title}"?`}
          description="This muscle group will be permanently removed."
          onCancel={() => setDeleteMuscleGroupId(null)}
          onConfirm={async () => {
            setDeleteMuscleGroupId(null);
            const res = await deleteMuscleGroup(deleteMuscleGroupId.id);
            await getAllMuscleGroups();
            if (res.success) {
              Toast.show({
                type: "success",
                text1: "Muscle group deleted successfully",
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Error deleting muscle group",
                text2: res.message,
              });
            }
          }}
        />
      )}
    </ScrollView>
  );
}
