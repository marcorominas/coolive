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
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';

export default function ProfileSetupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
          .select('full_name, bio, avatar_url')
          .eq('id', user.id)
          .single();
        if (data) {
          setFullName(data.full_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url);
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
      let finalAvatarUrl = avatarUrl;

      // Si l'URL comença amb file://, puja la imatge
      if (avatarUrl?.startsWith('file://')) {
        const fileExt = avatarUrl.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage
          .from('profilephotos')
          .upload(fileName, blob, { contentType: blob.type });

        if (uploadError) {
          Alert.alert('Error pujant la imatge', uploadError.message);
          return;
        }

        const { data } = supabase.storage.from('profilephotos').getPublicUrl(fileName);
        finalAvatarUrl = data.publicUrl;
        setAvatarUrl(finalAvatarUrl);
      }

      const updates = {
        id: user.id,
        full_name: fullName,
        bio: bio.trim() !== '' ? bio : null,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      };
      const { error: upsertError } = await supabase.from('profiles').upsert(updates);
      if (upsertError) {
        Alert.alert('Error desant el perfil:', upsertError.message);
      } else {
        Alert.alert('Perfil desat correctament!');
        router.replace('/profile');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error inesperat guardant el perfil');
    }
  };

  const pickImageAsync = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permís de galeria denegat');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // Use 'mediaTypes' with an array of allowed types
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // crop quadrat
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('pickImageAsync error:', error);
      Alert.alert('Error obrint la galeria');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-beige"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 30, android: 40 })}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-beige">
          {/* Header */}
          <View className="flex-row items-center justify-center py-4 bg-orange">
            <Text className="text-2xl font-heading font-bold text-white">Editar Perfil</Text>
          </View>

          {/* Contingut principal */}
          <View className="p-4 space-y-6">
            {/* Vista per afegir només imatge */}
            <TouchableOpacity onPress={pickImageAsync} className="items-center mb-4">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-28 h-28 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-brown items-center justify-center">
                  <Text className="text-sm text-gray-500">Afegeix imatge</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Camps de text: Nom complet i Bio */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-sans text-semibold text-brown mb-1">Nom complet</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="El teu nom"
                  placeholderTextColor="#A08C7A"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-sans text-brown"
                />
              </View>
              <View>
                <Text className="text-sm font-sans text-semibold text-brown mb-1">Bio</Text>
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
