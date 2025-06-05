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
  const [uploading, setUploading] = useState(false);

  // Si no està autenticat, anar a login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Carrega dades existents
  useEffect(() => {
    if (user) {
      (async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, bio, avatar_url')
          .eq('id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error carregant perfil:', error);
        } else if (data) {
          setFullName(data.full_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url);
        }
      })();
    }
  }, [user]);

  // Funció per triar imatge i pujar-la a Supabase
  const pickImageAndUpload = async () => {
    // Si ja està en procés, sortim
    if (uploading) return;
    setUploading(true);

    console.log('📌 pickImageAndUpload invocat');

    if (!user) {
      Alert.alert('Error: usuari no carregat.');
      setUploading(false);
      return;
    }

    // 1) Demanar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('ImagePicker permissions status:', status);
    if (status !== 'granted') {
      Alert.alert('Permís denegat per accedir a la galeria');
      setUploading(false);
      return;
    }

    // 2) Obrir selector d’imatges
    console.log('⏳Obrint ImagePicker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    console.log('Result ImagePicker:', result);

    if (result.canceled || result.assets.length === 0) {
      console.log('⏹ No s’ha seleccionat cap imatge');
      setUploading(false);
      return;
    }

    try {
      // 3) URI local
      const localUri = result.assets[0].uri;
      console.log('Local URI triada:', localUri);

      // 4) Fetch → Blob
      const response = await fetch(localUri);
      console.log('Fetch status:', response.status, 'ok?', response.ok);
      const blob = await response.blob();

      // 5) Generar nom de fitxer
      const filename = `${user.id}/${Date.now()}.jpg`;
      console.log('✍️ Pujo fitxer com a:', filename);

      // 6) Upload a Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, blob, { contentType: 'image/jpeg' });
      console.log('Upload Error (si n’hi ha):', uploadError);
      if (uploadError) {
        Alert.alert('Error pujant la imatge:', uploadError.message);
        return;
      }

      // 7) Get publicUrl
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);
      console.log('✅ Public URL obtinguda:', publicData.publicUrl);
      setAvatarUrl(publicData.publicUrl);
    } catch (err) {
      console.error('🔥 Error inesperat pujant imatge:', err);
      Alert.alert('Error inesperat pujant la imatge');
    } finally {
      setUploading(false);
    }
  };

  // Funció per desar/upsert del perfil
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
      if (avatarUrl) updates.avatar_url = avatarUrl;

      const { error: upsertError } = await supabase.from('profiles').upsert(updates);
      if (upsertError) {
        Alert.alert('Error desant el perfil:', upsertError.message);
        console.error('Upsert profile error:', upsertError);
      } else {
        Alert.alert('🔔 Perfil desat correctament!');
        router.replace('/profile');
      }
    } catch (err) {
      console.error('Error inesperat guardant perfil:', err);
      Alert.alert('Error inesperat guardant el perfil');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F1E9' }}
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
            {/* Avatar (rodona clicable) */}
            <View className="items-center space-y-2">
              <Pressable
                onPress={pickImageAndUpload}
                disabled={uploading}
                className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden items-center justify-center"
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-marron-fosc text-center">Toca per posar foto</Text>
                )}
              </Pressable>

              {/* Botó de text (opcional) */}
              <Pressable
                onPress={pickImageAndUpload}
                className="px-4 py-2 bg-ocre rounded-lg"
                disabled={uploading}
              >
                <Text className="text-blanc-pur font-medium">
                  {uploading ? 'Pujant...' : 'Canvia Foto'}
                </Text>
              </Pressable>
            </View>

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
              <View>
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
              className={`w-full rounded-lg py-3 items-center ${
                uploading ? 'bg-gris-claro' : 'bg-ocre'
              }`}
              disabled={uploading}
            >
              <Text className="text-blanc-pur font-semibold">Desa Canvis</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
