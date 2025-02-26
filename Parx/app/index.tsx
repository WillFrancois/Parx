import { View, Text, Button, TextInput, Alert } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();
            await AsyncStorage.setItem("token", data.token)
            router.push("/home");
        } catch (error: any) {
            Alert.alert("Login Failed", error.message)
        }
    };

    const handleGuestLogin = async () => {
        try {
            await AsyncStorage.setItem("guest", "true");
            router.push("/home");
        } catch (error) {
            Alert.alert("Error", "Unable to login as guest.");
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Login Page</Text>
            <Text style={{ fontSize: 17, marginBottom: 10 }}>Email</Text>
            <TextInput 
                style={{ height: 40, padding: 5 }}
                placeholder="Enter your Email"
                onChangeText={newEmail => setEmail(newEmail)}
                defaultValue={email}
                autoCapitalize="none"
            />
            <Text style={{ fontSize: 17, marginBottom: 10 }}>Password</Text>
            <TextInput 
                style={{ height: 40, padding: 5 }}
                placeholder="Enter your Password"
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
            <Button title="Guest" onPress={handleGuestLogin} />
            <Button title="Create User" onPress={() => router.push('/createUser')} />
        </View>
    )
}
