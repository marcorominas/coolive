// src/app/(protected)/(tabs)/profile.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Link, useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ------------------------------------------------------
  // Si l’usuari no està autenticat, redirigim a login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // ------------------------------------------------------
  // Estat local per a mostrar el perfil (nom, username, avatar, etc.)
  const [profileData, setProfileData] = useState<{
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Estat local per al groupId manual
  const [joinId, setJoinId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Obtenir dades del perfil
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error obtenint perfil:', error);
      } else if (data) {
        setProfileData({
          full_name: data.full_name,
          username: data.username,
          avatar_url: data.avatar_url,
        });
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user, isAuthenticated, router]);

  // ------------------------------------------------------
  // Funció per tancar sessió
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Funció per unir-se al grup amb el joinId
  const handleManualJoin = () => {
    if (!joinId.trim()) {
      Alert.alert('Si us plau, enganxa un groupId vàlid.');
      return;
    }
    router.push(`/join?groupId=${joinId.trim()}`);
  };

  return (
    // 1) KeyboardAvoidingView se encarga de empujar la vista hacia arriba cuando aparece el teclado
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#D9C6A7' }}
      behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 30, android: 40 })}
    >
      {/* 2) ScrollView para que, si el contenido es más alto que la pantalla (cuando el teclado está abierto), puedas desplazarte */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >

        <View className="flex-1 bg-[#D9C6A7]">
          {/* ================= ENCABEZADO ================= */}
          <View className="flex-row items-center justify-center py-6 bg-[#C09F52]">
            <Text className="text-2xl font-bold text-white">El Meu Perfil</Text>
          </View>

          {loadingProfile ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-[#7A4A15]">Carregant dades...</Text>
            </View>
          ) : (
            <View className="p-6 space-y-6">
              {/* Avatar + Nom + Username */}
              <View className="items-center space-y-2">
                <View className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden">
                  {profileData?.avatar_url ? (
                    <Image
                      source={{ uri: profileData.avatar_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-[#7A4A15] text-center py-10">Sense foto</Text>
                  )}
                </View>
                <Text className="text-xl font-semibold text-[#7A4A15]">
                  {profileData?.full_name ?? 'Usuari Sense Nom'}
                </Text>
                <Text className="text-[#7A4A15]">
                  @{profileData?.username ?? 'username'}
                </Text>
              </View>

              {/* Botons d’accions */}
                <View className="space-y-4">
                  <Pressable
                    onPress={() => router.push('/profile-setup')}
                    className="w-full rounded-lg py-3 items-center"
                    style={{ backgroundColor: '#C09F52' }}
                  >
                    <Text className="text-white font-semibold">Editar Perfil</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/create-group')}
                    className="w-full rounded-lg py-3 items-center"
                    style={{ backgroundColor: '#7A4A15' }}
                  >
                    <Text className="text-white font-semibold">Crear Grup</Text>
                  </Pressable>
                </View>

                {/* ================= INPUT PER UNIR-SE AMB GROUPID ================= */}
                <View className="mt-6 space-y-2">
                  <Text className="text-sm font-medium text-[#7A4A15]">Codi del grup</Text>
                  <TextInput
                    value={joinId}
                    onChangeText={setJoinId}
                    placeholder="Ex: 4832d2b8-68f2-40f0-bc8b-ebff71d91ae9"
                    placeholderTextColor="#7A4A15"
                    autoCapitalize="none"
                    className="border border-[#7A4A15] rounded px-3 py-2 bg-white text-[#7A4A15]"
                  />
                  <Pressable
                    onPress={handleManualJoin}
                    className="w-full rounded-lg py-3 items-center"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <Text className="text-white font-semibold">Unir-me al Grup</Text>
                  </Pressable>
                </View>
              {/* ================= BOTÓ TANCAR SESSIÓ ================= */}
                <View className="mt-8">
                  <Pressable
                    onPress={handleSignOut}
                    className="w-full rounded-lg py-3 items-center"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#7A4A15',
                      borderWidth: 1,
                    }}
                  >
                    <Text className="text-[#7A4A15] font-semibold">Tancar Sessió</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}