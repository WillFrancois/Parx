import { useEffect, useState } from "react";
import { Text, View, Button, Alert } from "react-native";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pb } from "@/config";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = pb.authStore.isValid;
      const guest = await AsyncStorage.getItem("guest");
      if (!isValid && !guest) {
        router.replace("./account/loginPage");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
      if (!isAuthenticated) return;
  
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000 },
        (newLocation) => {
          setLocation(newLocation);
          setMapRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      );

      return () => locationSubscription.remove();
    })();
  }, [isAuthenticated]);

  const fetchLocations = async (latitude: number, longitude: number, radius: number) => {
    try {
      const list = await pb.collection('parking_lots').getFullList();
      const polygonsData = list.map((item: any) => {
        const coordinates = item.geo_data.geometry.coordinates[0][0].map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        return coordinates;
      });

      setPolygons(polygonsData);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Alert.alert('Error', 'Failed to fetch locations. Please check your network and try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_API_KEY}`
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
          pathname: '/resultsPage',
          params: { results: JSON.stringify(data.features) },
        });


      } else {
        Alert.alert('No results found', 'Please try a different search term.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while searching. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return <Text>Checking authentication...</Text>
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 24, marginBottom: 20  }}>Welcome to Parx!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}