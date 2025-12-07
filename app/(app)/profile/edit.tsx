import DatePicker from "@/components/CustomDatePicker";
import ProfilePic from "@/components/ProfilePic";
import { useAuth } from "@/stores/authStore";
import { useUser } from "@/stores/userStore";
import { createFormData } from "@/utils/createFormData";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function EditProfile() {
  const navigation = useNavigation();

  // global state (stores)
  const user = useAuth((s) => s.user);
  const getUserData = useUser((s) => s.getUserData);
  const updateProfilePic = useUser((s) => s.updateProfilePic);
  const updateUserData = useUser((s) => s.updateUserData);
  const isLoading = useUser((s) => s.isLoading);

  const lineHeight = Platform.OS === "ios" ? 0 : 30;

  // local state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Snapshot of original values
  const originalRef = useRef({
    firstName: "",
    lastName: "",
    height: null as number | null,
    weight: null as number | null,
    dateOfBirth: null as Date | null,
  });

  // sync local state with global user data
  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setHeight(user.height ?? null);
    setWeight(user.weight ?? null);
    setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth) : null);

    originalRef.current = {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      height: user.height ?? null,
      weight: user.weight ?? null,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
    };
  }, [user]);

  // Dirty checking
  const isDirty = useMemo(() => {
    const original = originalRef.current;

    const sameDOB =
      (dateOfBirth &&
        original.dateOfBirth &&
        dateOfBirth.toDateString() === original.dateOfBirth.toDateString()) ||
      (!dateOfBirth && !original.dateOfBirth);

    return !(
      firstName === original.firstName &&
      lastName === original.lastName &&
      height === original.height &&
      weight === original.weight &&
      sameDOB
    );
  }, [firstName, lastName, height, weight, dateOfBirth, user]);

  // save handler
  const onSave = useCallback(async () => {
    if (!user?.userId || !isDirty) return;
    Keyboard.dismiss();

    const payload = {
      firstName,
      lastName,
      height,
      weight,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    };

    const response = await updateUserData(user.userId, payload);

    if (response?.success) {
      Toast.show({ type: "success", text1: "Profile updated successfully" });

      // update original snapshot
      originalRef.current = {
        firstName,
        lastName,
        height,
        weight,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      };
    } else {
      Toast.show({
        type: "error",
        text1: "Profile update failed, try again",
      });
    }
  }, [firstName, lastName, height, weight, dateOfBirth, isDirty, user?.userId]);

  // load user data on mount
  useEffect(() => {
    if (user?.userId) {
      getUserData(user.userId);
    }
  }, []);

  // nav bar checkmark
  useEffect(() => {
    (navigation as any).setOptions({
      rightIcons: [
        {
          name: "checkmark-done",
          onPress: onSave,
          disabled: !isDirty || isLoading,
          color: "green",
        },
      ],
    });
  }, [navigation, isDirty, onSave, user, isLoading]);

  // profile pic picker
  const onPick = async (uri: string | null) => {
    if (!uri) return;
    setLocalPreview(uri);

    if (!user?.userId) {
      Toast.show({ type: "error", text1: "No user id" });
      return;
    }

    try {
      const formData = createFormData(uri, "profilePic");
      const res = await updateProfilePic(user.userId, formData);

      if (!res?.success) {
        setLocalPreview(user?.profilePicUrl ?? null);
        Toast.show({ type: "error", text1: "Upload failed" });
      } else {
        Toast.show({ type: "success", text1: "Profile picture updated" });
      }
    } catch {
      setLocalPreview(user?.profilePicUrl ?? null);
      Toast.show({ type: "error", text1: "Upload failed" });
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      className="bg-white dark:bg-black"
    >
      <View className="items-center mb-6">
        <ProfilePic
          uri={localPreview ?? user?.profilePicUrl}
          size={132}
          editable={!isLoading}
          onChange={(newUri) => newUri && onPick(newUri)}
        />
      </View>

      <View className="flex flex-col gap-2">
        {/* first name */}
        <View className="flex flex-row items-center gap-8">
          <Text className="font-semibold text-lg text-black dark:text-white">
            First Name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            editable={!isLoading}
            className="text-lg text-blue-500"
            style={{ lineHeight }}
          />
        </View>

        {/* last name */}
        <View className="flex flex-row items-center gap-8">
          <Text className="font-semibold text-lg text-black dark:text-white">
            Last Name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            editable={!isLoading}
            className="text-lg text-blue-500"
            style={{ lineHeight }}
          />
        </View>

        {/* details card */}
        <View className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm mt-4">
          {/* date of birth */}
          <View className="flex-row items-center justify-between py-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Date of Birth
            </Text>
            <DatePicker value={dateOfBirth} onChange={setDateOfBirth} />
          </View>

          {/* height */}
          <View className="flex-row items-center justify-between py-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Height (cm)
            </Text>
            <TextInput
              value={height?.toString() ?? ""}
              placeholder="--"
              keyboardType="numeric"
              onChangeText={(text) =>
                // @ts-ignore
                setHeight(text)
              }
              editable={!isLoading}
              className="text-lg text-blue-500"
              style={{ lineHeight }}
            />
          </View>

          {/* weight */}
          <View className="flex-row items-center justify-between py-3 border-neutral-200/60 dark:border-neutral-800">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Weight (kg)
            </Text>
            <TextInput
              value={weight?.toString() ?? ""}
              placeholder="--"
              placeholderTextColor={
                useColorScheme() === "dark" ? "#555" : "#aaa"
              }
              keyboardType="decimal-pad"
              onChangeText={(text) =>
                // @ts-ignore
                setWeight(text)
              }
              editable={!isLoading}
              className="text-lg text-blue-500"
              style={{ lineHeight }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
