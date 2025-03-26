import React, { useEffect, useState } from "react";
import { StyleSheet, View, TextInput, Text, Alert } from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pb } from "@/config";
import { MAPBOX_API_KEY } from "@/config";
import { WebView } from "react-native-webview";

interface ParkingLot {
    id: string;
    object_id: number;
    price_per_hour: number;
    total_spaces: number;
    filled_spaces: number;
    zip_codes: string;
    city_recommended?: boolean;
    geo_data: {
        geometry: {
            coordinates: number[][][];
        };
    };
}

const streetMap: React.FC = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCityOfficial, setIsCityOfficial] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [mapRegion, setMapRegion] = useState<Region | undefined>();
    const [searchQuery, setSearchQuery] = useState("");
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
    const [webViewKey, setWebViewKey] = useState(0);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log("Checking authentication...");
                const isValid = pb.authStore.isValid;
                const guest = await AsyncStorage.getItem("guest");
                const storedCityOfficialStatus = await AsyncStorage.getItem(
                    "isCityOfficial"
                );

                console.log("Auth Check:", {
                    isValid,
                    guest,
                    storedCityOfficialStatus,
                });

                if (!isValid && !guest) {
                    console.log("Not authenticated, redirecting...");
                    router.replace("/account/loginPage");
                    return;
                }

                setIsAuthenticated(true);

                if (isValid && !guest) {
                    console.log(
                        "Logged in user, setting city official status:",
                        storedCityOfficialStatus
                    );
                    setIsCityOfficial(storedCityOfficialStatus === "true");
                } else {
                    console.log("Guest user, setting city official to false");
                    setIsCityOfficial(false);
                    await AsyncStorage.setItem("isCityOfficial", "false");
                }
            } catch (error) {
                console.error("Authentication error:", error);
                router.replace("/account/loginPage");
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const clearCityOfficialStatus = async () => {
            const guest = await AsyncStorage.getItem("guest");
            if (guest === "true") {
                await AsyncStorage.setItem("isCityOfficial", "false");
                setIsCityOfficial(false);
            }
        };
        clearCityOfficialStatus();
    }, []);

    useEffect(() => {
        console.log("isCityOfficial state changed to:", isCityOfficial);
    }, [isCityOfficial]);

    useEffect(() => {
        if (!isAuthenticated) return;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, [isAuthenticated]);

    const fetchLocations = async (
        latitude: number,
        longitude: number,
        radius: number
    ) => {
        try {
            const list = await pb
                .collection("parking_lots")
                .getFullList<ParkingLot>();
            setParkingLots(list);
            setWebViewKey((prev) => prev + 1);
        } catch (error) {
            console.error("Error fetching locations:", error);
            Alert.alert(
                "Error",
                "Failed to fetch locations. Please check your network and try again."
            );
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (location) {
            timer = setTimeout(() => {
                fetchLocations(
                    location.coords.latitude,
                    location.coords.longitude,
                    0.1
                );
            }, 1000);
        }

        return () => clearTimeout(timer);
    }, [location]);

    const handleSearch = async () => {
        if (!searchQuery) return;

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    searchQuery
                )}.json?access_token=${MAPBOX_API_KEY}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const { center } = data.features[0];
                setMapRegion({
                    latitude: center[1],
                    longitude: center[0],
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                fetchLocations(center[1], center[0], 0.1);

                router.push({
                    pathname: "/resultsPage",
                    params: { results: JSON.stringify(data.features) },
                });
            } else {
                Alert.alert(
                    "No results found",
                    "Please try a different search term."
                );
            }
        } catch (error) {
            Alert.alert(
                "Error",
                "An error occurred while searching. Please try again."
            );
        }
    };

    const getHtmlContent = () => {
        const currentLocation = location
            ? {
                  lat: location.coords.latitude,
                  lng: location.coords.longitude,
              }
            : null;

        console.log(
            "Generating HTML with city official status:",
            isCityOfficial
        );

        const safeParking = parkingLots.map((lot) => ({
            id: lot.id,
            object_id: lot.object_id,
            price_per_hour: lot.price_per_hour,
            total_spaces: lot.total_spaces,
            filled_spaces: lot.filled_spaces,
            zip_codes: lot.zip_codes,
            city_recommended: lot.city_recommended || false,
            coordinates: lot.geo_data?.geometry?.coordinates?.[0]?.[0] || [],
        }));

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .popup-content { padding: 10px; }
            .popup-title { font-weight: bold; margin-bottom: 5px; }
            .city-official-controls { 
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
            }
            .checkbox-label {
              display: flex;
              align-items: center;
              gap: 5px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            
            const isCityOfficial = ${
                isCityOfficial === true
            }; // Force boolean evaluation
            console.log('WebView isCityOfficial:', isCityOfficial);

            const currentLocation = ${JSON.stringify(currentLocation)};
            const parkingLots = ${JSON.stringify(safeParking)};
            
            // Function to update city recommended status
            function updateCityRecommended(lotId, checked) {
              console.log('Updating recommendation:', lotId, checked); // Debug log
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'updateRecommended',
                lotId: lotId,
                recommended: checked
              }));
            }
  
            const map = L.map('map').setView(
              currentLocation ? [currentLocation.lat, currentLocation.lng] : [40.7128, -74.0060],
              13
            );
  
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(map);
  
            if (currentLocation) {
              L.marker([currentLocation.lat, currentLocation.lng])
                .addTo(map)
                .bindPopup('Your Location');
            }
  
            parkingLots.forEach(lot => {
              if (lot.coordinates && lot.coordinates.length > 0) {
                const polygonCoords = lot.coordinates.map(coord => [coord[1], coord[0]]);
                
                const polygon = L.polygon(polygonCoords, {
                  color: lot.city_recommended ? 'green' : 'red',
                  fillColor: lot.city_recommended ? '#0f3' : '#f03',
                  fillOpacity: 0.5
                }).addTo(map);

                let touchTimeout;
                let touchStartTime;
                let isTouching = false;

                polygon.on('touchstart', (e) => {
                  isTouching = true;
                  touchStartTime = Date.now();
                  isLongPress = false;
                  pressTimer = setTimeout(() => {
                    isLongPress = true;
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'navigateToResults',
                      lotData: {
                        id: lot.id,
                        object_id: lot.object_id,
                        price_per_hour: lot.price_per_hour,
                        total_spaces: lot.total_spaces,
                        filled_spaces: lot.filled_spaces,
                        zip_codes: lot.zip_codes,
                        city_recommended: lot.city_recommended
                      }
                    }));
                  }, 1000); // 1 second press
                });

                polygon.on('touchend', (e) => {
                  isTouching = false;
                  clearTimeout(touchTimeout);
                  
                  // Check for double tap
                  const touchEndTime = Date.now();
                  const touchDuration = touchEndTime - touchStartTime;
                  
                  if (touchDuration < 300) {
                    // This was a quick tap
                    if (polygon.lastTapTime && (touchEndTime - polygon.lastTapTime) < 300) {
                      // Double tap detected
                      console.log('Double tap detected');
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'navigateToResults',
                        lotData: {
                          id: lot.id,
                          object_id: lot.object_id,
                          price_per_hour: lot.price_per_hour,
                          total_spaces: lot.total_spaces,
                          filled_spaces: lot.filled_spaces,
                          zip_codes: lot.zip_codes,
                          city_recommended: lot.city_recommended
                        }
                      }));
                    }
                    polygon.lastTapTime = touchEndTime;
                  }
                });

                // Add mouse event handling for desktop
                let clickCount = 0;
                let clickTimer = null;

                polygon.on('click', (e) => {
                  clickCount++;
                  
                  if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                      clickCount = 0;
                    }, 300);
                  } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    console.log('Double click detected');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'navigateToResults',
                      lotData: {
                        id: lot.id,
                        object_id: lot.object_id,
                        price_per_hour: lot.price_per_hour,
                        total_spaces: lot.total_spaces,
                        filled_spaces: lot.filled_spaces,
                        zip_codes: lot.zip_codes,
                        city_recommended: lot.city_recommended
                      }
                    }));
                  }
                });

                // Add popup binding
                let cityOfficialControls = '';
                if (isCityOfficial) {
                  cityOfficialControls = \`
                    <div class="city-official-controls">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          \${lot.city_recommended ? 'checked' : ''} 
                          onchange="updateCityRecommended('\${lot.id}', this.checked)"
                        />
                        <span>City Recommended</span>
                      </label>
                    </div>
                  \`;
                } else if (lot.city_recommended) {
                  cityOfficialControls = '<div class="city-official-controls">✓ City Recommended</div>';
                }

                const popupContent = \`
                  <div class="popup-content">
                    <div class="popup-title">Parking Lot \${lot.object_id}</div>
                    <div>Price per Hour: $\${lot.price_per_hour}</div>
                    <div>Total Spaces: \${lot.total_spaces}</div>
                    <div>Filled Spaces: \${lot.filled_spaces}</div>
                    <div>Zip Codes: \${lot.zip_codes}</div>
                    \${cityOfficialControls}
                  </div>
                \`;

                polygon.bindPopup(popupContent);
              }
            });
  
            // Debug log for verification
            console.log('Map initialized with', parkingLots.length, 'locations');
          </script>
        </body>
      </html>
    `;
    };

    if (!isAuthenticated) {
        return <Text>Checking authentication...</Text>;
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
            />

            <WebView
                key={`${webViewKey}-${isCityOfficial}`}
                style={styles.map}
                source={{ html: getHtmlContent() }}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn("WebView error: ", nativeEvent);
                }}
                onMessage={async (event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === "updateRecommended") {
                            const isGuest = await AsyncStorage.getItem("guest");
                            if (isGuest === "true") {
                                console.log(
                                    "Guest user cannot update recommendations"
                                );
                                Alert.alert(
                                    "Permission Denied",
                                    "Guest users cannot make recommendations."
                                );
                                return;
                            }

                            await pb
                                .collection("parking_lots")
                                .update(data.lotId, {
                                    city_recommended: data.recommended,
                                });

                            fetchLocations(
                                location?.coords.latitude || 40.7128,
                                location?.coords.longitude || -74.006,
                                0.1
                            );
                        } else if (data.type === "navigateToResults") {
                            router.push({
                                pathname: "/resultsPage",
                                params: {
                                    lotData: JSON.stringify(data.lotData),
                                },
                            });
                        }
                    } catch (error) {
                        console.error("Error handling WebView message:", error);
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBar: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        height: 40,
        backgroundColor: "white",
        borderRadius: 5,
        paddingHorizontal: 10,
        zIndex: 1,
    },
    map: {
        flex: 1,
    },
});

export default streetMap;
