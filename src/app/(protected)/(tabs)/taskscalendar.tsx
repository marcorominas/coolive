import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, FlatList, SectionList } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
import { useRouter } from 'expo-router';
import type { Task } from '@/types';

const weekDays = [
  'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'
];

function groupTasksByDay(tasks: Task[]) {
  // Mock: agrupa per dia de la setmana (pots millorar amb date-fns o similar)
  const sections = weekDays.map(day => ({
    title: day,
    data: tasks.filter(task =>
      new Date(task.dueDate).toLocaleDateString('ca-ES', { weekday: 'long' }) === day.toLowerCase()
    ),
  })).filter(section => section.data.length > 0);
  return sections;
}

export default function TaskCalendar() {
  const router = useRouter();

  // Mock data (pots fer fetch a Supabase aquí en comptes d'aquest array)
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Treure la brossa',
      description: '',
      createdAt: new Date().toISOString(),
      groupId: 'g1',
      points: 2,
      completed: false,
      assignedTo: [
        { id: 'u1', username: 'marina123', name: 'Marina', image: 'https://i.pravatar.cc/150?img=1' }
      ],
      dueDate: new Date().toISOString(),
      frequency: 'once',
      completedBy: []
    },
    {
      id: '2',
      title: 'Netejar cuina',
      description: '',
      createdAt: new Date().toISOString(),
      groupId: 'g1',
      points: 3,
      completed: true,
      assignedTo: [
        { id: 'u2', username: 'albert', name: 'Albert', image: 'https://i.pravatar.cc/150?img=2' }
      ],
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      frequency: 'weekly',
      completedBy: []
    },
    // ... més tasques
  ];

  // Toggle state
  const [view, setView] = useState<'today' | 'week'>('today');

  // Filtrar per avui
  const todayString = new Date().toLocaleDateString('ca-ES');
  const todayTasks = tasks.filter(
    task =>
      new Date(task.dueDate).toLocaleDateString('ca-ES') === todayString
  );

  // Filtrar i agrupar per dia per a setmana
  const weekSections = groupTasksByDay(tasks);

  return (
    <SafeAreaView className="flex-1 bg-beix-clar">
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <Text className="text-xl text-marro-fosc font-bold">Tasques</Text>
        <Pressable
          className="bg-ocre px-4 py-2 rounded-xl shadow active:bg-ocre/80"
          onPress={() => router.push('/new-task')} 
        >
          <Text className="text-blanc-pur font-semibold">+ Nova Tasca</Text>
        </Pressable>
      </View>

      {/* Toggle */}
      <View className="flex-row justify-center items-center mb-2">
        <Pressable
          className={`px-4 py-2 rounded-full mx-1 ${view === 'today' ? 'bg-ocre' : 'bg-blanc-pur border border-ocre'}`}
          onPress={() => setView('today')}
        >
          <Text className={`${view === 'today' ? 'text-blanc-pur font-semibold' : 'text-ocre'}`}>Avui</Text>
        </Pressable>
        <Pressable
          className={`px-4 py-2 rounded-full mx-1 ${view === 'week' ? 'bg-ocre' : 'bg-blanc-pur border border-ocre'}`}
          onPress={() => setView('week')}
        >
          <Text className={`${view === 'week' ? 'text-blanc-pur font-semibold' : 'text-ocre'}`}>Setmana</Text>
        </Pressable>
      </View>

      {/* Render segons el toggle */}
      {view === 'today' ? (
        <FlatList
          data={todayTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TaskListItem task={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">No hi ha tasques per avui 🎉</Text>
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      ) : (
        <SectionList
          sections={weekSections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="text-marro-fosc bg-beix-clar px-6 py-1 font-bold text-lg">{title}</Text>
          )}
          renderItem={({ item }) => (
            <View className="px-4">
              <TaskListItem task={item} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">Setmana tranquil·la 😎</Text>
          }
          SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      )}
    </SafeAreaView>
  );
}
