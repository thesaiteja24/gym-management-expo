// app/(app)/(tabs)/profile.tsx
import ProfilePic from "@/components/ProfilePic";
import { useAuth } from "@/stores/authStore";
import { useUser } from "@/stores/userStore";
import { createFormData } from "@/utils/createFormData";
import React, { memo, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
      <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        {value ?? "—"}
      </Text>
    </View>
  );
});

export default function Profile() {
  const user = useAuth((state) => state.user);
  const updateProfilePic = useUser((s: any) => s.updateProfilePic);
  const isUploading = useUser((s: any) => s.isLoading);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const dob = new Date(user?.dateOfBirth ?? "");

  const getUserData = useUser((s: any) => s.getUserData);

  useEffect(() => {
    if (user?.userId) {
      getUserData(user.userId);
    }
  }, []);

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
          editable={false}
          onChange={(newUri) => newUri && onPick(newUri)}
        />
      </View>

      {/* Name as prominent line */}
      <View className="mb-3">
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {(user?.firstName ?? "") +
            (user?.lastName ? ` ${user.lastName}` : "")}
        </Text>
        {user?.phoneE164 ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {user.phoneE164}
          </Text>
        ) : null}
      </View>

      {/* Info Card */}
      <View className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <InfoRow label="Date of Birth" value={dob.toDateString() ?? ""} />
        <InfoRow label="Height" value={user?.height ? `${user.height}` : ""} />
        <InfoRow label="Weight" value={user?.weight ? `${user.weight}` : ""} />
      </View>
    </ScrollView>
  );
}
