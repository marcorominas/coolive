import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import Button from '@/components/Button';

export default function HomeScreen() {
  return (
    <View className='flex-1 p-4'>
      <Text className='text-3xl font-bold text-orange-500'>Create a task</Text>
      <Button />
      <StatusBar style="auto" />

    </View>
  );
}


