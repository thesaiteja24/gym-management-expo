import { useAuth } from "@/stores/authStore";
import { useUser } from "@/stores/userStore";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type WeightUnit = "kg" | "lbs";
type LengthUnit = "cm" | "inches";

export default function SettingsScreen() {
  const isDarkMode = useColorScheme() === "dark";
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  const { user, logout } = useAuth();
  const { updatePreferences, isLoading } = useUser();

  const storedWeightUnit: WeightUnit = user?.preferredWeightUnit ?? "kg";
  const storedLengthUnit: LengthUnit = user?.preferredLengthUnit ?? "cm";

  /* ---------------------------------------------
     Local modal state (draft)
  --------------------------------------------- */
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(storedWeightUnit);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>(storedLengthUnit);

  /* ---------------------------------------------
     Reset draft when modal opens
  --------------------------------------------- */
  useEffect(() => {
    if (unitModalVisible) {
      setWeightUnit(storedWeightUnit);
      setLengthUnit(storedLengthUnit);
    }
  }, [unitModalVisible, storedWeightUnit, storedLengthUnit]);

  /* ---------------------------------------------
     Detect changes
  --------------------------------------------- */
  const hasChanges = useMemo(() => {
    return weightUnit !== storedWeightUnit || lengthUnit !== storedLengthUnit;
  }, [weightUnit, lengthUnit, storedWeightUnit, storedLengthUnit]);

  /* ---------------------------------------------
     Close handler
  --------------------------------------------- */
  const onClose = async () => {
    setUnitModalVisible(false);

    if (!hasChanges || !user?.userId) return;

    await updatePreferences(user.userId, {
      preferredWeightUnit: weightUnit,
      preferredLengthUnit: lengthUnit,
    });
  };

  /* ---------------------------------------------
     Small helper
  --------------------------------------------- */
  const optionClass = (active: boolean, rounded?: string) =>
    [
      "w-1/2 py-2 border",
      rounded,
      active
        ? "bg-blue-500 border-blue-500 text-white"
        : "bg-white border-neutral-200/60 text-black dark:bg-neutral-900 dark:border-neutral-800 dark:text-white",
    ].join(" ");

  return (
    <View className="flex h-full items-center bg-white p-4 dark:bg-black">
      {/* Logout */}
      <View className="mb-4 w-full">
        <TouchableOpacity
          onPress={logout}
          className="flex w-full flex-row items-center gap-4 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <AntDesign name="logout" size={24} color="red" />
          <Text className="text-xl font-semibold text-black dark:text-white">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unit preferences */}
      <View className="mb-4 w-full">
        <TouchableOpacity
          onPress={() => setUnitModalVisible(true)}
          className="flex w-full flex-row items-center gap-4 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <MaterialCommunityIcons
            name="pencil-ruler"
            size={24}
            color={isDarkMode ? "white" : "black"}
          />
          <Text className="text-xl font-semibold text-black dark:text-white">
            Unit Preferences
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={unitModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="absolute inset-0" onPress={onClose} />

          <View className="h-[80%] rounded-t-3xl bg-white p-6 dark:bg-[#111]">
            <Text className="mb-6 text-center text-xl font-bold text-black dark:text-white">
              Unit Preferences
            </Text>

            <View className="flex flex-col gap-6">
              {/* Weight */}
              <View className="flex flex-row items-center justify-between">
                <Text className="w-1/2 text-lg font-semibold text-black dark:text-white">
                  Weight
                </Text>

                <View className="flex w-1/2 flex-row">
                  <TouchableOpacity
                    onPress={() => setWeightUnit("kg")}
                    className={optionClass(
                      weightUnit === "kg",
                      "rounded-l-full",
                    )}
                  >
                    <Text
                      className={
                        weightUnit === "kg"
                          ? "text-center text-white"
                          : "text-center text-black dark:text-white"
                      }
                    >
                      Kg
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setWeightUnit("lbs")}
                    className={optionClass(
                      weightUnit === "lbs",
                      "rounded-r-full",
                    )}
                  >
                    <Text
                      className={
                        weightUnit === "lbs"
                          ? "text-center text-white"
                          : "text-center text-black dark:text-white"
                      }
                    >
                      Lbs
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Length */}
              <View className="flex flex-row items-center justify-between">
                <Text className="w-1/2 text-lg font-semibold text-black dark:text-white">
                  Measurements
                </Text>

                <View className="flex w-1/2 flex-row">
                  <TouchableOpacity
                    onPress={() => setLengthUnit("cm")}
                    className={optionClass(
                      lengthUnit === "cm",
                      "rounded-l-full",
                    )}
                  >
                    <Text
                      className={
                        lengthUnit === "cm"
                          ? "text-center text-white"
                          : "text-center text-black dark:text-white"
                      }
                    >
                      Cm
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setLengthUnit("inches")}
                    className={optionClass(
                      lengthUnit === "inches",
                      "rounded-r-full",
                    )}
                  >
                    <Text
                      className={
                        lengthUnit === "inches"
                          ? "text-center text-white"
                          : "text-center text-black dark:text-white"
                      }
                    >
                      Inches
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {hasChanges && (
              <Text className="mt-6 text-center text-sm text-blue-500">
                Changes will be saved when you close this sheet
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
