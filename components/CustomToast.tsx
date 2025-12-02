import { StyleSheet, Text, useColorScheme, View } from "react-native";

export function CustomToast({
  text1,
  text2,
  type,
}: {
  text1?: string;
  text2?: string;
  type: "success" | "error" | "info";
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const borderColors = {
    success: "#4CAF50", // green
    error: "#FF3B30", // red
    info: "#007AFF", // blue
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
          borderLeftColor: borderColors[type],
          shadowColor: isDark ? "#ffffff" : "#000000",
        },
      ]}
    >
      {text1 && (
        <Text style={[styles.title, { color: isDark ? "white" : "black" }]}>
          {text1}
        </Text>
      )}
      {text2 && (
        <Text style={[styles.subtitle, { color: isDark ? "white" : "black" }]}>
          {text2}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginHorizontal: 16,

    // soft shadow for both iOS + Android
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
