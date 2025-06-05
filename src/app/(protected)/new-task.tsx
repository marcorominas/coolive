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

const frequencyOptions = [
  { key: 'once', label: 'Un cop' },
  { key: 'daily', label: 'Diari' },
  { key: 'weekly', label: 'Setmanal' },
  { key: 'monthly', label: 'Mensual' },
];

export default function NewTaskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('1');
  const [frequency, setFrequency] = useState('once');
  const [assignedUser, setAssignedUser] = useState<string>('');
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Carrega membres del grup
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, users(name)')
        .eq('group_id', groupId);

      if (error) {
        console.error(error);
        setMembers([]);
      } else {
        // Si 'users' és una relació, pots agafar el nom així:
        const membersParsed = data?.map((item: any) => ({
          id: item.user_id,
          name: item.users?.name ?? 'Sense nom',
        })) ?? [];
        setMembers(membersParsed);
        // Assigna el primer per defecte
        if (membersParsed.length > 0) setAssignedUser(membersParsed[0].id);
      }
      setLoadingMembers(false);
    };

    if (groupId) fetchMembers();
  }, [groupId]);

  // Handler de creació
  const onSubmit = async () => {
    if (!title || !description || !points || !assignedUser) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description.trim(),
        group_id: groupId,
        created_by: user!.id,
        points: Number(points),
        completed: false,
        due_date: new Date().toISOString(),
        frequency,
        assigned_to: assignedUser, // FK a users.id
      });

    if (error) {
      alert('Error creant tasca! ' + error.message);
      return;
    }

    router.replace('/');
  };

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
            {/* <View className="mb-4">
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
            </View> */}
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
