import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { API_BASE_URL } from "@/config";
import { useStripe } from "@stripe/stripe-react-native";

interface ParkingLot {
    id: string;
    object_id?: number;
    price_per_hour?: number;
}

const ConfirmReservation = () => {
    const router = useRouter();
    const { plateNumber, timeRequested, parkingLotId, paymentMethodId} = useLocalSearchParams();
    const parsedParkingLot = parkingLotId ? JSON.parse(parkingLotId as string) : null;
    const [loading, setLoading] = useState(false);
    const { confirmPayment } = useStripe();

    const handleConfirmAndPay = async () => {
        if (!plateNumber || !timeRequested || !parsedParkingLot || !paymentMethodId) {
            Alert.alert("Error", "Missing information. Please check your details.");
            return;
        }

        setLoading(true);
        try {
            // Step 1: Process Payment
            const paymentResponse = await fetch (`${API_BASE_URL}/payment/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: parsedParkingLot.price_per_hour * 100, 
                }) 
            });
            
            const paymentData = await paymentResponse.json();
            console.log("Stripe Payment Response:", paymentData);
            if(!paymentData.clientSecret) {
                Alert.alert("Payment Error", "Failed to initialize payment.");
                setLoading(false);
                return;
            }

            // Step 2: Confirm Payment using Stripe
            const { error, paymentIntent } = await confirmPayment(paymentData.paymentIntent, {
                paymentMethodType: "Card",
                paymentMethodData: {
                    paymentMethodId: String(paymentMethodId),
                }
            });

            if (error) {
                Alert.alert("Payment Error", error.message);
                console.log(error)
                setLoading(false);
                return;
            }

            if (paymentIntent?.status !== "Succeeded") {
                Alert.alert("Payment Error", "Payment was not successful.");
                setLoading(false);
                return;
            }

            // Step 3: Create Reservation
            const reservationResponse = await fetch (`${API_BASE_URL}/reservation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plate_number: plateNumber,
                    time_requested: timeRequested,
                    parking_lot_id: parsedParkingLot.id,
                })
            });

            const reservationData = await reservationResponse.json();

            if (reservationData.verification_code) {
                Alert.alert("Success!", `Reservation created! Verification Code: ${reservationData.verification_code}`);
                router.replace('/home');
            } else {
                Alert.alert("Error", reservationData.Status || "Failed to create reservation");
            }

        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Confirm Reservation & Payment</Text>
            <Text>License Plate: {plateNumber}</Text>
            <Text>Time Requested: {timeRequested}</Text>
            <Text>Parking Lot: {parsedParkingLot?.object_id} - ${parsedParkingLot?.price_per_hour}/hr</Text>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <Button title="Confirm & Pay" onPress={handleConfirmAndPay} />
            )}
        </View>
    )
}

export default ConfirmReservation;
/* setLoading (true);
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
    }; */