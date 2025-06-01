import React, { useState, useEffect } from 'react';
import { FlatList, View, Pressable, Text } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
//import { DUMMY_TASKS } from '@/dummyData';
//import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase'; // Adjust the import path as necessary
import { Task } from '@/types'; // Adjust the import path as necessary
import { Link, useRouter } from 'expo-router'; // This allows navigation between screens

export default function HomeScreen() {
  

  const router = useRouter(); // This allows navigation between screens
 
  const [tasks, setTasks] = useState<Task[]>([]);

  




  useEffect(() => {
    const fetchTasks = async () => {
      // Simulate fetching tasks from a database
      const {data, error} = await supabase
        .from('tasks').select('*');
      if (error) {
        console.error('Error fetching tasks:', error);
      }
      setTasks(data as Task[]);
    };

    fetchTasks();
  }, [])

  console.log(JSON.stringify(tasks, null, 2)); 
  // This will log the tasks to the console for debugging
  // and can be removed later


  return (

    <View>
      <View>
        <Link href="/create-group" asChild>
          <Pressable>
            <Text>
              Crear Grupo
            </Text>
          </Pressable>
        </Link>
      </View>
    
    
      <FlatList
        data={tasks}
        renderItem={({ item }) => <TaskListItem task={item} />}
        ListHeaderComponent={() => (
          <Link href="/new" >
            New Task
          </Link>
        )}
      />
    </View>
        
  );
}
