
'use client';

import React from 'react';
import { FlatList, View, Pressable, Text } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
import { DUMMY_TASKS } from '@/dummyData';
//import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
      <View className="flex-1 bg-gray-100">
      <Link href="/signup" asChild>
        <Pressable className="p-4 bg-orange-100 rounded-lg mb-2">
          <Text className="text-orange-500 text-3xl font-bold text-center">
            Login
          </Text>
        </Pressable>
      </Link>

      <FlatList
        data={DUMMY_TASKS}
        renderItem={({ item }) => <TaskListItem task={item} />}
      />
    </View>
        
  );
}
