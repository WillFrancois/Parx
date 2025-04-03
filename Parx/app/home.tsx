import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    TextInput,
    Text,
    Alert,
    TouchableOpacity,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, pb } from "@/config";
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
    const webViewRef = useRef<WebView>(null);
    const [isViewingSearchedLocation, setIsViewingSearchedLocation] =
        useState(false);
    const updateParkingLotRecommendation = async (
        lotId: string,
        recommended: boolean
    ) => {
        try {
            const userId = pb.authStore.record?.id;
            if (!userId) throw new Error("User ID not found.");

            console.log("Sending recommendation update:", {
                userId,
                lotId,
                recommended,
                url: `${API_BASE_URL}/parkinglot/recommend`,
            });

            const response = await fetch(
                `${API_BASE_URL}/parkinglot/recommend`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${pb.authStore.token}`, 
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        parking_lot_id: lotId, 
                        city_recommended: recommended,
                    }),
                }
            );

            const responseData = await response.json();
            console.log("Server response:", responseData);

            if (!response.ok) {
                throw new Error(
                    responseData.message || "Failed to update recommendation"
                );
            }

            if (webViewRef.current) {
                const updateScript = `
                    document.querySelectorAll('.leaflet-interactive').forEach(polygon => {
                        if (polygon._lotId === '${lotId}') {
                            polygon.setStyle({
                                color: ${recommended} ? 'green' : 'red',
                                fillColor: ${recommended} ? '#0f3' : '#f03'
                            });
                        }
                    });
                `;
                webViewRef.current.injectJavaScript(updateScript);
            }

            await fetchLocations(
                location?.coords.latitude || 40.7128,
                location?.coords.longitude || -74.006,
                0.1
            );

            Alert.alert(
                "Success",
                "Parking lot recommendation updated successfully!"
            );
        } catch (error) {
            console.error("Error updating parking lot:", {
                error,
                message: error instanceof Error ? error.message : String(error),
            });
            Alert.alert("Error", "Failed to update parking lot recommendation");
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log("Starting authentication check...");

                console.log("Full Auth Store State:", {
                    isValid: pb.authStore.isValid,
                    token: pb.authStore.token,
                    model: pb.authStore.model,
                });

                const isValid = pb.authStore.isValid;
                const guest = await AsyncStorage.getItem("guest");

                if (isValid && pb.authStore.token) {
                    try {
                        const authData = await pb
                            .collection("users")
                            .authRefresh();
                        console.log("Auth Refresh Data:", authData);

                        if (authData && authData.record) {
                            const isCityOff = Boolean(
                                authData.record.cityOfficial
                            );
                            console.log("User Record:", authData.record);
                            console.log("City Official Status:", isCityOff);

                            setIsCityOfficial(isCityOff);
                            await AsyncStorage.setItem(
                                "isCityOfficial",
                                isCityOff.toString()
                            );
                            setIsAuthenticated(true);
                            return;
                        }
                    } catch (refreshError) {
                        console.error("Auth refresh error:", refreshError);

                        try {
                            const currentUser = await pb
                                .collection("users")
                                .getList(1, 1, {
                                    filter: `email = "${pb.authStore.record?.email}"`,
                                });

                            console.log("Current User List:", currentUser);

                            if (currentUser.items.length > 0) {
                                const userData = currentUser.items[0];
                                const isCityOff = Boolean(
                                    userData.cityOfficial
                                );
                                console.log("Found user data:", userData);
                                console.log(
                                    "Setting city official to:",
                                    isCityOff
                                );

                                setIsCityOfficial(isCityOff);
                                await AsyncStorage.setItem(
                                    "isCityOfficial",
                                    isCityOff.toString()
                                );
                                setIsAuthenticated(true);
                                return;
                            }
                        } catch (listError) {
                            console.error("User list error:", listError);
                        }
                    }
                }

                if (guest === "true") {
                    console.log("Setting up guest user");
                    setIsAuthenticated(true);
                    setIsCityOfficial(false);
                    await AsyncStorage.setItem("isCityOfficial", "false");
                } else if (!isValid && !guest) {
                    console.log("Not authenticated, redirecting...");
                    router.replace("/account/loginPage");
                }
            } catch (error) {
                console.error(
                    "Main authentication error:",
                    error instanceof Error ? error.message : String(error)
                );
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
        if (!isAuthenticated || isViewingSearchedLocation) return;

        let isMounted = true;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            if (!isViewingSearchedLocation) {
                setMapRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                fetchLocations(
                    location.coords.latitude,
                    location.coords.longitude,
                    0.1
                );
            }
        })();

        return () => {
            isMounted = false;
        };
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

    const handleSearch = async () => {
        if (!searchQuery) return;

        const isZipCode = /^\d{5}$/.test(searchQuery);

        try {
            setIsViewingSearchedLocation(true);

            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    searchQuery
                )}.json?access_token=${MAPBOX_API_KEY}&types=postcode`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const { center } = data.features[0];
                setIsViewingSearchedLocation(true);

                const newRegion = {
                    latitude: center[1],
                    longitude: center[0],
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };
                setMapRegion(newRegion);
                setIsViewingSearchedLocation(true);

                if (webViewRef.current) {
                    webViewRef.current.injectJavaScript(`
                      map.setView([${center[1]}, ${center[0]}], 13);
                  `);
                }

                fetchLocations(center[1], center[0], 0.1);
            } else {
                Alert.alert(
                    "Invalid Zip Code",
                    "Please enter a valid US zip code."
                );
            }
        } catch (error) {
            setIsViewingSearchedLocation(false);
            console.error("Search error:", error);
            Alert.alert(
                "Error",
                "An error occurred while searching. Please try again."
            );
        }
    };

    const returnToCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setIsViewingSearchedLocation(false);

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
            setMapRegion(newRegion);

            if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                map.setView([${location.coords.latitude}, ${location.coords.longitude}], 13);
            `);
            }

            fetchLocations(
                location.coords.latitude,
                location.coords.longitude,
                0.1
            );
        } catch (error) {
            console.error("Error returning to current location:", error);
            Alert.alert("Error", "Unable to get current location.");
        }
    };

    const getHtmlContent = () => {
        const mapCenter =
            isViewingSearchedLocation && mapRegion
                ? {
                      lat: mapRegion.latitude,
                      lng: mapRegion.longitude,
                  }
                : location
                ? {
                      lat: location.coords.latitude,
                      lng: location.coords.longitude,
                  }
                : { lat: 40.7128, lng: -74.006 };

        console.log("Map center:", mapCenter);

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
              const isCityOfficial = ${isCityOfficial === true};
              const mapCenter = ${JSON.stringify(mapCenter)};
              const parkingLots = ${JSON.stringify(safeParking)};
              
              // Initialize map with mapCenter
              const map = L.map('map').setView(
                [mapCenter.lat, mapCenter.lng],
                13
              );

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
              }).addTo(map);

              // Add marker for current/searched location
              L.marker([mapCenter.lat, mapCenter.lng])
                .addTo(map)
                .bindPopup(${
                    isViewingSearchedLocation
                        ? "'Searched Location'"
                        : "'Your Location'"
                });
                
                function updateCityRecommended(lotId, recommended) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'updateRecommended',
                        lotId: lotId,
                        recommended: recommended
                    }));
                }
                parkingLots.forEach(lot => {
                  if (lot.coordinates && lot.coordinates.length > 0) {
                    const polygonCoords = lot.coordinates.map(coord => [coord[1], coord[0]]);
                    
                    const polygon = L.polygon(polygonCoords, {
                        color: lot.city_recommended ? 'green' : 'red',
                        fillColor: lot.city_recommended ? '#0f3' : '#f03',
                        fillOpacity: 0.5
                    });
                    polygon._lotId = lot.id; // Add this line
                    polygon.addTo(map);

                L.marker([mapCenter.lat, mapCenter.lng])
                  .addTo(map)
                  .bindPopup(${
                      isViewingSearchedLocation
                          ? "'Searched Location'"
                          : "'Your Location'"
                  });

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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Enter ZIP Code"
                    value={searchQuery}
                    onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, "");
                        if (numericText.length <= 5) {
                            setSearchQuery(numericText);
                        }
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={returnToCurrentLocation}
            >
                <Text style={styles.currentLocationButtonText}>📍</Text>
            </TouchableOpacity>

            <WebView
                ref={webViewRef}
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
                            await updateParkingLotRecommendation(
                                data.lotId,
                                data.recommended
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
        flex: 1,
        height: 40,
        backgroundColor: "white",
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    map: {
        flex: 1,
    },
    searchButton: {
        backgroundColor: "#007AFF",
        height: 40,
        paddingHorizontal: 15,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    searchContainer: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        flexDirection: "row",
        zIndex: 1,
        gap: 10,
    },
    currentLocationButton: {
        position: "absolute",
        right: 10,
        bottom: 30,
        backgroundColor: "white",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    currentLocationButtonText: {
        fontSize: 24,
    },
});

export default streetMap;
