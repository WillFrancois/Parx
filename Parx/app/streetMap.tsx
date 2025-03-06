import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, PermissionsAndroid } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Location.LocationRegion | undefined>();


  useEffect(() => {
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

      // For continuous location updates (optional):
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

      return () => locationSubscription.remove(); // Clean up subscription on unmount
    })();
  }, []);



  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      {mapRegion && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          showsUserLocation={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;