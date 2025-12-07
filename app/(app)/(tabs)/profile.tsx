// app/(app)/(tabs)/profile.tsx
import ProfilePic from "@/components/ProfilePic";
import { useAuth } from "@/stores/authStore";
import { useUser } from "@/stores/userStore";
import React, { memo, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

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
  const dob = new Date(user?.dateOfBirth ?? "");

  const getUserData = useUser((s: any) => s.getUserData);

  useEffect(() => {
    if (user?.userId) {
      getUserData(user.userId);
    }
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      className="bg-white dark:bg-black"
    >
      {/* Avatar */}
      <View className="items-center mb-6">
        <ProfilePic uri={user?.profilePicUrl} size={132} editable={false} />
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
