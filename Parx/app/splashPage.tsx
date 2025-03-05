import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Splash(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/loginPage');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PARX</Text>
      <Text style={styles.points}>Real-time parking at reasonable prices</Text>
      <Text style={styles.points}>Accountless reservations</Text>
      <Text style={styles.points}>City recommended parking spots</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 18,
    textAlign: "left",
  }
});
