import DatePicker from "@/components/CustomDatePicker";
import ProfilePic from "@/components/ProfilePic";
import { useAuth } from "@/stores/authStore";
import { useUser } from "@/stores/userStore";
import { createFormData } from "@/utils/createFormData";
import React, { memo, useEffect, useState } from "react";
import { Platform, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

const InfoRow = memo(function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-neutral-200/60 dark:border-neutral-800 last:border-b-0">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
      <Text className="text-base font-medium text-blue-500">
        {value ?? "—"}
      </Text>
    </View>
  );
});

export default function EditProfile() {
  const user = useAuth((state) => state.user);
  const updateProfilePic = useUser((s: any) => s.updateProfilePic);
  const isUploading = useUser((s: any) => s.isLoading);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const lineHeight = Platform.OS === "ios" ? 0 : 30;

  // Fields
  const [firstName, setFirstName] = useState<string>(user?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(user?.lastName ?? "");
  const [height, setHeight] = useState<number | null>(user?.height ?? null);
  const [weight, setWeight] = useState<number | null>(user?.weight ?? null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : null
  );

  const getUserData = useUser((s: any) => s.getUserData);

  // fetch user data on mount
  useEffect(() => {
    if (user?.userId) {
      getUserData(user.userId);
    }
  }, []);

  // handler for picking a new profile picture
  const onPick = async (uri: string | null) => {
    if (!uri) return;

    setLocalPreview(uri);

    if (!user?.userId) {
      setLocalPreview(null);
      Toast.show({ type: "error", text1: "No user id" });
      return;
    }

    try {
      const formData = createFormData(uri, "profilePic");
      const res = await updateProfilePic(user.userId, formData);

      if (res?.success) {
        Toast.show({ type: "success", text1: "Profile picture updated" });
      } else {
        console.error("Profile pic upload error:", res?.message);
        Toast.show({ type: "error", text1: "Upload failed please try again" });
        setLocalPreview(user?.profilePicUrl ?? null);
      }
    } catch (err: any) {
      console.error("Profile pic upload error:", err);
      Toast.show({ type: "error", text1: "Upload failed please try again" });
      setLocalPreview(user?.profilePicUrl ?? null);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      className="bg-white dark:bg-black"
    >
      {/* Avatar */}
      <View className="items-center mb-6">
        <ProfilePic
          uri={localPreview ?? user?.profilePicUrl}
          size={132}
          editable={true}
          onChange={(newUri) => newUri && onPick(newUri)}
        />
      </View>

      <View className="flex flex-col gap-2">
        {/* First Name field */}
        <View className="flex flex-row items-center gap-8">
          <Text className="font-semibold text-lg text-black dark:text-white">
            First Name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            className="text-lg text-blue-500"
            style={{
              lineHeight: lineHeight,
            }}
          />
        </View>

        {/* Last Name field */}
        <View className="flex flex-row items-center gap-8">
          <Text className="font-semibold text-lg text-black dark:text-white">
            Last Name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            className="text-lg text-blue-500"
            style={{
              lineHeight: lineHeight,
            }}
          />
        </View>

        <View className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm mt-4">
          <View className="flex-row items-center justify-between py-3 border-b border-neutral-200/60 dark:border-neutral-800 last:border-b-0">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Date of Birth
            </Text>
            <DatePicker value={dateOfBirth} onChange={setDateOfBirth} />
          </View>
          <InfoRow
            label="Height"
            value={user?.height ? `${user.height}` : ""}
          />
          <InfoRow
            label="Weight"
            value={user?.weight ? `${user.weight}` : ""}
          />
        </View>
      </View>
    </ScrollView>
  );
}
