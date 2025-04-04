import { ScrollView, View, Text, Button, TextInput, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import { useStripe, CardField } from "@stripe/stripe-react-native";

const PaymentInfo = () => {
    const router = useRouter();
    const { plateNumber, timeRequested, parkingLotId } = useLocalSearchParams();
    const parsedParkingLot = parkingLotId ? JSON.parse(parkingLotId as string) : null;
    const { createPaymentMethod } = useStripe();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState({
        line1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
    })

    const handleProceedToConfirm = async () => {
        if (!name || !email || !phone || !address.line1 || !address.city || !address.state || !address.postalCode) {
            Alert.alert("Error", "Please enter all billing details.")
            return;
        }

        setLoading(true);
        try {
            const { error, paymentMethod } = await createPaymentMethod({
                paymentMethodType: "Card",
                paymentMethodData: {
                    billingDetails: {
                        name,
                        email,
                        phone,
                        address,
                    },
                },
            });
            
            if (error) {
                console.error("Stripe payment Method Error:", error);
                Alert.alert("Error", error.message);
    
                return;
            }
    
            router.push({
                pathname: "/checkout/confirmReservation",
                params: {
                    plateNumber,
                    timeRequested,
                    parkingLotId,
                    paymentMethodId: paymentMethod?.id,
                    billingDetails: JSON.stringify({
                        name,
                        email,
                        phone,
                        address,
                    }),
                }
            });
        } catch (err) {
            console.error("Unexpected error:", err);
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <View>
                <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>Enter Payment Information</Text>
                <Text>Parking Lot: Lot {parsedParkingLot?.object_id} - ${parsedParkingLot?.price_per_hour}/hr</Text>
                <Text>Time Requested: {timeRequested}</Text>
                         
                <Text style={{ fontSize: 20, paddingTop: 10 }}>Billing Information</Text>
                <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderBottomWidth: 1, marginBottom: 10 }} keyboardType="email-address" />
                <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} style={{ borderBottomWidth: 1, marginBottom: 10 }} keyboardType="phone-pad" />
                <TextInput placeholder="Address Line 1" value={address.line1} onChangeText={(text) => setAddress({ ...address, line1: text })} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                <TextInput placeholder="City" value={address.city} onChangeText={(text) => setAddress({ ...address, city: text })} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                <TextInput placeholder="State" value={address.state} onChangeText={(text) => setAddress({ ...address, state: text })} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                <TextInput placeholder="Postal Code" value={address.postalCode} onChangeText={(text) => setAddress( {...address, postalCode: text})} style={{ borderBottomWidth: 1, marginBottom: 10 }} keyboardType="numeric" />

                <Text style={{ fontSize: 20, paddingTop: 10 }}>Card Details</Text>
                <CardField postalCodeEnabled={false} style={{ height: 50, marginVertical: 10 }} />

                {loading? <ActivityIndicator size="large" /> : <Button title="Next: Confirm Reservation" onPress={handleProceedToConfirm} />}
            </View>
        </ScrollView>
    );
};

export default PaymentInfo;