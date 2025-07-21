import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, Pressable, FlatList } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGroup } from '@/providers/GroupProvider';
import * as Clipboard from 'expo-clipboard';
import Button from '@/components/Button';
import { Feather } from '@expo/vector-icons';

function getRandomAvatar(userId?: string) {
  const seed = userId || Math.random().toString(36).slice(2);
  return `https://api.dicebear.com/6.x/avataaars/png?seed=${seed}`;
}

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

  const [groupData, setGroupData] = useState<{ name: string; id: string; short_code?: string } | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  // Llista i comptadors
  const [pendingTasks, setPendingTasks] = useState<number>(0);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [membersList, setMembersList] = useState<{ id: string; full_name: string | null; avatar_url: string | null }[]>([]);

  // Carrega dades del perfil de l'usuari
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio, points')
        .eq('id', user!.id)
        .single();
      setProfileData({
        full_name: data?.full_name ?? 'Usuari sense nom',
        avatar_url: data?.avatar_url || getRandomAvatar(user?.id),
        bio: data?.bio ?? null,
        points: data?.points ?? 0,
      });
    })();
  }, [user, isAuthenticated]);

  // Carrega dades del grup i membres
  useEffect(() => {
    if (!currentGroupId) {
      setGroupData(null);
      setMembersList([]);
      return;
    }
    setLoadingGroup(true);
    (async () => {
      // Grup
      const { data } = await supabase
        .from('groups')
        .select('id, name, short_code')
        .eq('id', currentGroupId)
        .single();
      setGroupData(data || null);

      // Membres amb JOIN a profiles
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id, profiles (id, full_name, avatar_url)')
        .eq('group_id', currentGroupId);

      if (membersError) console.error('Error carregant membres:', membersError);

      const formattedMembers =
        membersData?.map((m: any) => ({
          id: m.profiles?.id || m.user_id,
          full_name: m.profiles?.full_name || 'Membre nou',
          avatar_url: m.profiles?.avatar_url || getRandomAvatar(m.user_id),
        })) ?? [];

      setMembersCount(formattedMembers.length);
      setMembersList(formattedMembers);

      // Tasques pendents
      const { count: tasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', currentGroupId)
        .eq('completed', false);
      setPendingTasks(tasks ?? 0);

      setLoadingGroup(false);
    })();
  }, [currentGroupId]);

  const handleLeaveGroup = async () => {
    if (!currentGroupId) return;
    setLeavingGroup(true);
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', currentGroupId)
      .eq('user_id', user!.id);
    setCurrentGroupId('');
    await AsyncStorage.removeItem('currentGroupId');
    setGroupData(null);
    setMembersList([]);
    setLeavingGroup(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('currentGroupId');
    setCurrentGroupId('');
    setSigningOut(false);
    router.replace('/login');
  };

  const copyGroupCode = async () => {
    if (groupData?.id) {
      const shortCode = groupData.id.replace(/-/g, '').slice(0, 6);
      await Clipboard.setStringAsync(shortCode);
      Alert.alert('Codi copiat!', `El codi curt és: ${shortCode}`);
    }
  };

  return (
    <View className="flex-1 bg-beige">
      {/* Header amb logout */}
      <View className="h-12 bg-beige flex-row justify-between items-center px-4">
        <Text className="text-lg font-heading font-bold text-brown">COOLIVE</Text>
        <Pressable onPress={handleSignOut} disabled={signingOut}>
          <Feather name="log-out" size={22} color="#3E2C2A" />
        </Pressable>
      </View>

      <View className="flex-1 items-center pt-6">
        {/* Avatar i edició */}
        <View className="relative items-center">
          <Image
            source={{ uri: profileData?.avatar_url || getRandomAvatar(user?.id) }}
            className="w-32 h-32 rounded-full mb-2"
            resizeMode="cover"
          />
          <Pressable
            onPress={() => router.push('/profile-setup')}
            className="absolute bottom-2 right-2 bg-orange rounded-full p-1"
          >
            <Feather name="edit-2" size={16} color="#FFF" />
          </Pressable>
        </View>

        <Text className="mt-4 font-heading text-2xl font-bold text-brown">
          {profileData?.full_name || 'Usuari sense nom'}
        </Text>
        <Text className="mt-2 text-4xl font-heading text-orange">
          {profileData?.points ?? 0} Punts
        </Text>
        <Text className="mt-1 text-brown font-sans italic">
          {profileData?.bio || 'Sense biografia'}
        </Text>

        {/* Grup */}
        <View className="mt-6 items-center w-4/5">
          {loadingGroup ? (
            <ActivityIndicator size="small" color="#A08C7A" />
          ) : currentGroupId && groupData ? (
            <View className="bg-white rounded-lg p-4 w-full shadow items-center">
              <Text className="text-brown font-bold text-lg mb-1">Pis: {groupData.name}</Text>
              <Text className="text-brown mb-2">
                Codi per unir-te: {groupData.id.replace(/-/g, '').slice(0, 6)}
              </Text>
              <Text className="text-brown text-sm mb-2">
                Membres: {membersCount} | Tasques pendents: {pendingTasks}
              </Text>

              <FlatList
                data={membersList}
                keyExtractor={(item) => item.id}
                horizontal
                renderItem={({ item }) => (
                  <View className="items-center mr-3">
                    <Image
                      source={{ uri: item.avatar_url }}
                      className="w-10 h-10 rounded-full"
                    />
                    <Text className="text-xs text-brown">
                      {item.full_name?.slice(0, 8)}
                    </Text>
                  </View>
                )}
              />

              <Button title="Copiar codi" onPress={copyGroupCode} variant="secondary" />
              <View className="mt-4">
                <Button
                  title={leavingGroup ? 'Sortint...' : 'Sortir del grup'}
                  onPress={handleLeaveGroup}
                  isLoading={leavingGroup}
                  variant="secondary"
                />
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-lg p-4 w-full shadow items-center">
              <Text className="text-brown font-sans text-center mb-4">
                No estàs en cap grup. Crea’n un o uneix-te a un!
              </Text>
              <Button
                title="Crear Grup"
                onPress={() => router.push('/create-group')}
                variant="primary"
              />
              <View className="mt-2 w-full">
                <Button
                  title="Unir-me a un Grup"
                  onPress={() => router.push('/join')}
                  variant="secondary"
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
