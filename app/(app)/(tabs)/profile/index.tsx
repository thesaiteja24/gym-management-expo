// app/(app)/(tabs)/profile.tsx
import EditableAvatar from "@/components/EditableAvatar";
import { useAuth } from "@/stores/authStore";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const InfoRow = memo(function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-200/60 py-3 last:border-b-0 dark:border-neutral-800">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
      <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        {value ?? "—"}
      </Text>
    </View>
  );
});

export default function ProfileScreen() {
  const user = useAuth((state) => state.user);
  const dob = new Date(user?.dateOfBirth ?? "");

  return (
    <View
      className="flex-1 bg-white p-4 dark:bg-black"
      style={{ paddingBottom: useSafeAreaInsets().bottom }}
    >
      {/* Avatar */}
      <View className="mb-6 items-center">
        <EditableAvatar
          uri={user?.profilePicUrl ? user.profilePicUrl : null}
          size={132}
          editable={false}
        />
      </View>

      {/* Name as prominent line */}
      <View className="mb-3">
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {(user?.firstName ?? "") +
            (user?.lastName ? ` ${user.lastName}` : "")}
        </Text>
        {user?.phoneE164 ? (
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {user.phoneE164}
          </Text>
        ) : null}
      </View>

      {/* Info Card */}
      <View className="rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <InfoRow label="Date of Birth" value={dob.toDateString() ?? ""} />
        <InfoRow label="Height" value={user?.height ? `${user.height}` : ""} />
        <InfoRow label="Weight" value={user?.weight ? `${user.weight}` : ""} />
      </View>
    </View>
  );
}
