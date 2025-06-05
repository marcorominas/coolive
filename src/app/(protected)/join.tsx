// src/app/(protected)/(tabs)/join.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function JoinGroupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const [joinId, setJoinId] = useState(params.groupId || '');
  const [loadingJoin, setLoadingJoin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleJoinGroup = async () => {
    if (!joinId.trim()) {
      Alert.alert('Introdueix un codi de grup vàlid.');
      return;
    }
    try {
      setLoadingJoin(true);
      // 1. Comprovar que el grup existeix
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', joinId.trim())
        .single();

      if (groupError || !group) {
        Alert.alert('Aquest grup no existeix.');
        setLoadingJoin(false);
        return;
      }

      // 2. Comprovar si l’usuari ja és membre (per evitar duplicats)
      const { data: existing, error: existError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', joinId.trim())
        .eq('user_id', user!.id)
        .single();

      if (existError && existError.code !== 'PGRST116') {
        console.error('Error comprovant pertinença:', existError);
        Alert.alert('Error comprovant si ja ets membre.');
        setLoadingJoin(false);
        return;
      }

      if (existing) {
        Alert.alert('Ja ets membre d’aquest grup.');
        setLoadingJoin(false);
        return;
      }

      // 3. Inserir registre a 'group_members'
      const { error: memberError } = await supabase.from('group_members').insert({
        group_id: joinId.trim(),
        user_id: user!.id,
      });

      if (memberError) {
        console.error('Error unint‐te al grup:', memberError);
        Alert.alert('No s’ha pogut unir‐te al grup.');
      } else {
        Alert.alert('✅ T’has unit al grup correctament!');
        router.replace('/'); // o a la pantalla que vulguis
      }
    } catch (err) {
      console.error('Error inesperat al unir‐te al grup:', err);
      Alert.alert('Error inesperat.');
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <View className="flex-1 bg-beix-clar p-4">
      <View className="flex-row items-center justify-center py-4 bg-ocre rounded-lg">
        <Text className="text-xl font-bold text-blanc-pur">Unir‐me a un Grup</Text>
      </View>

      <View className="mt-6 space-y-4">
        <View>
          <Text className="text-sm font-medium text-marron-fosc mb-1">Codi del Grup</Text>
          <TextInput
            value={joinId}
            onChangeText={setJoinId}
            placeholder="Ex: 4832d2b8-68f2-40f0-bc8b-ebff71d91ae9"
            placeholderTextColor="#A08C7A"
            autoCapitalize="none"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-marron-fosc"
          />
        </View>
        <Pressable
          onPress={handleJoinGroup}
          className={`w-full rounded-lg py-3 items-center ${
            loadingJoin ? 'bg-gray-400' : 'bg-marron-fosc'
          }`}
          disabled={loadingJoin}
        >
          <Text className="text-blanc-pur font-semibold">
            {loadingJoin ? 'Procesant...' : 'Unir‐me'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
