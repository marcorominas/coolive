// ─── src/app/(protected)/(tabs)/profile-setup.tsx ───────────────────

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';

export default function ProfileSetupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [points, setPoints] = useState(0);

  // Avatar random per defecte (DiceBear, sempre canvia segons user.id)
  const defaultAvatarUrl = `https://api.dicebear.com/8.x/lorelei/png?seed=${seed}`;

  // Redirigeix si no està autenticat
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Carrega dades existents de l'usuari
  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, bio, avatar_url, points')
          .eq('id', user.id)
          .single();
        if (data) {
          setFullName(data.full_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url);
          setPoints(data.points || 0);
        }
      })();
    }
  }, [user]);

  // Desa o actualitza el perfil a Supabase
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('El camp “Nom complet” és obligatori');
      return;
    }
    if (!user) {
      Alert.alert('Error: usuari no carregat.');
      return;
    }

    try {
      const updates: {
        id: string;
        full_name: string;
        bio?: string;
        avatar_url?: string | null;
        updated_at: string;
      } = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };
      if (bio.trim() !== '') updates.bio = bio;
      // Desa l'avatar random només si no n'hi ha cap altre (opcional)
      updates.avatar_url = avatarUrl || defaultAvatarUrl;

      const { error: upsertError } = await supabase.from('profiles').upsert(updates);
      if (upsertError) {
        Alert.alert('Error desant el perfil:', upsertError.message);
      } else {
        Alert.alert('Perfil desat correctament!');
        router.replace('/profile');
      }
    } catch {
      Alert.alert('Error inesperat guardant el perfil');
    }
  };

    // Funció per canviar l’avatar
  const handleRandomAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
    setAvatarUrl(''); // buidem per assegurar que canvia
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'beix-clar' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 30, android: 40 })}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-beix-clar">
          {/* Header */}
          <View className="flex-row items-center justify-center py-4 bg-ocre">
            <Text className="text-2xl font-bold text-blanc-pur">Editar Perfil</Text>
          </View>

          {/* Contingut principal */}
          <View className="p-4 space-y-6">
            {/* AVATAR RANDOM */}
              <TouchableOpacity onPress={handleRandomAvatar} className="items-center">
                <Text className="text-sm text-marron-fosc mb-1">Canvia Avatar</Text>
                  <View className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
                    <Image
                      source={{ uri: avatarUrl || defaultAvatarUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={e => {
                        console.log('Error carregant la imatge:', e.nativeEvent);
                      }}
                    />
                  </View>
              </TouchableOpacity>
            

            {/* Camps de text: Nom complet i Bio */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-marron-fosc mb-1">Nom complet</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="El teu nom"
                  placeholderTextColor="#A08C7A"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-marron-fosc"
                />
              </View>
              <View >
                <Text className="text-sm font-medium text-marron-fosc mb-1">Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Una breu descripció sobre tu..."
                  placeholderTextColor="#A08C7A"
                  multiline
                  numberOfLines={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-marron-fosc"
                />
              </View>
              
            </View>

            {/* Botó Desa */}
            <Pressable
              onPress={handleSaveProfile}
              className="w-full rounded-lg py-3 items-center mt-4 bg-ocre"
            >
              <Text className="text-blanc-pur font-semibold">Desa Canvis</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
