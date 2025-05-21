import React from 'react';
import { View, FlatList, Text } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
import { DUMMY_TASKS } from '@/dummyData';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={DUMMY_TASKS}
        //keyExtractor={t => t.id}
        renderItem={({ item }) => <TaskListItem task={item} />}
        //contentContainerStyle={{ padding: 16 }}
        //ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        /*ListEmptyComponent={() => (
          <Text className="text-center mt-8 text-gray-500">
            No chores yet—tap “+” to add one!
          </Text>
        )}*/
      />
      <StatusBar style="auto" />
    </View>
  );
}
