import React from 'react';
import { FlatList, View } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
import { DUMMY_TASKS } from '@/dummyData';
//import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
      <View className="flex-1 bg-gray-100">

        <Link 
          href='/login' 
          className='text-orange-500 p-4 text-center text-3xl font-bold'>
          Login
        </Link>
        
        <FlatList
          data={DUMMY_TASKS} //}
          renderItem={({ item }) => <TaskListItem task={item}/>}
         />

        
      </View>  
        
  );
}
