import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGroup } from '@/providers/GroupProvider';

const frequencyOptions = [
  { key: 'once', label: 'Un cop' },
  { key: 'daily', label: 'Diari' },
  { key: 'weekly', label: 'Setmanal' },
  { key: 'monthly', label: 'Mensual' },
];

export default function NewTaskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId?: string }>();
  const { currentGroupId } = useGroup();

  const [groupId, setGroupId] = useState<string | undefined>(undefined);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('1');
  const [frequency, setFrequency] = useState('once');
  const [assignedUser, setAssignedUser] = useState<string>('');
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0,10)); // Format YYYY-MM-DD
  
  
  // Actualitza groupId quan canvii el param o el context!
  useEffect(() => {
    if (groupIdParam) setGroupId(groupIdParam);
    else if (currentGroupId) setGroupId(currentGroupId);
    else setGroupId(undefined);
  }, [groupIdParam, currentGroupId]);

  // Carrega membres del grup (només si tenim groupId!)
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      if (!groupId) {
        setMembers([]);
        setLoadingMembers(false);
        return;
      }
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, profiles(full_name, avatar_url)')
        .eq('group_id', groupId);

      if (error) {
        console.error(error);
        setMembers([]);
      } else {
        const membersParsed = data?.map((item: any) => ({
          id: item.user_id,
          name: item.profiles?.full_name ?? 'Sense nom',
        })) ?? [];
        setMembers(membersParsed);
        if (membersParsed.length > 0) setAssignedUser(membersParsed[0].id);
      }
      setLoadingMembers(false);
    };

    fetchMembers();
  }, [groupId]);



  // Handler de creació de la tasca
  const onSubmit = async () => {
    console.log('DEBUG SUBMIT', {
      title,
      description,
      points,
      assignedUser,
      groupId,
      userId: user?.id,
      frequency,
    });
    // Validació reforçada
    if (!title || !description || !points || !assignedUser || !groupId || !user?.id) {
      alert('Falten dades per crear la tasca!');
      return;
    }

    // 1. Crear la tasca
    const { data: newTask, error: errorTask } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description.trim(),
        group_id: groupId,
        created_by: user.id,
        points: Number(points),
        completed: false,
        due_date: dueDate,
        frequency,
      })
      .select()
      .single();

      console.log('DEBUG TASCA CREADA:', newTask);
      console.log('DEBUG ASSIGNED USER (UUID):', assignedUser);

    if (errorTask || !newTask) {
      alert('Error creant tasca! ' + (errorTask?.message ?? ''));
      return;
    }

    // 2. Crear la relació amb l'usuari assignat
    const { error: errorAssign } = await supabase
      .from('task_assignments')
      .insert({
        task_id: newTask.id,
        user_id: assignedUser,
        assigned_at: new Date().toISOString(),
      });

      console.log('DEBUG TASCA CREADA:', newTask);
    

    if (errorAssign) {
      alert('Error assignant tasca! ' + (errorAssign.message));
      return;
    }

    router.replace('/taskscalendar');
  };

  // Si no hi ha grup, mostra avís i redirigeix
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ padding: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-bold text-marro-fosc mb-5">
              Nova Tasca
            </Text>
            {/* Títol */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-1 text-marro-fosc">
                Títol
              </Text>
              <TextInput
                className="border border-ocre bg-blanc-pur rounded-xl p-3 text-marro-fosc"
                placeholder="Ex: Escombrar menjador"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>
            {/* Descripció */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-1 text-marro-fosc">
                Descripció
              </Text>
              <TextInput
                className="border border-ocre bg-blanc-pur rounded-xl p-3 h-20 text-marro-fosc"
                placeholder="Detalla què cal fer..."
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={120}
              />
            </View>
            {/* Punts */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-1 text-marro-fosc">
                Punts
              </Text>
              <TextInput
                className="border border-ocre bg-blanc-pur rounded-xl p-3 w-24 text-marro-fosc"
                placeholder="1"
                keyboardType="number-pad"
                value={points}
                onChangeText={setPoints}
                maxLength={2}
              />
            </View>
            {/* Dia límit */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-1 text-marro-fosc">
                Dia límit
              </Text>
              <TextInput
                className="border border-ocre bg-blanc-pur rounded-xl p-3 w-40 text-marro-fosc"
                placeholder="2024-07-04"
                value={dueDate}
                onChangeText={setDueDate}
              />
              <Text className="text-xs text-gray-500">Format: AAAA-MM-DD</Text>
            </View>

            {/* Freqüència */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-1 text-marro-fosc">
                Freqüència
              </Text>
              <View className="flex-row gap-2">
                {frequencyOptions.map(option => (
                  <Pressable
                    key={option.key}
                    onPress={() => setFrequency(option.key)}
                    className={`px-3 py-2 rounded-full border ${
                      frequency === option.key
                        ? 'bg-ocre border-ocre'
                        : 'bg-blanc-pur border-ocre'
                    }`}
                  >
                    <Text
                      className={
                        frequency === option.key
                          ? 'text-blanc-pur font-semibold'
                          : 'text-ocre'
                      }
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {/* Assignació d’usuari */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-1 text-marro-fosc">
                Assignar a
              </Text>
              {loadingMembers ? (
                <ActivityIndicator color="#D98C38" />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {members.map(u => (
                    <Pressable
                      key={u.id}
                      onPress={() => setAssignedUser(u.id)}
                      className={`px-3 py-2 rounded-full border ${
                        assignedUser === u.id
                          ? 'bg-ocre border-ocre'
                          : 'bg-blanc-pur border-ocre'
                      }`}
                    >
                      <Text
                        className={
                          assignedUser === u.id
                            ? 'text-blanc-pur font-semibold'
                            : 'text-ocre'
                        }
                      >
                        {u.name}
                      </Text>
                    </Pressable>
                  ))}
                  {members.length === 0 && (
                    <Text className="text-gray-400 italic">
                      No hi ha membres al grup!
                    </Text>
                  )}
                </View>
              )}
            </View>
            {/* Botó crear */}
            <Pressable
              onPress={onSubmit}
              className="bg-ocre rounded-xl py-3 items-center mt-8 shadow"
            >
              <Text className="text-blanc-pur font-semibold text-lg">
                Crear Tasca
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
