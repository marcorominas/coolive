// src/app/(protected)/(tabs)/profile-setup.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function ProfileSetupScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si l’usuari no està autenticat, redirigim a login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // ------------------------------------------------------
  // Funció per triar imatge d’avatar
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permís denegat',
        'Cal permetre accés a la galeria per triar avatar.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarLocalUri(result.assets[0].uri);
    }
  };

  // ------------------------------------------------------
  // Pujar avatar a Supabase Storage
  const uploadAvatar = async (localUri: string) => {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const fileExt = localUri.split('.').pop();
      const fileName = `${user!.id}/${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type,
        });
      if (uploadError) {
        console.error('Error al pujar avatar:', uploadError);
        return null;
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error('uploadAvatar error', err);
      return null;
    }
  };

  // ------------------------------------------------------
  // Submit de formulari de perfil
  const handleProfileSubmit = async () => {
    if (!fullName.trim() || !username.trim()) {
      Alert.alert('Per favor, completa tots els camps.');
      return;
    }
    setLoading(true);

    let finalAvatarUrl: string | null = null;
    if (avatarLocalUri) {
      const url = await uploadAvatar(avatarLocalUri);
      if (url) {
        finalAvatarUrl = url;
      } else {
        Alert.alert('Error pujant la imatge. Torna-ho a intentar.');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user!.id,
        full_name: fullName.trim(),
        username: username.trim(),
        avatar_url: finalAvatarUrl,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Error creant perfil:', error);
      Alert.alert('Error al crear el perfil:', error.message);
      setLoading(false);
      return;
    }

    router.replace('/profile'); // Un cop creat, tornem a Perfil
    setLoading(false);
  };

  // ------------------------------------------------------
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#D9C6A7]">
        <ActivityIndicator size="large" color="#7A4A15" />
        <Text className="mt-4 text-[#7A4A15]">Guardant perfil...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#D9C6A7] p-6">
      {/* Títol */}
      <Text className="text-3xl font-bold text-center text-[#7A4A15] mb-6">
        Completa el teu perfil
      </Text>

      {/* Selector d’avatar */}
      <Pressable
        onPress={pickImage}
        className="self-center w-32 h-32 bg-gray-200 rounded-full mb-6 overflow-hidden justify-center items-center"
      >
        {avatarLocalUri ? (
          <Image
            source={{ uri: avatarLocalUri }}
            className="w-32 h-32 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-[#7A4A15] text-center">Elige una foto</Text>
        )}
      </Pressable>

      {/* Camp Nom complet */}
      <Text className="text-sm font-medium text-[#7A4A15] mb-1">Nom complet</Text>
      <TextInput
        placeholder="El teu nom complet"
        placeholderTextColor="#7A4A15"
        value={fullName}
        onChangeText={setFullName}
        className="border border-[#7A4A15] rounded px-4 py-2 mb-4 bg-white text-[#7A4A15]"
      />

      {/* Camp Username */}
      <Text className="text-sm font-medium text-[#7A4A15] mb-1">Usuari</Text>
      <TextInput
        placeholder="username"
        placeholderTextColor="#7A4A15"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        className="border border-[#7A4A15] rounded px-4 py-2 mb-6 bg-white text-[#7A4A15]"
      />

      {/* Botó Guardar */}
      <Pressable
        onPress={handleProfileSubmit}
        className="bg-[#C09F52] py-3 rounded-lg items-center"
      >
        <Text className="text-white font-semibold">Guardar perfil</Text>
      </Pressable>
    </View>
  );
}
