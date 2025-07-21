import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { useGroup } from '@/providers/GroupProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/Button';

export default function JoinGroupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { setCurrentGroupId } = useGroup();

  const [joinCode, setJoinCode] = useState('');
  const [loadingJoin, setLoadingJoin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Introdueix un codi de grup vàlid.');
      return;
    }

    try {
      setLoadingJoin(true);

      // Buscar coincidència comparant els primers 6 caràcters de l'ID
      const { data: groups } = await supabase
        .from('groups')
        .select('id');

      const group = groups?.find(g =>
        g.id.replace(/-/g, '').slice(0, 6) === joinCode.trim()
      );

      if (!group) {
        Alert.alert('Aquest grup no existeix.');
        return;
      }

      const groupId = group.id;

      // Comprovar si l’usuari ja és membre
      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existing) {
        Alert.alert('Ja ets membre d’aquest grup.');
        return;
      }

      // Inserir l’usuari al grup
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: user!.id });

      if (memberError) throw memberError;

      await AsyncStorage.setItem('currentGroupId', groupId);
      setCurrentGroupId(groupId);

      Alert.alert('✅ T’has unit al grup correctament!');
      router.replace('/profile');
    } catch (err) {
      console.error('Error unint-te al grup:', err);
      Alert.alert('Error inesperat en unir-te al grup.');
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <View className="flex-1 bg-beige p-4">
      <Text className="text-2xl font-heading font-bold text-brown">Unir-me a un Grup</Text>
      <View className="mt-6">
        <Text className="text-sm font-sans text-brown mb-1">Codi del Grup</Text>
        <TextInput
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="Ex: 4a8b5d"
          placeholderTextColor="#A08C7A"
          autoCapitalize="none"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-brown font-sans"
        />
      </View>
      <View className="mt-6">
        <Button
          title={loadingJoin ? 'Processant...' : 'Unir-me'}
          onPress={handleJoinGroup}
          isLoading={loadingJoin}
        />
      </View>
    </View>
  );
}
