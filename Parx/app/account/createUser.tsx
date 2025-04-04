import { View, Text, Button, TextInput, Alert, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState} from 'react';
import { API_BASE_URL } from "@/config";

export default function CreateUser() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                throw new Error("Failed to create user");
            }
            setIsLoading(false);
            Alert.alert("Success", "Account created successfully!");
            router.push('/account/loginPage');;

            } catch (error: any) {
                setIsLoading(false);
                Alert.alert("Failed to Create User", error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Create Account</Text>
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
            <View style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            padding: 10,
                        }}>
                <View style={{ marginHorizontal: 5 }}>
                    <Button title="Create Account" onPress={handleSubmit} />
                </View>
                <View style={{ marginHorizontal: 5 }}>
                    <Button title="Return to Home" onPress={() => router.push("/")} />
                </View>
            </View>
            {isLoading && <ActivityIndicator size="large" />}
        </View>
    )
}
