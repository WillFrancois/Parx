import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Text, Alert } from 'react-native';
import MapView, { PROVIDER_DEFAULT, UrlTile, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase from 'pocketbase';


const pb = new PocketBase('http://localhost:8090'); 
const MAPBOX_API_KEY = 'pk.eyJ1Ijoic2VhbmRlZXJheSIsImEiOiJjbTgxMzBqeTcweWd6MmlwdWgzaDBmd2Z0In0.BvER_lMJy1JwbxA127OHTQ'; 

const MapScreen: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const guest = await AsyncStorage.getItem("guest");
      if (!token && !guest) {
        router.replace("/");
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
      const list = await pb.collection('parking_lots').getList(1, 100, {
        filter: `latitude > ${latitude - radius} && latitude < ${latitude + radius} && longitude > ${longitude - radius} && longitude < ${longitude + radius}`,
        sort: '-created',
      });
      setLocations(list.items || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
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
      } else {
        Alert.alert('No results found', 'Please try a different search term.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while searching. Please try again.');
    }
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
      {mapRegion && (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={mapRegion}
          showsUserLocation={true}
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {locations.map((loc, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
