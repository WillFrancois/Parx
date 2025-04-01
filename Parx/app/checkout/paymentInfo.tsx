import { View, Text, Button, TextInput, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import { API_BASE_URL } from '@/config';


const PaymentInfo = () => {
    const router = useRouter();
    const { plateNumber, timeRequested, parkingLotId } = useLocalSearchParams();
    const parsedParkingLot = parkingLotId ? JSON.parse(parkingLotId as string) : null;
    const [cardNumber, setCardNumber] = useState<string>('');

    const handleProceedToConfirm = () => {
        if (!cardNumber) {
            Alert.alert("Error", "Enter a valid card number.");
            return;
        }

        router.push({
            pathname: "/checkout/confirmReservation",
            params: {
                plateNumber,
                timeRequested,
                parkingLotId: JSON.stringify(parsedParkingLot),
                cardNumber,
            }
        })
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>Enter Payment Information</Text>
            <Text>Parking Lot: Lot {parsedParkingLot?.object_id} - ${parsedParkingLot?.price_per_hour}/hr</Text>
            <Text>Time Requested: {timeRequested}</Text>

            <Text>Card Number:</Text>
            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
                placeholder="Enter Card number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
            />

            <Button title="Next: Confirm Reservation" onPress={handleProceedToConfirm} />
        </View>
    );
};

export default PaymentInfo;