import { Text, View, Button } from "react-native";
import { useRouter } from 'expo-router'

export default function Index() {
  const router = useRouter();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 24, marginBottom: 20  }}>Home</Text>
      <Button title="Go to Login" onPress={() => router.push("/login")} />
    </View>
  )
}
