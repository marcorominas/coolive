import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import TaskListItem from "@/components/TaskListItem";
import type { Task, User } from "@/types";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<{
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    points: number;
  } | null>(null);

  const [groupData, setGroupData] = useState<{ name: string; id: string } | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  const today = new Date().toLocaleDateString("ca-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const [tasksToday, setTasksToday] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [topThree, setTopThree] = useState<
    { id: string; name: string; points: number; image: string | null }[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<
    { id: string; userName: string; taskTitle: string; completedAt: string; image: string | null }[]
  >([]);

  // Carrega el perfil
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, points")
        .eq("id", user!.id)
        .single();
      if (!error && data) setProfileData(data as any);
    })();
  }, [user, isAuthenticated]);

  // Carrega el grup actual
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoadingGroup(true);
      try {
        const groupId = await AsyncStorage.getItem("currentGroupId");
        if (!groupId) {
          setGroupData(null);
          setLoadingGroup(false);
          return;
        }
        const { data, error } = await supabase
          .from("groups")
          .select("id, name")
          .eq("id", groupId)
          .single();
        if (!error && data) setGroupData(data);
      } catch {
        setGroupData(null);
      } finally {
        setLoadingGroup(false);
      }
    };
    if (isAuthenticated) fetchGroupData();
  }, [user, isAuthenticated]);

  // Carrega tasques, pòdium i historial
  useEffect(() => {
    const fetchData = async () => {
      if (!groupData?.id) return;

      // Tasques d'avui
      setLoadingTasks(true);
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("group_id", groupData.id);

      const todayString = new Date().toLocaleDateString("ca-ES");
      const taskIds = tasksData?.map((t: any) => t.id) ?? [];

      const { data: completionsData } = await supabase
        .from("completions")
        .select("task_id, user_id");

      const completedTaskIds = new Set(
        completionsData?.map((c) => c.task_id) ?? []
      );

      const todayTasks = (tasksData ?? [])
        .filter(
          (t: any) =>
            t.due_date &&
            new Date(t.due_date).toLocaleDateString("ca-ES") === todayString &&
            !completedTaskIds.has(t.id)
        )
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          created_at: t.created_at,
          created_by: t.created_by,
          group_id: t.group_id,
          points: t.points,
          completed: false,
          due_date: t.due_date,
        }));

      setTasksToday(todayTasks as Task[]);
      setLoadingTasks(false);

      // Top 3 Pòdium
      const { data: rankingData } = await supabase
        .from("group_members")
        .select("user_id, profiles(full_name, avatar_url, points)")
        .eq("group_id", groupData.id);

      const rankingParsed =
        rankingData
          ?.map((r: any) => ({
            id: r.user_id,
            name: r.profiles?.full_name ?? "Sense nom",
            points: r.profiles?.points ?? 0,
            image: r.profiles?.avatar_url,
          }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 3) ?? [];

      setTopThree(rankingParsed);

      // Historial últimes 3 tasques
      const { data: historyData } = await supabase
        .from("completions")
        .select("id, completed_at, profiles(full_name, avatar_url), tasks(title)")
        .eq("tasks.group_id", groupData.id)
        .order("completed_at", { ascending: false })
        .limit(3);

      const parsedHistory =
        historyData?.map((h: any) => ({
          id: h.id,
          userName: h.profiles?.full_name ?? "Sense nom",
          image: h.profiles?.avatar_url ?? null,
          taskTitle: h.tasks?.title ?? "Tasca",
          completedAt: new Date(h.completed_at).toLocaleDateString("ca-ES", {
            day: "numeric",
            month: "short",
          }),
        })) ?? [];

      setRecentActivity(parsedHistory);
    };

    fetchData();
  }, [groupData]);

  return (
    <SafeAreaView className="flex-1 bg-beige">
      {/* Header */}
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xl text-brown font-heading font-bold">
            {groupData?.name || "Sense grup"}
          </Text>
          <Text className="text-base text-orange">
            {profileData?.full_name || "Usuari"}
          </Text>
        </View>
        <View className="bg-orange px-4 py-2 rounded-xl shadow">
          <Text className="text-white font-bold text-base">{today}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Punts i accés ràpid */}
        <View className="bg-white rounded-2xl shadow mb-6 px-6 py-5 flex-row items-center justify-between">
          <View>
            <Text className="text-brown text-lg font-bold">Punts</Text>
            <Text className="text-3xl text-orange font-extrabold">
              {profileData?.points ?? 0} ⭐
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => router.push("/taskscalendar")}
              className="bg-orange px-4 py-2 rounded-lg mr-2"
            >
              <Text className="text-white font-semibold">Tasques</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/podium")}
              className="bg-orange px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Pòdium</Text>
            </Pressable>
          </View>
        </View>

        {/* Tasques d’avui */}
        <View className="mb-6">
          <Text className="text-brown font-heading font-bold text-xl mb-2">
            Tasques d’avui
          </Text>
          {loadingTasks ? (
            <ActivityIndicator color="#D98C38" />
          ) : tasksToday.length === 0 ? (
            <Text className="text-gray-400 italic">
              No tens cap tasca avui 🎉
            </Text>
          ) : (
            <FlatList
              data={tasksToday}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mb-2">
                  <TaskListItem
                    task={item}
                    onToggleComplete={() => router.push("/taskscalendar")}
                  />
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Top 3 Pòdium */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-brown font-heading font-bold text-xl">
              Top 3
            </Text>
            <Pressable onPress={() => router.push("/podium")}>
              <Text className="text-orange font-semibold text-sm">
                Veure més
              </Text>
            </Pressable>
          </View>
          {topThree.length === 0 ? (
            <Text className="text-gray-400 italic">
              Encara no hi ha puntuacions.
            </Text>
          ) : (
            <View className="flex-row justify-start gap-6">
              {topThree.map((user, idx) => (
                <View key={user.id} className="items-center">
                  <Image
                    source={{
                      uri:
                        user.image ??
                        `https://api.dicebear.com/7.x/identicon/png?seed=${user.id}`,
                    }}
                    className="w-14 h-14 rounded-full mb-1 border border-orange"
                  />
                  <Text className="text-brown text-xs font-semibold">
                    {idx + 1}r {user.points} pts
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Últimes activitats */}
        <View className="mb-4">
          <Text className="text-brown font-heading font-bold text-xl mb-2">
            Últimes activitats
          </Text>
          {recentActivity.length === 0 ? (
            <Text className="text-gray-400 italic">
              Encara no hi ha activitats recents.
            </Text>
          ) : (
            recentActivity.map((a) => (
              <View
                key={a.id}
                className="flex-row items-center bg-white rounded-xl p-3 mb-2 shadow"
              >
                <Image
                  source={{
                    uri:
                      a.image ??
                      `https://api.dicebear.com/7.x/identicon/png?seed=${a.userName}`,
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-brown text-sm font-semibold">
                    {a.userName}
                  </Text>
                  <Text className="text-brown opacity-70 text-xs">
                    {a.taskTitle}
                  </Text>
                </View>
                <Text className="text-brown opacity-50 text-xs">
                  {a.completedAt}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
