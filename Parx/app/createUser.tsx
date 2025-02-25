import { View, Text, Button, TextInput, Alert } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState} from 'react';

export default function CreateUser() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:5000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                throw new Error("Failed to create user");
            }

            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => router.push("/") }
            ])

            } catch (error: any) {
                Alert.alert("Failed to Create User", error.message)
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
            <Button title="Create Account" onPress={handleSubmit} />
        </View>
    )
}
