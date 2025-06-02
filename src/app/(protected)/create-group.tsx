// CreateGroupScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, Share } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function CreateGroupScreen() {
  const { user } = useAuth();
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
      .single(); // para obtener solo el row insertado con su ID

    if (error) {
      console.error('Error al crear grupo:', error);
      Alert.alert('Error al crear el grupo.');
      return;
    }

    // 2. Construir link de invitación (ejemplo: usando esquema deep link de Expo Router)
    //    Aquí asumo que tu app web/React Native está alojada en 'https://tu-app.app'
    const newGroupId = data.id;
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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Crear Nuevo Grupo</Text>

      <TextInput
        placeholder="Nombre del grupo"
        value={groupName}
        onChangeText={setGroupName}
        style={{
          marginVertical: 16,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
        }}
      />

      <Pressable
        onPress={createGroup}
        style={{
          backgroundColor: '#2563EB',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Crear Grupo</Text>
      </Pressable>

      {inviteLink && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ marginBottom: 8 }}>Link de invitación:</Text>
          <Text style={{ color: 'blue' }}>{inviteLink}</Text>
          <Pressable
            onPress={shareInvite}
            style={{
              backgroundColor: '#10B981',
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Compartir Link</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
