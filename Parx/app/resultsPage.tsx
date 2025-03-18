import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

// Define the type for the route parameters
type ResultsScreenRouteParams = {
  results: Array<{
    place_name: string;
    text: string;
  }>;
};

// Define the type for the component props
type ResultsScreenProps = {
  route: RouteProp<{ ResultsScreen: ResultsScreenRouteParams }, 'ResultsScreen'>;
};

const ResultsScreen: React.FC = () => {
  // Use the useRoute hook to access the route object
  const route = useRoute<ResultsScreenProps['route']>();
  const { results } = route.params;

  console.log('Results:', results); // Debugging line to check data

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.place_name}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResultsScreen;