import { pb, API_BASE_URL } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator, FlatList } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';

export default function FavoritesPage() {
    const router = useRouter();
    const [favLots, setFavLots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                    if (response.status === 403) {
                        throw new Error("You do not have permission to view favorites.");
                    }
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

    useEffect(() => {
        fetchFavorites();

        const interval = setInterval(() => {
            fetchFavorites();
        }, 10000);

        return () => clearInterval(interval);
        
    }, [])

    const deleteFavorite = async (parkingLotId: string) => {
        try {
            setLoading(true);
            const userId = pb.authStore.record
            if (!userId) throw new Error("User ID not found.");

            const response = await fetch(`${API_BASE_URL}/favorites/delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    parking_lot_id: parkingLotId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete favorite");
            }

            fetchFavorites();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to delete favorite.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 10 }}>Favorites</Text>

            {loading ? (
                <ActivityIndicator size="large" color={"#0000ff"} />
            ) : favLots.length === 0 ? (
                <Text style={{ fontSize: 20, textAlign: "center", marginTop: 20 }}>You have no favorites yet. Return to the map to pick a parking lot!</Text>
            ) : (
                <FlatList
                    data={favLots}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                                <Text><Text style={{ fontWeight: "bold" }}>Lot ID:</Text> {item}</Text>
                            </View>
                            <View>        
                                <Button title="View on Map" onPress={() => router.push('/home')} />
                            </View>    
                            <View>
                                <Button title="Delete" onPress={() => deleteFavorite(item)} color="red" />
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    )
}