import { pb } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator, FlatList } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';

export default function FavoritesPage() {
    const router = useRouter();
    const [favLots, setFaveLots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            const isValid = pb.authStore.isValid

            if (!isValid) {
                router.replace('/account/loginPage');
            } else {
                try {
                    setLoading(true);
                    const favorites = await pb.collection('favorites').getFullList({
                        filter: `user = ${pb.authStore.record}`
                    })
                    setFaveLots(favorites);
                    console.log(favorites);
                } catch (error) {
                    Alert.alert("Error", "Failed to load favorites.");
                } finally {
                    setLoading(false);
                }
            };
        };
        fetchFavorites()
    }, [pb.authStore.record])

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Favorites</Text>

            {loading ? (
                <ActivityIndicator size="large" color={"#0000ff"} />
            ) : (
                <FlatList
                    data={favLots}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1 }}>
                            <Text>Lot ID: {item.parkingLot}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}