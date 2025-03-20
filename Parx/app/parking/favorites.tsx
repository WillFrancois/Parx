import { pb, API_BASE_URL } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator, FlatList } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';

export default function FavoritesPage() {
    const router = useRouter();
    const [favLots, setFavLots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            const isValid = pb.authStore.isValid

            if (!isValid) {
                router.replace('/account/loginPage');
            } else {
                try {
                    setLoading(true);
                    const userId = pb.authStore.record;
                    if (!userId) throw new Error("User ID not found");
                    
                    const response = await fetch(`${API_BASE_URL}/favorites`, {
                        method: "POST",
                        headers: {

                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ id: userId })
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch favorites");
                    }

                    const favorites = await response.json();
                    setFavLots(favorites);
                } catch(error) {
                    console.error(error);
                    Alert.alert("Error", "Failed to load favorites.")
                } finally {
                    setLoading(false);
                }
            };
        };
        fetchFavorites()
        console.log(favLots);
    }, [])

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Favorites</Text>

            {loading ? (
                <ActivityIndicator size="large" color={"#0000ff"} />
            ) : (
                <FlatList
                    data={favLots}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1 }}>
                            <Text>Lot ID: {item}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}