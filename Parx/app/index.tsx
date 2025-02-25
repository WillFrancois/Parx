import { View, Text, Button, TextInput } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState} from 'react';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Login Page</Text>
            <Text style={{ fontSize: 17, marginBottom: 10 }}>Email</Text>
            <TextInput 
                style={{ height: 40, padding: 5 }}
                placeholder="Enter your Email"
                onChangeText={newEmail => setEmail(newEmail)}
                defaultValue={email}
            />
            <Text style={{ fontSize: 17, marginBottom: 10 }}>Password</Text>
            <TextInput 
                style={{ height: 40, padding: 5 }}
                placeholder="Enter your Password"
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
            />
            <Button title="Submit" onPress={() => router.push("/home")} />
        </View>
    )
}
