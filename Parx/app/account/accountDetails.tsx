import { pb } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';

export default function AccountDetails() {
    const router = useRouter();
    const [user, setUser] = useState<{
         email: string; 
         created: string; 
         cityOfficial: boolean;
        }>({
            email: "",
            created: "",
            cityOfficial: false,
        });

    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const fetchUserData = async () => {
            const isValid = pb.authStore.isValid;

            if (!isValid) {
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

        const unsubscribe = pb.authStore.onChange(() => {
            fetchUserData();
        })

        return () => {
            unsubscribe();
        }
    }, [])

    const handleLogout = async () => {
        pb.authStore.clear();
        Alert.alert("Logged out", "You have been logged out.");
        router.replace("/account/loginPage");
        console.log(pb.authStore.isValid);
      };

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
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 27, marginBottom: 20, }}>Account Information</Text>
            <View style= {{
                flexDirection: "row",
                backgroundColor: "#ddd",
            }}>
                <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    marginHorizontal: 20 
                    }}>
                        Date Created:
                    </Text>
                <Text style={{ fontSize: 16, }}>{user.created}</Text>
            </View>
             
            {user.cityOfficial && (
                <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    marginHorizontal: 5 
                }}>
                    City Official ✅
                    </Text>
                )}
            <View style={{
            flexDirection: "row",
            justifyContent: "center",
            padding: 10,
            }}>
                <View style={{ marginHorizontal: 5 }}>
                    <Button title="Return to Home" onPress={() => router.push("/home")} />
                </View>
                <View style={{ marginHorizontal: 5 }}>
                    <Button title="Logout" onPress={handleLogout} />
                </View>
            </View>
        </View>
    )
}
