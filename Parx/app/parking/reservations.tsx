import { pb } from "@/config";
import { View, Text, Button, Alert, FlatList, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, {useState, useEffect} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const [parkingLotData, setParkingLotData] = useState<ParkingLot[]>([])
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { lotData } = useLocalSearchParams();
    const initialParkingLot = lotData ? JSON.parse(lotData as string) : null;
    const [parkingLotId, setParkingLotId] = useState<ParkingLot | null>(initialParkingLot);
    const router = useRouter();

    const isLoggedIn = pb.authStore.isValid;

    useEffect(() => {
        if (!isLoggedIn) {
            Alert.alert("Login Required", "You must be logged in to reserve a parking spot.", [
                { text: "Go to Login", onPress: async () => {
                    try {
                        await AsyncStorage.removeItem('guest');
                        router.replace('/account/loginPage');
                    } catch (error) {
                        console.error("Failed to remove guest token", error);
                        router.replace('/account/loginPage');
                    }
                }}
            ])
        }
    }, [isLoggedIn])

    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                const records = await pb.collection("parking_lots").getFullList();
                setParkingLotData(records)

                if (initialParkingLot && !records.some(lot => lot.id === initialParkingLot.id)) {
                    setParkingLotData(prevData => [...prevData, initialParkingLot])
                }
            } catch (error) {
                console.error(error)
                Alert.alert("Error", "Failed to load parking lots.");
            }
        };

        fetchParkingLots();
    }, [])

    const handleProceedToPayment = async () => {
        if (!plateNumber || !timeRequested || !parkingLotId) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        router.push({
            pathname: "/checkout/paymentInfo",
            params: {
                plateNumber,
                timeRequested,
                parkingLotId: JSON.stringify(parkingLotId),
            }
        })
    }
        

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

            <Button title="Proceed to Payment" onPress={handleProceedToPayment} /> 
        </View>
    );
};

export default Reservations;