import { View, Text, Button, TextInput, Alert, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, pb } from "@/config";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/user/login`, {
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
    
            if (!data.isValid) {
                throw new Error("Authentication failed");
            }
            await AsyncStorage.removeItem("guest");
            
            pb.authStore.save(data.token, data.record);
    
            const isCityOfficial = email === 'cityofficialtest@ex.com';

            await AsyncStorage.setItem('isCityOfficial', isCityOfficial ? 'true' : 'false');
            console.log('Login: Stored city official status:', isCityOfficial);
            
            setIsLoading(false);
            Alert.alert("Login Successful", "Successfully logged in!")
            router.push("/home");
        } catch (error: any) {
            setIsLoading(false);
            Alert.alert("Login Failed", error.message)
        }
    };

    const handleGuestLogin = async () => {
    try {
        await AsyncStorage.setItem("guest", "true");
        await AsyncStorage.setItem('isCityOfficial', 'false');
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
            <View style={{
                flexDirection: "row",
                justifyContent: "space-around",
                padding: 10,
            }}>
                <View style={{ marginHorizontal: 5 }}>
                   <Button title="Login" onPress={handleLogin} /> 
                </View>
                <View style={{ marginHorizontal: 5 }}>
                    <Button title="Guest" onPress={handleGuestLogin} />
                </View>
                <View style={{ marginHorizontal: 5 }}>
                    <Button title="Create User" onPress={() => router.push('/account/createUser')} />
                </View>
            </View>
            {isLoading && <ActivityIndicator size="large" />}
        </View>
    )
}