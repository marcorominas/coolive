// src/app/(protected)/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { Link } from 'expo-router';
import TaskListItem from '@/components/TaskListItem';
import Logo from '../../../../assets/LIVE.png'
import { useGroup } from '@/providers/GroupProvider';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentGroupId } = useGroup();
  
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error && data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#D9C6A7' }}>
        <ActivityIndicator size="large" color="#7A4A15" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#D9C6A7' }}>
      {/* ================= ENCABEZADO CON LOGO ================= */}
      <View className="flex-row items-center justify-center py-4">
        <Image source={Logo} className="w-12 h-12" />
        <Text className="text-2xl font-bold text-white ml-2">Colive</Text>
      </View>

      {/* ================= BOTÓN “+ Nova Tarea” ================= */}
      <View className="px-4">
        {currentGroupId ? (
          <Link href={`/new-task?groupId=${currentGroupId}`} asChild>
            <Pressable
              className="w-full rounded-full py-3 items-center"
              style={{ backgroundColor: '#C09F52' }}
            >
              <Text className="text-white font-semibold text-lg">+ Nova Tarea</Text>
            </Pressable>
          </Link>
        ) : (
          <Text>Primer has d'unir-te o crear un grup per poder crear tasques.</Text>
        )}
      </View>


      {/* ================= LLISTA DE TASQUES ================= */}
      {tasks.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center text-[#7A4A15] mt-8">
            Encara no hi ha cap tasca. Crea’n una nova!
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <View className="mb-4">
              <TaskListItem task={item}  />
            </View>
          )}
        />
      )}
    </View>
  );
}

// Si vols afegir alguna regla de StyleSheet “extra” per al TaskListItem, pots fer-ho aquí:
const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderLeftColor: '#C09F52',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
