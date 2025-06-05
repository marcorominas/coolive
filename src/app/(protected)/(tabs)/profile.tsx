// src/app/(protected)/(tabs)/profile.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<{
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    points: number;
  } | null>(null);

  // 1. Redirigir si no està autenticat
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    // 2. Carregar dades del perfil + punts
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio, points')
        .eq('id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error llegint perfil:', error);
      } else if (data) {
        setProfileData(data as any);
      }
    })();
  }, [user, isAuthenticated]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 bg-beix-clar">
      {/* Header */}
      <View className="h-12 bg-gris-claro flex-row justify-between items-center px-4">
        <Text className="text-lg font-bold text-marron-fosc">COOLIVE</Text>
        <Pressable onPress={() => {/* Navigar a settings si en tens */}}>
          
        </Pressable>
      </View>

      {/* Contingut central */}
      <View className="flex-1 items-center pt-8">
        {/* Avatar */}
        {profileData?.avatar_url ? (
          <Image
            source={{ uri: profileData.avatar_url }}
            className="w-24 h-24 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-marron-fosc">Sense foto</Text>
          </View>
        )}

        {/* Nom i punts */}
        <Text className="mt-4 text-xl font-semibold text-marron-fosc">
          {profileData?.full_name || 'Usuari sense nom'}
        </Text>
        <Text className="mt-1 text-marron-fosc">
          Punts: {profileData?.points ?? 0}
        </Text>

        {/* Botó Editar Perfil */}
        <Pressable
          onPress={() => router.push('/profile-setup')}
          className="mt-6 w-3/4 bg-ocre py-3 rounded-lg items-center"
        >
          <Text className="text-blanc-pur font-medium">Editar Perfil</Text>
        </Pressable>

        {/* Botó Crear Grup */}
        <Pressable
          onPress={() => router.push('/create-group')}
          className="mt-4 w-3/4 bg-ocre py-3 rounded-lg flex-row justify-center items-center"
        >
          <Text className="text-blanc-pur font-medium mr-2">Crear Grup</Text>
          <Text className="text-blanc-pur text-lg">＋</Text>
        </Pressable>

        {/* Botó Codi Grup (Unir‐te) */}
        <Pressable
          onPress={() => router.push('/join')}
          className="mt-4 w-3/4 border-2 border-marron-fosc py-3 rounded-lg flex-row justify-between items-center px-4"
        >
          <Text className="text-marron-fosc font-medium">Codi Grup</Text>
          <Text className="text-marron-fosc text-lg">＋</Text>
        </Pressable>


        {/* Botó Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="w-full rounded-lg py-3 items-center border border-gray-300"
        >
          <Text className="text-marron-fosc font-medium">Sign Out</Text>
        </Pressable>

      </View>

      
        
     
    </View>
  );
}
