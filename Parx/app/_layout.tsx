import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const guest = await AsyncStorage.getItem("guest");
      if (token || guest) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  return (
      <Stack >
        <Stack.Screen name="index" options={{ title: "Login" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen name="createuser" options={{ title: "Create Account" }} />
      </Stack>
    );
}
