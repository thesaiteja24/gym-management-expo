import { Button } from "@/components/ui/Button";
import { SearchedUser, useUser } from "@/stores/userStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SearchItem = ({ firstName, lastName, profilePicUrl }: SearchedUser) => {
  return (
    <View className="w-full flex-row items-center justify-between gap-2">
      <View className="flex-row items-center justify-center gap-4">
        <Image
          source={
            profilePicUrl
              ? { uri: profilePicUrl }
              : require("../../../assets/images/icon.png")
          }
          style={{
            width: 48,
            height: 48,
            borderRadius: 100,
            borderWidth: 0.25,
          }}
          contentFit="cover"
        />
        <Text className="text-black dark:text-white">
          {firstName} {lastName}
        </Text>
      </View>
      <View>
        <Button title="Follow" onPress={() => console.log("Hello")} />
      </View>
    </View>
  );
};

export default function Search() {
  const lineHeight = Platform.OS === "ios" ? 0 : 20;
  const safeAreaInsets = useSafeAreaInsets();

  const [query, setQuery] = useState("");

  const { searchUsers, resetSearchedUser, searchResult, searchLoading } =
    useUser();

  useEffect(() => {
    if (query.length < 3) {
      resetSearchedUser();
    }

    const timer = setTimeout(() => {
      if (query.length >= 3) {
        searchUsers(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View
      style={{ paddingBottom: safeAreaInsets.bottom }}
      className="flex-1 bg-white px-4 pt-4 dark:bg-black"
    >
      <View className="flex-row items-center justify-center gap-2">
        {searchLoading ? (
          <ActivityIndicator
            size="small"
            color="black"
            style={{ width: 24, height: 24 }}
          />
        ) : (
          <MaterialCommunityIcons name="magnify" size={24} color="black" />
        )}
        <TextInput
          value={query}
          onChangeText={(text) => setQuery(text)}
          placeholder="Search on PUMP"
          placeholderTextColor="#9CA3AF"
          className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-lg text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          style={{ lineHeight: lineHeight }}
        />
      </View>
      {!searchResult ? (
        <View className="mt-4 flex-1 flex-col items-center justify-center">
          <Text className="text-black dark:text-white">
            Please type more to search
          </Text>
        </View>
      ) : (
        <View className="m-4 flex-1 flex-col items-start justify-start">
          {searchResult?.map((user) => (
            <SearchItem key={user.id} {...user} />
          ))}
        </View>
      )}
    </View>
  );
}
