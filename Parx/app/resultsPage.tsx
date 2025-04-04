import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

interface ParkingLotData {
    id: string;
    object_id: number;
    price_per_hour: number;
    total_spaces: number;
    filled_spaces: number;
    zip_codes: string;
    city_recommended: boolean;
}

const ResultsPage: React.FC = () => {
    const router = useRouter();
    const { lotData } = useLocalSearchParams();
    const [parkingLot, setParkingLot] = useState<ParkingLotData | null>(null);

    useEffect(() => {
        if (lotData) {
            try {
                const parsedData = JSON.parse(lotData as string);
                setParkingLot(parsedData);
            } catch (error) {
                console.error("Error parsing lot data:", error);
            }
        }
    }, [lotData]);

    if (!parkingLot) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const availableSpaces = parkingLot.total_spaces - parkingLot.filled_spaces;
    const occupancyRate =
        (parkingLot.filled_spaces / parkingLot.total_spaces) * 100;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Parking Lot Details</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/home")}
                >
                    <Text style={styles.backButtonText}>← Back to Map</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.lotId}>Lot #{parkingLot.object_id}</Text>

                {parkingLot.city_recommended && (
                    <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>
                            ✓ City Recommended
                        </Text>
                    </View>
                )}

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Price per Hour:</Text>
                        <Text style={styles.value}>
                            ${parkingLot.price_per_hour}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Total Spaces:</Text>
                        <Text style={styles.value}>
                            {parkingLot.total_spaces}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Available Spaces:</Text>
                        <Text
                            style={[
                                styles.value,
                                availableSpaces < 10
                                    ? styles.lowAvailability
                                    : styles.goodAvailability,
                            ]}
                        >
                            {availableSpaces}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Occupancy Rate:</Text>
                        <Text style={styles.value}>
                            {occupancyRate.toFixed(1)}%
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Zip Code:</Text>
                        <Text style={styles.value}>{parkingLot.zip_codes}</Text>
                    </View>
                </View>

                <View style={styles.occupancyBar}>
                    <View
                        style={[
                            styles.occupancyFill,
                            { width: `${occupancyRate}%` },
                            occupancyRate > 90
                                ? styles.highOccupancy
                                : occupancyRate > 70
                                ? styles.mediumOccupancy
                                : styles.lowOccupancy,
                        ]}
                    />
                </View>
                <TouchableOpacity
                style={styles.reserveButton}
                onPress={() => {
                    router.push({
                        pathname: '/parking/reservations',
                        params: { lotData: JSON.stringify(parkingLot) },
                    });
                }}
            >
                <Text style={styles.reserveButtonText}>Reserve a Spot</Text>
            </TouchableOpacity>
            </View>
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        padding: 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: "#007AFF",
        fontSize: 16,
    },
    card: {
        margin: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    lotId: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    recommendedBadge: {
        backgroundColor: "#4CAF50",
        padding: 8,
        borderRadius: 5,
        marginBottom: 15,
    },
    recommendedText: {
        color: "#fff",
        fontWeight: "bold",
    },
    infoSection: {
        marginVertical: 10,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    label: {
        fontSize: 16,
        color: "#666",
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
    },
    lowAvailability: {
        color: "#f44336",
    },
    goodAvailability: {
        color: "#4CAF50",
    },
    occupancyBar: {
        height: 20,
        backgroundColor: "#eee",
        borderRadius: 10,
        marginTop: 15,
        overflow: "hidden",
    },
    occupancyFill: {
        height: "100%",
        borderRadius: 10,
    },
    highOccupancy: {
        backgroundColor: "#f44336",
    },
    mediumOccupancy: {
        backgroundColor: "#FFC107",
    },
    lowOccupancy: {
        backgroundColor: "#4CAF50",
    },
    reserveButton: {
        marginTop: 20,
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    }, 
    reserveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    }
});

export default ResultsPage;
