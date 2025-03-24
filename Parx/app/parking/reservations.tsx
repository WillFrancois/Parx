import { pb, API_BASE_URL } from "@/config";
import { View, Text, Button, Alert, ActivityIndicator, FlatList, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';

interface ParkingLot {
    id: string;
    object_id?: number;
    geo_data?: object;
    zip_code?: number;
    total_spaces?: number;
    filled_spaces?: number;
    price_per_hour?: number;
    city_recommended?: boolean;
}

const Reservations = () => {
    const [plateNumber, setPlateNumber] = useState<string>('');
    const [timeRequested, setTimeRequested] = useState<string>('');
    const [parkingLotId, setParkingLotId] = useState<ParkingLot | null>(null);
    const [parkingLotData, setParkingLotData] = useState<ParkingLot[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                const records = await pb.collection("parking_lots").getFullList();
                setParkingLotData(records)
            } catch (error) {
                console.error(error)
                Alert.alert("Error", "Failed to load parking lots.");
            }
        };

        fetchParkingLots();
    }, [])

    const handleCreateReservation = async () => {
        if (!plateNumber || !timeRequested || !parkingLotId) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        setLoading (true);
        try {
            const response = await fetch(`${API_BASE_URL}/reservation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    plate_number: plateNumber,  
                    time_requested: timeRequested,
                    parking_lot_id: parkingLotId.id,
                })
            });

            const data = await response.json();
            if (data.verification_code) {
                Alert.alert("Success!", `Reservation created! Verification Code: ${data.verification_code}`);
                setPlateNumber("");
                setTimeRequested("");
                setParkingLotId(null);
            } else {
                Alert.alert("Error", data.Status || "Failed to create reservation");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to connect to the server.");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>Reserve a Parking Spot</Text>

            <Text>License Plate Number:</Text>
            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
                placeholder="Enter Plate Number"
                value={plateNumber}
                onChangeText={setPlateNumber}
            />

            <Text>Time Requested (YYYY-MM-DD HH:MM:SS):</Text>
            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
                placeholder="Enter Time Requested"
                value={timeRequested}
                onChangeText={setTimeRequested}
            />

            <Text>Choose a Parking Lot:</Text>
            <TouchableOpacity 
                onPress={() => setModalVisible(true)} 
                style={{ padding: 10, backgroundColor: "#ddd", marginBottom: 10 }} 
            >
                <Text>{parkingLotId ? `Lot ${parkingLotId.object_id} - $${parkingLotId.price_per_hour}/hr` : 'Select Lot'}</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <View style={{ backgroundColor: 'white', padding: 20 }}>
                        <FlatList
                            data={parkingLotData}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setParkingLotId(item);
                                        setModalVisible(false);
                                    }}
                                    style={{ padding: 10 }}
                                >
                                    <Text>{`Lot ${item.object_id} - $${item.price_per_hour}/hr`}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                </View>
            </Modal>

            {loading ? <ActivityIndicator size="large" /> : <Button title="Create Reservation" onPress={handleCreateReservation} />} 
        </View>
    );
};

export default Reservations;