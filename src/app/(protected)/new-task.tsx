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
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGroup } from "@/providers/GroupProvider";
import Button from "@/components/Button";

export default function NewTaskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groupId: groupIdParam } =
    useLocalSearchParams<{ groupId?: string }>();
  const { currentGroupId } = useGroup();

  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("1");
  const [assignedUser, setAssignedUser] = useState<string>("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (groupIdParam) setGroupId(groupIdParam);
    else if (currentGroupId) setGroupId(currentGroupId);
    else setGroupId(undefined);
  }, [groupIdParam, currentGroupId]);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      if (!groupId) {
        setMembers([]);
        setLoadingMembers(false);
        return;
      }
      const { data, error } = await supabase
        .from("group_members")
        .select("user_id, profiles(full_name, avatar_url)")
        .eq("group_id", groupId);

      if (error) {
        console.error(error);
        setMembers([]);
      } else {
        const membersParsed =
          data?.map((item: any) => ({
            id: item.user_id,
            name: item.profiles?.full_name ?? "Sense nom",
          })) ?? [];
        setMembers(membersParsed);
        if (membersParsed.length > 0) setAssignedUser(membersParsed[0].id);
      }
      setLoadingMembers(false);
    };

    fetchMembers();
  }, [groupId]);

  const onSubmit = async () => {
    if (!title  || !points || !assignedUser || !groupId || !user?.id) {
      alert("Falten dades per crear la tasca!");
      return;
    }

    const { data: newTask, error: errorTask } = await supabase
      .from("tasks")
      .insert({
        title: title.trim(),
        group_id: groupId,
        created_by: user.id,
        points: Number(points),
        completed: false,
        due_date: dueDate,
      })
      .select()
      .maybeSingle();

    if (errorTask || !newTask) {
      alert("Error creant tasca! " + (errorTask?.message ?? ""));
      return;
    }

    const { error: errorAssign } = await supabase
      .from("task_assignments")
      .insert({
        task_id: newTask.id,
        user_id: assignedUser,
        assigned_at: new Date().toISOString(),
      });

    if (errorAssign) {
      alert("Error assignant tasca! " + errorAssign.message);
      return;
    }

    router.replace("/taskscalendar");
  };

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
              Nova Tasca
            </Text>

            {/* Títol */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Títol
              </Text>
              <TextInput
                className="border border-orange bg-white rounded-xl p-3 text-brown"
                placeholder="Ex: Escombrar menjador"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>

            {/* Punts */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Punts
              </Text>
              <TextInput
                className="border border-orange bg-white rounded-xl p-3 w-24 text-brown"
                placeholder="1"
                keyboardType="number-pad"
                value={points}
                onChangeText={setPoints}
                maxLength={2}
              />
            </View>

            {/* Dia límit */}
            <View className="mb-4">
              <Text className="text-base font-heading mb-1 text-brown">
                Dia límit
              </Text>
              <TextInput
                className="border border-orange bg-white rounded-xl p-3 w-40 text-brown"
                placeholder="2025-07-22"
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numbers-and-punctuation"
              />
              <Text className="text-xs text-brown opacity-70 mt-1">
                Format: AAAA-MM-DD
              </Text>
            </View>

            {/* Assignació d’usuari */}
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
                  {members.length === 0 && (
                    <Text className="text-brown opacity-50 italic">
                      No hi ha membres al grup!
                    </Text>
                  )}
                </View>
              )}
            </View>

            <Button title="Crear Tasca" onPress={onSubmit} fullWidth />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
