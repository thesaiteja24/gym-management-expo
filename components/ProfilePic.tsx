import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

type ProfilePicProps = {
  uri?: string | null;
  size?: number;
  editable?: boolean;
  onChange?: (newUri: string | null) => void;

  borderColor?: string;
  borderWidth?: number;

  pencilSize?: number;
  pencilColor?: string;
  pencilBg?: string;

  shape?: "circle" | "rounded" | "square";
};

export default function ProfilePic({
  uri = null,
  size = 120,
  editable = true,
  onChange,

  borderColor = "#d1d5db",
  borderWidth = 2,

  pencilSize = 18,
  pencilColor = "#fff",
  pencilBg = "#1e90ff",

  shape = "circle",
}: ProfilePicProps) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (!editable) return;
    try {
      setLoading(true);

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!res.canceled) {
        const newUri = res.assets[0].uri;
        onChange?.(newUri);
      }
    } catch (err) {
      console.log("Image picking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const radius =
    shape === "circle" ? size / 2 : shape === "rounded" ? size * 0.2 : 0;

  return (
    <View style={{ width: size, height: size }}>
      {/* Image */}
      <TouchableOpacity
        activeOpacity={editable ? 0.8 : 1}
        onPress={pickImage}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          borderWidth,
          borderColor,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#e5e7eb",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Image
            source={uri ? { uri } : require("../assets/images/icon.png")}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="cover"
          />
        )}
      </TouchableOpacity>

      {/* Pencil icon */}
      {editable && (
        <TouchableOpacity
          onPress={pickImage}
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            backgroundColor: pencilBg,
            width: pencilSize + 16,
            height: pencilSize + 16,
            borderRadius: (pencilSize + 16) / 2,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons name="pencil" size={pencilSize} color={pencilColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}
