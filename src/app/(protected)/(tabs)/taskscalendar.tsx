import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, FlatList, SectionList, ActivityIndicator } from 'react-native';
import TaskListItem from '@/components/TaskListItem';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useGroup } from '@/providers/GroupProvider';
import { useAuth } from '@/providers/AuthProvider';
import type { Task, User, Completion } from '@/types';

const weekDays = [
  'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'
];

function groupTasksByDay(tasks: Task[]) {
  return weekDays.map(day => ({
    title: day,
    data: tasks.filter(task =>
      new Date(task.dueDate).toLocaleDateString('ca-ES', { weekday: 'long' }) === day.toLowerCase()
    ),
  })).filter(section => section.data.length > 0);
}

export default function TaskCalendar() {
  const router = useRouter();
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId?: string }>();
  const { currentGroupId } = useGroup();
  const { user } = useAuth();

  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (groupIdParam) setGroupId(groupIdParam);
    else if (currentGroupId) setGroupId(currentGroupId);
    else setGroupId(undefined);
  }, [groupIdParam, currentGroupId]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'week'>('today');

  // FETCH amb assignats i completions!
  const fetchTasks = async () => {
    if (!groupId) return;

    setLoading(true);

    // 1. Tasques del grup
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId);

    if (tasksError || !tasksData) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // 2. Assignacions
    const taskIds = tasksData.map((t: any) => t.id);
    if (!taskIds.length) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const { data: assignmentsData } = await supabase
      .from('task_assignments')
      .select('task_id, user_id, profiles: user_id (id, full_name, avatar_url)')
      .in('task_id', taskIds);

    // 3. Completions
    const { data: completionsData } = await supabase
      .from('completions')
      .select('task_id, user_id, completed_at')
      .in('task_id', taskIds);

    // Diccionaris per creuar dades
    const assignmentsMap: { [taskId: string]: User[] } = {};
    (assignmentsData ?? []).forEach((row: any) => {
      if (!assignmentsMap[row.task_id]) assignmentsMap[row.task_id] = [];
      assignmentsMap[row.task_id].push({
        id: row.profiles?.id,
        name: row.profiles?.full_name ?? '',
        image: row.profiles?.avatar_url ?? '',
      });
    });

    const completionsMap: { [taskId: string]: Completion[] } = {};
    (completionsData ?? []).forEach((row: any) => {
      if (!completionsMap[row.task_id]) completionsMap[row.task_id] = [];
      completionsMap[row.task_id].push({
        id: '', // O pots usar `${row.task_id}-${row.user_id}` com a id fake
        taskId: row.task_id,
        userId: row.user_id,
        completedAt: row.completed_at,
      });
    });

    const tasksList: Task[] = tasksData.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      createdAt: t.created_at,
      groupId: t.group_id,
      points: t.points,
      completed: !!(completionsMap[t.id]?.length), // hi ha completions per la tasca
      assignedTo: assignmentsMap[t.id] ?? [],
      dueDate: t.due_date,
      frequency: t.frequency,
      completedBy: completionsMap[t.id] ?? [],
    }));

    setTasks(tasksList);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [groupId]);

  // Handler per marcar/desmarcar com a feta per l'usuari logat
  const handleToggleComplete = async (task: Task) => {
    if (!user?.id) return;
    const jaCompletada = (task.completedBy ?? []).some(c => c.userId === user.id);

    if (!jaCompletada) {
      await supabase.from('completions').insert({
        task_id: task.id,
        user_id: user.id,
        completed_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('completions')
        .delete()
        .eq('task_id', task.id)
        .eq('user_id', user.id);
    }
    fetchTasks();
  };

  // Filtrar per avui
  const todayString = new Date().toLocaleDateString('ca-ES');
  const todayTasks = tasks.filter(
    task =>
      new Date(task.dueDate).toLocaleDateString('ca-ES') === todayString
  );
  // Filtrar i agrupar per dia per a setmana
  const weekSections = groupTasksByDay(tasks);

  // Si no hi ha grup, mostra missatge
  if (!groupId) {
    return (
      <SafeAreaView className="flex-1 bg-beix-clar justify-center items-center">
        <Text className="text-xl text-marro-fosc text-center mb-6">
          No s'ha trobat cap grup actiu.
        </Text>
        <Pressable
          className="bg-ocre px-4 py-2 rounded-xl shadow"
          onPress={() => router.replace('/profile')}
        >
          <Text className="text-blanc-pur font-semibold">Tornar al Perfil</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-beix-clar">
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <Text className="text-xl text-marro-fosc font-bold">Tasques</Text>
        <Pressable
          className="bg-ocre px-4 py-2 rounded-xl shadow active:bg-ocre/80"
          onPress={() => router.push(`/new-task?groupId=${groupId}`)}
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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#D98C38" size="large" />
        </View>
      ) : view === 'today' ? (
        <FlatList
          data={todayTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TaskListItem task={item} onToggleComplete={handleToggleComplete} userId={user?.id} />}
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
              <TaskListItem task={item} onToggleComplete={handleToggleComplete} userId={user?.id} />
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
