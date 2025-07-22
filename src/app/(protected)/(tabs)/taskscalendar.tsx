import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  SectionList,
  Pressable,
} from "react-native";
import TaskListItem from "@/components/TaskListItem";
import Button from "@/components/Button";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useGroup } from "@/providers/GroupProvider";
import { useAuth } from "@/providers/AuthProvider";
import type { Task } from "@/types";

const weekDays = [
  "dilluns",
  "dimarts",
  "dimecres",
  "dijous",
  "divendres",
  "dissabte",
  "diumenge",
];

function getWeekDates(offset: number) {
  const currentDate = new Date();
  const currentDay = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
  const monday = new Date(currentDate);
  monday.setDate(monday.getDate() - currentDay + 1 + offset * 7);

  const weekDates: { date: Date; dayName: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push({
      date: d,
      dayName: d
        .toLocaleDateString("ca-ES", { weekday: "long" })
        .toLowerCase(),
    });
  }
  return weekDates;
}

function groupTasksByDay(tasks: Task[], weekOffset: number) {
  const weekDates = getWeekDates(weekOffset);

  return weekDates
    .map(({ dayName, date }) => ({
      title: `${dayName} (${date.getDate()}/${date.getMonth() + 1})`,
      data: tasks.filter(
        (task) =>
          new Date(task.due_date || "")
            .toLocaleDateString("ca-ES", { weekday: "long" })
            .toLowerCase() === dayName
      ),
    }))
    .filter((section) => section.data.length > 0);
}

export default function TaskCalendar() {
  const router = useRouter();
  const { groupId: groupIdParam } =
    useLocalSearchParams<{ groupId?: string }>();
  const { currentGroupId } = useGroup();
  const { user } = useAuth();

  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"today" | "week">("today");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (groupIdParam) setGroupId(groupIdParam);
    else if (currentGroupId) setGroupId(currentGroupId);
    else setGroupId(undefined);
  }, [groupIdParam, currentGroupId]);

  const fetchTasks = async () => {
    if (!groupId) return;
    setLoading(true);

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("group_id", groupId);

    if (tasksError || !tasksData) {
      console.error("Error carregant tasques:", tasksError);
      setTasks([]);
      setLoading(false);
      return;
    }

    const taskIds = tasksData.map((t) => t.id);

    const { data: assignmentsData } = await supabase
      .from("task_assignments")
      .select("task_id, user_id, profiles(id, full_name, avatar_url)")
      .in("task_id", taskIds);

    const assignmentsMap: { [taskId: string]: Task["assignedTo"] } = {};
    (assignmentsData ?? []).forEach((row: any) => {
      (assignmentsMap[row.task_id] ??= []).push({
        id: row.user_id,
        full_name: row.profiles?.full_name ?? "",
        avatar_url: row.profiles?.avatar_url ?? null,
      });
    });

    const { data: completionsData } = await supabase
      .from("completions")
      .select("task_id, user_id")
      .in("task_id", taskIds);

    const completedTaskIds = new Set(
      (completionsData ?? []).map((c) => c.task_id)
    );

    const tasksList: Task[] = tasksData
      .map((t) => ({
        ...t,
        assignedTo: assignmentsMap[t.id] ?? [],
        completed: completedTaskIds.has(t.id),
      }))
      .filter((t) => !t.completed);

    setTasks(tasksList);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [groupId]);

  const handleToggleComplete = async (task: Task) => {
    if (!user?.id) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();
    const puntsActuals = profile?.points ?? 0;

    await supabase.from("completions").insert({
      task_id: task.id,
      user_id: user.id,
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("profiles")
      .update({ points: puntsActuals + task.points })
      .eq("id", user.id);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: true } : t
      )
    );
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }, 1000);
  };

  const todayString = new Date().toLocaleDateString("ca-ES");
  const todayTasks = tasks.filter(
    (task) =>
      new Date(task.due_date || "").toLocaleDateString("ca-ES") === todayString
  );
  const weekSections = groupTasksByDay(tasks, weekOffset);

  if (!groupId) {
    return (
      <SafeAreaView className="flex-1 bg-beige justify-center items-center">
        <Text className="text-xl text-brown font-heading text-center mb-6">
          No s'ha trobat cap grup actiu.
        </Text>
        <Button
          title="Tornar al Perfil"
          onPress={() => router.replace("/profile")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-beige">
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <Text className="text-xl text-brown font-heading font-bold">
          Tasques
        </Text>
        <Button
          title="+ Nova Tasca"
          onPress={() => router.push(`/new-task?groupId=${groupId}`)}
          variant="primary"
        />
      </View>

      <View className="flex-row justify-center mb-2">
        <Button
          title="Avui"
          onPress={() => setView("today")}
          variant={view === "today" ? "primary" : "secondary"}
        />
        <Button
          title="Setmana"
          onPress={() => setView("week")}
          variant={view === "week" ? "primary" : "secondary"}
        />
      </View>

      {view === "week" && (
        <View className="flex-row justify-between px-6 mb-2 items-center">
          <Pressable onPress={() => setWeekOffset((prev) => prev - 1)}>
            <Text className="text-orange font-bold text-lg">{"<"}</Text>
          </Pressable>
          <Text className="text-brown font-heading font-bold">
            {weekOffset === 0
              ? "Aquesta setmana"
              : weekOffset > 0
              ? `+${weekOffset} setm.`
              : `${weekOffset} setm.`}
          </Text>
          <Pressable onPress={() => setWeekOffset((prev) => prev + 1)}>
            <Text className="text-orange font-bold text-lg">{">"}</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#D98C38" size="large" />
        </View>
      ) : view === "today" ? (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskListItem
              task={item}
              onToggleComplete={handleToggleComplete}
              userId={user?.id}
            />
          )}
          ListEmptyComponent={() => (
            <Text className="text-brown opacity-70 text-center mt-6">
              No tens cap tasca per avui! 🎉
            </Text>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        />
      ) : (
        <SectionList
          sections={weekSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="text-brown bg-beige px-6 py-1 font-heading font-bold text-lg">
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <View className="px-4">
              <TaskListItem
                task={item}
                onToggleComplete={handleToggleComplete}
                userId={user?.id}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <Text className="text-brown opacity-70 text-center mt-6">
              No hi ha tasques programades en aquesta setmana!
            </Text>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}
