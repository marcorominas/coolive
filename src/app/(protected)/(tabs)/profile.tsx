import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
 
  const [profileData, setProfileData] = useState<{
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    points: number;
  } | null>(null);

  // Si no té avatar_url, genera un per defecte amb el seu id!
  const defaultAvatarUrl = `https://api.dicebear.com/8.x/lorelei/png?seed=${user?.id || 'random'}`;

  const [groupData, setGroupData] = useState<{
    name: string;
    id: string} | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);


  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
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


   // Carrega les dades del grup actual de l'usuari
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoadingGroup(true);
      try {
        const groupId = await AsyncStorage.getItem('currentGroupId');
        if (!groupId) {
          setGroupData(null);
          setLoadingGroup(false);
          return;
        }
        const { data, error } = await supabase
          .from('groups')
          .select('id, name')
          .eq('id', groupId)
          .single();
        if (error) {
          setGroupData(null);
          console.error('Error carregant el grup:', error);
        } else if (data) {
          setGroupData(data);
        }
      } catch (err) {
        setGroupData(null);
        console.error('Error inesperat carregant grup:', err);
      } finally {
        setLoadingGroup(false);
      }
    };
    if (isAuthenticated) fetchGroupData();
  }, [user, isAuthenticated]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);
    if (error) {
      Alert.alert('Error sign out', error.message);
      return;
    }
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-beix-clar">
      {/* Header */}
      <View className="h-12 bg-gris-claro flex-row justify-between items-center px-4">
        <Text className="text-lg font-bold text-marron-fosc">COOLIVE</Text>
        <Pressable onPress={() => {}}>
        </Pressable>
      </View>

      {/* Contingut central */}
      <View className="flex-1 items-center pt-8">
        {/* Avatar */}
        <View className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
          <Image
            source={{ uri: profileData?.avatar_url || defaultAvatarUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Nom bio i punts */}
        <Text className="mt-4 text-xl font-semibold text-marron-fosc">
          {profileData?.full_name || 'Usuari sense nom'}
        </Text>
        <Text className="mt-1 text-marron-fosc">
          Punts: {profileData?.points ?? 0}
        </Text>
        <Text className="mt-1 text-marron-fosc">
          {profileData?.bio || 'Sense biografia'}
        </Text>
        {/* Mostra el grup actual */}
        <View className="mt-6 items-center">
          {loadingGroup ? (
            <Text className="text-marron-fosc">Carregant grup...</Text>
          ) : groupData ? (
            <>
              <Text className="text-marron-fosc font-bold">Grup actual:</Text>
              <Text className="text-marron-fosc">Nom: {groupData.name}</Text>
              <Text className="text-marron-fosc">ID: {groupData.id}</Text>
            </>
          ) : (
            <Text className="text-marron-fosc">No estàs en cap grup.</Text>
          )}
        </View>

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
          className="mt-4 w-2/6 rounded-lg py-3 items-center bg-marro-fosc"
          disabled={signingOut}
        >
          <Text className="text-blanc-pur font-medium">
            {signingOut ? 'Surt...' : 'Sign Out'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
