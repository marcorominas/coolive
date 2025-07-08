import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import TaskListItem from '@/components/TaskListItem'; 
import type { Task, User, Completion } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  // 
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<{
      full_name: string;
      avatar_url: string | null;
      bio: string | null;
      points: number;
    } | null>(null);

  const [groupData, setGroupData] = useState<{
      name: string;
      id: string} | null>(null);
    const [loadingGroup, setLoadingGroup] = useState(true);

 
  const today = new Date().toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  
  const [tasksToday, setTasksToday] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)  
 
  // Carrega les tasques d'avui
  useEffect(() => {
    const fetchTasks = async () => {
      if (!groupData?.id) return;
      setLoadingTasks(true);

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupData.id);

      if (tasksError || !tasksData) {
        setTasksToday([]);
        setLoadingTasks(false);
        return;
      }

      const taskIds = tasksData.map((t: any) => t.id);
      if (!taskIds.length) {
        setTasksToday([]);
        setLoadingTasks(false);
        return;
      }

      const { data: assignmentsData } = await supabase
        .from('task_assignments')
        .select('task_id, user_id, profiles: user_id (id, full_name, avatar_url)')
        .in('task_id', taskIds);

      const { data: completionsData } = await supabase
        .from('completions')
        .select('task_id, user_id, completed_at')
        .in('task_id', taskIds);

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
          id: '',
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
        completed: !!(completionsMap[t.id]?.some(c => c.userId === user?.id)),
        assignedTo: assignmentsMap[t.id] ?? [],
        dueDate: t.due_date,
        frequency: t.frequency,
        completedBy: completionsMap[t.id] ?? [],
      }));

      const todayString = new Date().toLocaleDateString('ca-ES');
      const todayTasks = tasksList.filter(
        task => new Date(task.dueDate).toLocaleDateString('ca-ES') === todayString
      );

      setTasksToday(todayTasks);
      setLoadingTasks(false);
    };

    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupData]);




  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio, points')
        .eq('id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error llegint perfil:', error);
      } else if (data) {
        setProfileData(data as any);
      }
    })();
  }, [user, isAuthenticated]);


   // Carrega les dades del grup actual de l'usuari
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoadingGroup(true);
      try {
        const groupId = await AsyncStorage.getItem('currentGroupId');
        if (!groupId) {
          setGroupData(null);
          setLoadingGroup(false);
          return;
        }
        const { data, error } = await supabase
          .from('groups')
          .select('id, name')
          .eq('id', groupId)
          .single();
        if (error) {
          setGroupData(null);
          console.error('Error carregant el grup:', error);
        } else if (data) {
          setGroupData(data);
        }
      } catch (err) {
        setGroupData(null);
        console.error('Error inesperat carregant grup:', err);
      } finally {
        setLoadingGroup(false);
      }
    };
    if (isAuthenticated) fetchGroupData();
  }, [user, isAuthenticated]);

  return (
    <SafeAreaView className="flex-1 bg-beix-clar">
      {/* Header */}
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg text-marro-fosc font-semibold">{groupData?.name}</Text>
          <Text className="text-base text-ocre">{profileData?.full_name || 'Usuari sense nom'}</Text>
        </View>
        <View className="bg-ocre px-4 py-2 rounded-xl shadow">
          <Text className="text-blanc-pur font-bold text-base">{today}</Text>
        </View>
      </View>
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Punts i accés ràpid */}
        <View className="bg-blanc-pur rounded-2xl shadow mb-6 px-6 py-5 flex-row items-center justify-between">
          <View>
            <Text className="text-marro-fosc text-lg font-bold">Punts</Text>
            <Text className="text-3xl text-ocre font-extrabold">{profileData?.points ?? 0}</Text>
          </View>
          <View className="flex-row gap-2">
            <View className="bg-ocre px-4 py-2 rounded-lg">
              <Pressable onPress={() => router.push('/taskscalendar')}>  
                <Text className="text-blanc-pur font-semibold">Tasques</Text>
 
              </Pressable>
            </View>
            <View className="bg-ocre px-4 py-2 rounded-lg">
              <Pressable onPress={() => router.push('/podium')}>
                <Text className="text-blanc-pur font-semibold">Podium</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Nova secció: Tasques d’avui */}
        <View className="mb-4">
          <Text className="text-marro-fosc font-bold text-xl mb-2">Tasques d’avui</Text>
          {loadingTasks ? (
            <ActivityIndicator color="#D98C38" />
          ) : tasksToday.length === 0 ? (
            <Text className="text-gray-400 italic">No tens cap tasca avui </Text>
          ) : (
            <FlatList
              data={tasksToday}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View className="mb-2">
                  <TaskListItem task={item} />
                </View>
              )}
              scrollEnabled={false} // no fa scroll, només mostra la llista dins el ScrollView principal
            />
          )}
        </View>

        {/* Espai per a pròximes funcionalitats */}
        <View className="mt-2">
          <Text className="text-marro-fosc text-base">Benvingut/da a la teva app de convivència 🎉</Text>
          <Text className="text-gray-500 mt-1 text-sm">Aquí veuràs un resum de la convivència i accés ràpid a tot!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
