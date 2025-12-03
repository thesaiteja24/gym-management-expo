import { useAuth } from "@/stores/authStore";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const user = useAuth((state: any) => state.user);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-black">
      {/* Render user information */}
      {user && (
        <>
          <Text className="text-2xl text-black dark:text-white m-4 p-4">
            User ID: {user.userId}
          </Text>
          <Text className="text-2xl text-black dark:text-white m-4 p-4">
            Phone: {user.phoneE164}
          </Text>
          <Text className="text-2xl text-black dark:text-white m-4 p-4">
            First Name: {user.firstName}
          </Text>
          <Text className="text-2xl text-black dark:text-white m-4 p-4">
            Last Name: {user.lastName}
          </Text>
          <Text className="text-2xl text-black dark:text-white m-4 p-4">
            Role: {user.role}
          </Text>
        </>
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
