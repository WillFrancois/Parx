import { useEffect, useState } from "react";
import { Text, View, Button, Alert } from "react-native";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pb } from "@/config";


export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = pb.authStore.isValid;
      const guest = await AsyncStorage.getItem("guest");
      if (!isValid && !guest) {
        router.replace("/");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    pb.authStore.clear();
    await AsyncStorage.removeItem("guest");
    Alert.alert("Logged out", "You have been logged out.");
    router.replace("/");
  };

  if (!isAuthenticated) {
    return <Text>Checking authentication...</Text>
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 24, marginBottom: 20  }}>Welcome to Home!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}