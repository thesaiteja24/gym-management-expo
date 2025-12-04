import { useAuth } from "@/stores/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
