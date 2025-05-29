import React from 'react';
import { FlatList, View, Pressable, Text } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
import { DUMMY_TASKS } from '@/dummyData';
//import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    
      <FlatList
        data={DUMMY_TASKS}
        renderItem={({ item }) => <TaskListItem task={item} />}
        ListHeaderComponent={() => (
          <Link href="/new" >
            New Task
          </Link>
        )}
      />
        
  );
}
