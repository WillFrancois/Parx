import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ResultsPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Check if params are defined
  if (!route.params || !route.params.results) {
    return (
      <View style={styles.container}>
        <Text>No results to display.</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const { results } = route.params;
  const parsedResults = JSON.parse(results);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
      <FlatList
        data={parsedResults}
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
  header: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
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

export default ResultsPage;