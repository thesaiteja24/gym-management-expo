// app/(app)/(tabs)/profile.tsx
import ProfilePic from "@/components/ProfilePic";
import { useAuth } from "@/stores/authStore";
import { useUser } from "@/stores/userStore";
import { createFormData } from "@/utils/createFormData";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Profile() {
  const user = useAuth((state) => state.user);
  const updateProfilePic = useUser((s: any) => s.updateProfilePic);
  const isUploading = useUser((s: any) => s.isLoading);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const onPick = async (uri: string | null) => {
    if (!uri) return;

    // show optimistic preview immediately
    setLocalPreview(uri);

    if (!user?.userId) {
      setLocalPreview(null);
      Toast.show({ type: "error", text1: "No user id" });
      return;
    }

    try {
      const formData = createFormData(uri, "profilePic"); // field name expected by server
      const res = await updateProfilePic(user.userId, formData);

      if (res?.success) {
        Toast.show({ type: "success", text1: "Profile picture updated" });
        // auth state updated inside updateProfilePic
      } else {
        console.error("Profile pic upload error:", res?.message);
        Toast.show({
          type: "error",
          text1: "Upload failed please try again",
        });
        // revert preview if server didn't accept
        setLocalPreview(user?.profilePicUrl ?? null);
      }
    } catch (err: any) {
      console.error("Profile pic upload error:", err);
      Toast.show({
        type: "error",
        text1: "Upload failed please try again",
      });
      setLocalPreview(user?.profilePicUrl ?? null);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black p-4">
      <Text className="text-black dark:text-white text-xl mb-4">Profile</Text>

      <View className="items-center mb-6">
        <ProfilePic
          uri={localPreview ?? user?.profilePicUrl}
          size={130}
          editable={true}
          onChange={(newUri) => {
            // ProfilePic already does picking; it will call onChange with the uri
            if (newUri) onPick(newUri);
          }}
        />
      </View>

      {isUploading && (
        <View className="items-center">
          <ActivityIndicator size="small" />
          <Text className="text-gray-500 mt-2">Uploading...</Text>
        </View>
      )}

      {/* other profile fields */}
      <Text className="text-black dark:text-white mt-6">
        Name: {user?.firstName ?? ""} {user?.lastName ?? ""}
      </Text>
      <Text className="text-black dark:text-white mt-2">
        Phone: {user?.phoneE164}
      </Text>
    </ScrollView>
  );
}
