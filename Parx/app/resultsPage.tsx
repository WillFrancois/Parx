import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';


type ResultsScreenRouteParams = {
  results: Array<{
    place_name: string;
    text: string;
  }>;
};


type ResultsScreenProps = {
  route: RouteProp<{ ResultsScreen: ResultsScreenRouteParams }, 'ResultsScreen'>;
};

const ResultsScreen: React.FC = () => {

  const route = useRoute<ResultsScreenProps['route']>();
  const { results } = route.params;

  console.log('Results:', results); 

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