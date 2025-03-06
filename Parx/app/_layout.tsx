import { Slot, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack >
        <Stack.Screen name="index" options={{ title: "Login" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen name="createuser" options={{ title: "Create Account" }} />
      </Stack>
    </>

    );
}
