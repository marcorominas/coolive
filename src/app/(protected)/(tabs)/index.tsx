// app/index.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { Link, useRouter } from 'expo-router';
import TaskListItem from '@/components/TaskListItem';

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [joinId, setJoinId] = useState<string>('');

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error && data) setTasks(data as Task[]);
    };
    fetchTasks();
  }, []);

  const handleManualJoin = () => {
    if (!joinId.trim()) {
      Alert.alert('Debes pegar un groupId válido.');
      return;
    }
    router.push(`/join?groupId=${joinId.trim()}`);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Botón para crear grupo */}
      <Link href="/create-group" asChild>
        <Pressable style={{ marginBottom: 16, padding: 8, backgroundColor: '#2563EB' }}>
          <Text style={{ color: '#fff' }}>Crear Grupo</Text>
        </Pressable>
      </Link>

      {/* Campo para pegar un groupId */}
      <Text>Pega aquí el groupId para unirte:</Text>
      <TextInput
        value={joinId}
        onChangeText={setJoinId}
        placeholder="Ej: 4832d2b8-68f2-40f0-bc8b-ebff71d91ae9"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginTop: 8,
          marginBottom: 8,
        }}
      />
      <Pressable onPress={handleManualJoin} style={{ padding: 8, backgroundColor: '#10B981' }}>
        <Text style={{ color: '#fff' }}>Unirme al Grupo</Text>
      </Pressable>

      {/* Lista de tareas */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskListItem task={item} />}
        ListHeaderComponent={() => (
          <Link href="/new" asChild>
            <Pressable style={{ marginVertical: 12, padding: 8, backgroundColor: '#eee' }}>
              <Text>New Task</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
