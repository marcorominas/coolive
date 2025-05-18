import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';


export default function HomeScreen() {
  return (
    <View >
      <Text className='text-3xl font-bold text-orange-500'>Feed</Text>

      <StatusBar style="auto" />

    </View>
  );
}


