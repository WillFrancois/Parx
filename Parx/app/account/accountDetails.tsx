import { API_BASE_URL, pb } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator, TextInput } from "react-native";
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
    const [userId, setUserId] = useState<string | null>(null);

    const [reservations, setReservations] = useState<{
        timeRequested: string;
        timeEnd: string;
        location: string;
        verification_code: string;
    }[]>([]);

    const [plateNumber, setPlateNumber] = useState<string>("");

    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchUserData = async () => {
            const isValid = pb.authStore.isValid;

            if (!isValid) {
                router.replace("/account/loginPage");
            } else if (isValid) {
                console.log(pb.authStore.record);
                try {
                    setUserId(pb.authStore.record as unknown as string);
                    
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

    const handleSearchReservations = async () => {
        if (!plateNumber.trim()) {
            Alert.alert("Error", "Please enter a license plate number.");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/reservation/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ plate_number: plateNumber })
            });

            const data = await response.json();
            if (response.ok) {
                setReservations([data]);
            } else {
                Alert.alert("Error", data.Status || "No reservations found.");
            } 
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch reservations.");
        }
    };

    const handleAddToFavorites = async (parkingLotId: string) => {
        if (!userId) {
            Alert.alert("Error", "User ID not found.");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/favorites/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    parking_lot_id: parkingLotId
                })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Added to favorites!");
            } else {
                Alert.alert("Error", data.status || "Failed to add to favorits.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not add to favorites.");
        }
    }

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
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 20, alignSelf: "center" }}>Search Reservations</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            padding: 10,
                            marginVertical: 10,
                            width: "80%",
                            alignSelf: "center"
                        }}
                        placeholder="Enter License Plate Number"
                        value={plateNumber}
                        onChangeText={setPlateNumber}
                    />
                    <Button title="Search" onPress={handleSearchReservations} />
                {reservations.length > 0 ? (
                    reservations.map((reservation, index) => (
                        <View key={index} style={{ padding: 10, marginVertical: 5, backgroundColor: "#eee", }}>
                            <Text style={{ fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Location:</Text> {reservation.location}</Text>
                            <Text style={{ fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Time Requested:</Text> {reservation.timeRequested}</Text>
                            <Text style={{ fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Reservation Ends:</Text> {reservation.timeEnd}</Text>
                            <Text style={{ fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Verification Code:</Text> {reservation.verification_code}</Text>
                            <Button title="Add to Favorites" onPress={() => handleAddToFavorites(reservation.location)} />
                        </View>
                    ))
                ) : (
                    <Text> No reservations found.</Text>
                )}
                </View>
        </View>
    )
}
