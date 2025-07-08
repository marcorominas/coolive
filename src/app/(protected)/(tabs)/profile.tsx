import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGroup } from '@/providers/GroupProvider';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const { currentGroupId, setCurrentGroupId } = useGroup();
  const router = useRouter();

  const [profileData, setProfileData] = useState<{
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    points: number;
  } | null>(null);

  const [groupData, setGroupData] = useState<{ name: string; id: string } | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  // Avatar per defecte
  const defaultAvatarUrl = `https://api.dicebear.com/8.x/lorelei/png?seed=${user?.id || 'random'}`;

  // Carregar dades del perfil
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
      if (data) setProfileData(data as any);
    })();
  }, [user, isAuthenticated]);

  // Carregar dades del grup
  useEffect(() => {
    if (!currentGroupId) {
      setGroupData(null);
      return;
    }
    setLoadingGroup(true);
    (async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .eq('id', currentGroupId)
        .single();
      if (data) setGroupData(data);
      else setGroupData(null);
      setLoadingGroup(false);
    })();
  }, [currentGroupId]);

  // Funció per sortir del grup
  const handleLeaveGroup = async () => {
    if (!currentGroupId) return;
    Alert.alert(
      'Segur que vols sortir del grup?',
      'Aquesta acció et treurà del grup i hauràs de crear-ne o unir-te a un altre per continuar.',
      [
        { text: 'Cancel·la', style: 'cancel' },
        {
          text: 'Sortir',
          style: 'destructive',
          onPress: async () => {
            setLeavingGroup(true);
            // Esborra de group_members a Supabase
            const { error } = await supabase
              .from('group_members')
              .delete()
              .eq('group_id', currentGroupId)
              .eq('user_id', user!.id);

            if (error) {
              Alert.alert('Error sortint del grup', error.message);
              setLeavingGroup(false);
              return;
            }

            // Esborra l'ID de grup del context i AsyncStorage
            setCurrentGroupId('');
            await AsyncStorage.removeItem('currentGroupId');
            setGroupData(null);
            setLeavingGroup(false);
            Alert.alert('Has sortit del grup!');
          },
        },
      ]
    );
  };

  // Funció per sortir de la sessió
  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('currentGroupId');
    setCurrentGroupId('');
    // Esborra l'usuari de l'AuthProvider
    setSigningOut(false);
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-beix-clar">
      {/* Header */}
      <View className="h-12 bg-gris-claro flex-row justify-between items-center px-4">
        <Text className="text-lg font-bold text-marron-fosc">COOLIVE</Text>
      </View>

      <View className="flex-1 items-center pt-8">
        {/* Avatar */}
        <View className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
          <Image
            source={{ uri: profileData?.avatar_url || defaultAvatarUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        {/* Nom, punts i bio */}
        <Text className="mt-4 text-xl font-semibold text-marron-fosc">
          {profileData?.full_name || 'Usuari sense nom'}
        </Text>
        <Text className="mt-1 text-marron-fosc">
          Punts: {profileData?.points ?? 0}
        </Text>
        <Text className="mt-1 text-marron-fosc">
          {profileData?.bio || 'Sense biografia'}
        </Text>

        {/* Info grup */}
        <View className="mt-6 items-center">
          {loadingGroup ? (
            <ActivityIndicator size="small" color="#A08C7A" />
          ) : currentGroupId && groupData ? (
            <>
              <Text className="text-marron-fosc font-bold mb-1">Grup actual:</Text>
              <Text className="text-marron-fosc">Nom: {groupData.name}</Text>
              <Text className="text-marron-fosc">Codi: {groupData.id}</Text>
              <Pressable
                onPress={handleLeaveGroup}
                className="mt-4 w-36 rounded-lg py-2 items-center bg-red-500"
                disabled={leavingGroup}
              >
                <Text className="text-blanc-pur font-medium">
                  {leavingGroup ? 'Sortint...' : 'Sortir del grup'}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text className="text-marron-fosc">
              No estàs en cap grup. Crea un grup o uneix-te a un!
            </Text>
          )}
        </View>

        {/* Botó editar perfil */}
        <Pressable
          onPress={() => router.push('/profile-setup')}
          className="mt-6 w-3/4 bg-ocre py-3 rounded-lg items-center"
        >
          <Text className="text-blanc-pur font-medium">Editar Perfil</Text>
        </Pressable>

        {/* Botó crear grup: només si NO està a cap grup */}
        {!currentGroupId && (
          <Pressable
            onPress={() => router.push('/create-group')}
            className="mt-4 w-3/4 bg-ocre py-3 rounded-lg flex-row justify-center items-center"
          >
            <Text className="text-blanc-pur font-medium mr-2">Crear Grup</Text>
            <Text className="text-blanc-pur text-lg">＋</Text>
          </Pressable>
        )}

        {/* Botó unir-se a grup: només si NO està a cap grup */}
        {!currentGroupId && (
          <Pressable
            onPress={() => router.push('/join')}
            className="mt-4 w-3/4 border-2 border-marron-fosc py-3 rounded-lg flex-row justify-between items-center px-4"
          >
            <Text className="text-marron-fosc font-medium">Codi Grup</Text>
            <Text className="text-marron-fosc text-lg">＋</Text>
          </Pressable>
        )}

        {/* Botó logout */}
        <Pressable
          onPress={handleSignOut}
          className="mt-4 w-2/6 rounded-lg py-3 items-center bg-marro-fosc"
          disabled={signingOut}
        >
          <Text className="text-marron-fosc font-medium">
            {signingOut ? 'Surt...' : 'Sign Out'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
