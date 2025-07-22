import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGroup } from '@/providers/GroupProvider';
import * as Clipboard from 'expo-clipboard';
import Button from '@/components/Button';

export default function CreateGroupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { setCurrentGroupId } = useGroup();

  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Escriu un nom per al grup.');
      return;
    }

    try {
      setLoading(true);

      // Comprovar si l'usuari ja forma part d'algun grup
        const { data: existingMembership } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (existingMembership) {
          Alert.alert('Ja formes part d\'un grup.');
          setLoading(false);
          return;
        }

        // Comprovar si ja existeix un grup amb aquest nom
        const { data: existingGroup } = await supabase
          .from('groups')
          .select('id')
          .eq('name', groupName.trim())
        .maybeSingle();

      if (existingGroup) {
        Alert.alert('Ja existeix un grup amb aquest nom. Tria’n un altre.');
        return;
      }

      // Crear el nou grup
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          created_by: user!.id
        })
        .select('id')
        .single();

      if (error || !data) throw error;

      const newGroupId = data.id;

      // Afegir l’usuari com a membre inicial
      await supabase.from('group_members').insert({
        group_id: newGroupId,
        user_id: user!.id,
      });

      await AsyncStorage.setItem('currentGroupId', newGroupId);
      setCurrentGroupId(newGroupId);

      // Generar un codi curt de 6 caràcters
      const shortCode = newGroupId.replace(/-/g, '').slice(0, 6);
      setInviteCode(shortCode);

      Alert.alert('✅ Grup creat!', 'Comparteix el codi amb els teus companys.');
    } catch (err) {
      console.error('Error creant grup:', err);
      Alert.alert('Error creant el grup.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('Codi copiat!', `El codi és: ${inviteCode}`);
    }
  };

  return (
    <View className="flex-1 bg-beige p-4">
      <Text className="text-2xl font-heading font-bold text-brown">Crear Nou Grup</Text>

      {!inviteCode ? (
        <>
          <TextInput
            placeholder="Nom del grup"
            placeholderTextColor="#A08C7A"
            value={groupName}
            onChangeText={setGroupName}
            className="mt-4 border border-gray-300 rounded px-3 py-2 bg-white text-brown font-sans"
          />
          <Button
            title={loading ? 'Processant...' : 'Crear Grup'}
            onPress={createGroup}
            isLoading={loading}
          />
        </>
      ) : (
        <View className="mt-6 items-center">
          <Text className="text-brown mb-2">Comparteix aquest codi:</Text>
          <Text className="text-orange text-lg font-bold mb-4">{inviteCode}</Text>
          <Button title="Copiar codi" onPress={copyToClipboard} />
          <View className="mt-4">
            <Button title="Continuar al perfil" onPress={() => router.replace('/profile')} />
          </View>
        </View>
      )}
    </View>
  );
}
