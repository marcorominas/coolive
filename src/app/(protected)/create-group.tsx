// CreateGroupScreen.tsx

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

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Debes escribir un nombre para el grupo.');
      return;
    }
    // 1. Insertar en la tabla 'groups'
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: groupName.trim(),
        created_by: user!.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error al crear grupo:', error);
      Alert.alert('Error al crear el grupo.');
      return;
    }

    const newGroupId = data.id;

    await supabase.from('group_members').insert({
    group_id: newGroupId,
    user_id: user!.id,
});

// Guardar el ID del grupo actual en AsyncStorage    
    await AsyncStorage.setItem('currentGroupId', newGroupId);

    router.replace(`/new-task?groupId=${newGroupId}`);
  

    // 2. Construir link de invitación (usando esquema deep link)
    const link = `my-coolive://join?groupId=${newGroupId}`;
    setInviteLink(link);
  };

  const shareInvite = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `¡Únete a mi grupo en Colive! Pulsa aquí: ${inviteLink}`,
      });
    } catch (error) {
      console.error('Error al compartir link:', error);
    }
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold">Crear Nuevo Grupo</Text>

      <TextInput
        placeholder="Nombre del grupo"
        value={groupName}
        onChangeText={setGroupName}
        className="mt-4 border border-gray-300 rounded px-3 py-2"
      />

      <Pressable
        onPress={createGroup}
        className="mt-4 bg-blue-600 rounded px-4 py-2 items-center"
      >
        <Text className="text-white font-bold">Crear Grupo</Text>
      </Pressable>

      {/* Botón para saltar sin crear */}
      <Pressable
        onPress={() => router.replace('/')}
        className="mt-2 items-center"
      >
        <Text className="text-gray-500">Omitir creación de grupo</Text>
      </Pressable>

      {inviteLink && (
        <View className="mt-6">
          <Text className="mb-2">Link de invitación:</Text>
          <Text className="text-blue-600">{inviteLink}</Text>
          <Pressable
            onPress={shareInvite}
            className="mt-4 bg-green-600 rounded px-4 py-2 items-center"
          >
            <Text className="text-white font-bold">Compartir Link</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
