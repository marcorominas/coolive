import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGroup } from "@/providers/GroupProvider";
import Button from "@/components/Button";

export default function EditTaskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentGroupId } = useGroup();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [groupId, setGroupId] = useState<string | undefined>(
    currentGroupId ?? undefined
  );
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("1");
  const [assignedUser, setAssignedUser] = useState<string>("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      setLoading(true);

      const { data: task, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (error || !task) {
        Alert.alert("Error", "No s'ha pogut carregar la tasca");
        setLoading(false);
        return;
      }

      setTitle(task.title);
      setPoints(String(task.points));
      setDueDate(task.due_date);
      setGroupId(task.group_id);
      setLoading(false);
    };

    fetchTask();
  }, [taskId]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;
      setLoadingMembers(true);

      const { data, error } = await supabase
        .from("group_members")
        .select("user_id, profiles(full_name)")
        .eq("group_id", groupId);

      if (!error && data) {
        const membersParsed =
          data?.map((item: any) => ({
            id: item.user_id,
            name: item.profiles?.full_name ?? "Sense nom",
          })) ?? [];
        setMembers(membersParsed);

        const { data: assigned } = await supabase
          .from("task_assignments")
          .select("user_id")
          .eq("task_id", taskId)
          .single();

        if (assigned) {
          setAssignedUser(assigned.user_id);
        } else if (membersParsed.length > 0) {
          setAssignedUser(membersParsed[0].id);
        }
      }
      setLoadingMembers(false);
    };

    fetchMembers();
  }, [groupId, taskId]);

  const handleUpdateTask = async () => {
    if (!taskId || !groupId || !title) {
      Alert.alert("Atenció", "Falten camps obligatoris");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        title: title.trim(),
        points: Number(points),
        due_date: dueDate,
      })
      .eq("id", taskId);

    if (error) {
      Alert.alert("Error", "No s'ha pogut actualitzar la tasca");
      return;
    }

    //  Actualitzar l'assignació (eliminem i tornem a inserir)
    await supabase.from("task_assignments").delete().eq("task_id", taskId);
    await supabase.from("task_assignments").insert({
      task_id: taskId,
      user_id: assignedUser,
      assigned_at: new Date().toISOString(),
    });

    Alert.alert("Fet!", "Tasca actualitzada correctament");
    router.replace("/taskscalendar");
  };

  const handleDeleteTask = async () => {
    Alert.alert("Eliminar Tasca", "Segur que vols eliminar aquesta tasca?", [
      { text: "Cancel·lar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await supabase
            .from("task_assignments")
            .delete()
            .eq("task_id", taskId);
          //  NO toquem completions → es manté l'històric per al pòdium
          await supabase.from("tasks").delete().eq("id", taskId);

          Alert.alert("Eliminada", "La tasca s'ha eliminat correctament");
          router.replace("/taskscalendar");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-beige justify-center items-center">
        <ActivityIndicator color="#D98C38" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-beige">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ padding: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-heading text-brown mb-5">
              Editar Tasca
            </Text>

            {/* Títol */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Títol
              </Text>
              <TextInput
                className="border border-orange bg-white rounded-xl p-3 text-brown"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Punts */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Punts
              </Text>
              <TextInput
                className="border border-orange bg-white rounded-xl p-3 w-24 text-brown"
                keyboardType="number-pad"
                value={points}
                onChangeText={setPoints}
              />
            </View>

            {/* Dia límit */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Dia límit
              </Text>
              <TextInput
                className="border border-orange bg-white rounded-xl p-3 w-40 text-brown"
                value={dueDate}
                onChangeText={setDueDate}
              />
              <Text className="text-xs text-brown opacity-70 mt-1">
                Format: AAAA-MM-DD
              </Text>
            </View>

            {/* Assignar usuari */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Assignar a
              </Text>
              {loadingMembers ? (
                <ActivityIndicator color="#D98C38" />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {members.map((u) => (
                    <Pressable
                      key={u.id}
                      onPress={() => setAssignedUser(u.id)}
                      className={`px-3 py-2 rounded-full border ${
                        assignedUser === u.id
                          ? "bg-orange border-orange"
                          : "bg-white border-orange"
                      }`}
                    >
                      <Text
                        className={`${
                          assignedUser === u.id
                            ? "text-white font-bold"
                            : "text-orange"
                        }`}
                      >
                        {u.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Button title="Guardar Canvis" onPress={handleUpdateTask} fullWidth />
            <Button
              title="Eliminar Tasca"
              onPress={handleDeleteTask}
              fullWidth
              variant="secondary"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
