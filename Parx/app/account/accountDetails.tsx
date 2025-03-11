import { pb } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator, Image } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountDetails() {
    const router = useRouter();
    const [user, setUser] = useState<{
         email: String, 
         created: String, 
         cityOfficial: boolean } |null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const isValid = pb.authStore.isValid;
            const guest = await AsyncStorage.getItem("guest");

            if (!isValid && !guest) {
                router.replace("/account/loginPage");
            } else if (isValid) {
                console.log(pb.authStore.record);
                try {
                    const userData = await pb.collection('userDetails').getOne(`${pb.authStore.record}`)
                    setUser({
                        email: userData.email,
                        created: userData.created,
                        cityOfficial: userData.cityOfficial,
                    })
                } catch (error: any) {
                    Alert.alert("Error", error.message);
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, [])

    if (loading) {
        return (
            <View>
                <Text>Loading user details...</Text>
                <ActivityIndicator size="large"/>
            </View>
        )
    }

    if (!user) {
        return <Text>Error fetching user details.</Text>
    }

    return (
        <View>
            <Text style={{ fontSize: 24, marginBottom: 20  }}>Account Information</Text>
            <Text>Date Created: {user.created}</Text>
            {user.cityOfficial && <Text>City Official</Text>}
            <Button title="Return to Home" onPress={() => router.push("/home")} />
            
        </View>
    )
}
