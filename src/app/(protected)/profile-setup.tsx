import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';

function getRandomAvatar(seed?: string) {
  const randomSeed = seed || Math.random().toString(36).slice(2);
  return `https://api.dicebear.com/6.x/avataaars/png?seed=${randomSeed}`;
}

export default function ProfileSetupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, bio, avatar_url')
          .eq('id', user.id)
          .single();
        setFullName(data?.full_name || '');
        setBio(data?.bio || '');
        setAvatarUrl(data?.avatar_url || getRandomAvatar(user.id));
      })();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !user) {
      Alert.alert('El camp “Nom complet” és obligatori');
      return;
    }

    setSaving(true);

    try {
      const finalAvatarUrl = avatarUrl || getRandomAvatar(user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      const currentPoints = profileData?.points ?? 0;

      const updates = {
        id: user.id,
        full_name: fullName.trim(),
        bio: bio.trim() !== '' ? bio : null,
        avatar_url: finalAvatarUrl,
        points: currentPoints,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase.from('profiles').upsert(updates);
      if (upsertError) throw upsertError;

      Alert.alert('✅ Perfil desat correctament!');
      router.replace(`/profile?refresh=${Date.now()}`);
    } catch (err) {
      console.error('Error desant el perfil:', err);
      Alert.alert('Error inesperat en desar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleNewAvatar = () => {
    setAvatarUrl(getRandomAvatar());
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-beige"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 30, android: 40 })}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-beige">
          <View className="flex-row items-center justify-center py-4 bg-orange">
            <Text className="text-2xl font-heading font-bold text-white">Editar Perfil</Text>
          </View>
          <View className="p-4 space-y-6">
            <View className="items-center mb-3">
              <Image
                source={{ uri: avatarUrl || getRandomAvatar(user?.id) }}
                className="w-28 h-28 rounded-full mb-2"
                resizeMode="cover"
              />
              <Button title="Canvia Avatar" onPress={handleNewAvatar} />
            </View>
            <View className="space-y-4 mb-3">
              <View>
                <Text className="text-medium font-sans text-semibold text-brown mb-1">
                  Nom complet
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="El teu nom"
                  placeholderTextColor="#A08C7A"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-sans text-brown"
                />
              </View>
              <View>
                <Text className="text-m font-sans text-semibold text-brown mb-1">Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Una breu descripció sobre tu..."
                  placeholderTextColor="#A08C7A"
                  multiline
                  numberOfLines={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-brown font-sans"
                />
              </View>
            </View>
            <Button
              title={saving ? 'Desant...' : 'Desa Canvis'}
              onPress={handleSaveProfile}
              isLoading={saving}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
