// src/app/(protected)/(tabs)/create-group.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, Share } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateGroupScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [groupName, setGroupName] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Escriu un nom per al grup.');
      return;
    }
    try {
      setLoading(true);
      // 1. Insertar a la taula 'groups'
      const { data, error: createError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          created_by: user!.id,
        })
        .select('id')
        .single();

      if (createError || !data) {
        console.error('Error creant grup:', createError);
        Alert.alert('Error creant el grup.');
        setLoading(false);
        return;
      }

      const newGroupId = data.id;

      // 2. Inserir a 'group_members' per afegir l’usuari com a membre inicial
      await supabase.from('group_members').insert({
        group_id: newGroupId,
        user_id: user!.id,
      });

      // 3. Guardar l’ID del grup a AsyncStorage (si vols recordar‐lo localment)
      await AsyncStorage.setItem('currentGroupId', newGroupId);

      // 4. Construir deep link d’invitació
      const link = `my-coolive://join?groupId=${newGroupId}`;
      setInviteLink(link);

      // 5. Redirigir (opcional) a una altra pantalla (p.e. llista de tasques)
      //router.replace(`/new-task?groupId=${newGroupId}`);

    } catch (err) {
      console.error('Error inesperat crear grup:', err);
      Alert.alert('Error inesperat crear grup.');
    } finally {
      setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `Uneix‐te al meu grup a Colive! Pulsa aquí: ${inviteLink}`,
      });
    } catch (error) {
      console.error('Error compartint enllaç:', error);
    }
  };

  return (
    <View className="flex-1 bg-beix-clar p-4">
      <Text className="text-2xl font-bold text-marron-fosc">Crear Nou Grup</Text>

      <TextInput
        placeholder="Nom del grup"
        placeholderTextColor="#A08C7A"
        value={groupName}
        onChangeText={setGroupName}
        className="mt-4 border border-gray-300 rounded px-3 py-2 bg-white text-marron-fosc"
      />

      <Pressable
        onPress={createGroup}
        disabled={loading}
        className={`mt-4 rounded px-4 py-2 items-center ${loading ? 'bg-gray-400' : 'bg-ocre'}`}
      >
        <Text className="text-blanc-pur font-bold">
          {loading ? 'Procesant...' : 'Crear Grup'}
        </Text>
      </Pressable>

      {/* Ometre creació de grup */}
      <Pressable
        onPress={() => router.replace('/')}
        className="mt-2 items-center"
      >
        <Text className="text-marron-fosc">Omitir creació de grup</Text>
      </Pressable>

      {inviteLink && (
        <View className="mt-6">
          <Text className="mb-2 text-marron-fosc">Link d’invitació:</Text>
          <Text className="text-blue-600">{inviteLink}</Text>
          <Pressable
            onPress={shareInvite}
            className="mt-4 bg-green-600 rounded px-4 py-2 items-center"
          >
            <Text className="text-blanc-pur font-bold">Compartir Link</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
