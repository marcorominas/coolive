// join.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function JoinGroupScreen() {
  const { groupId } = useSearchParams(); // lee ?groupId=<uuid>
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si el usuario no está autenticado, redirigimos a login
    if (!isAuthenticated) {
      // Por ejemplo: router.replace('/login?redirectTo=/join?groupId=' + groupId)
      router.replace({
        pathname: '/login',
        params: { redirectTo: `/join?groupId=${groupId}` },
      });
      return;
    }

    if (!groupId || typeof groupId !== 'string') {
      Alert.alert('Link de invitación inválido.');
      setLoading(false);
      return;
    }

    const joinGroup = async () => {
      // 1. Verificar que el grupo existe
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('id', groupId)
        .single();

      if (groupError || !groupData) {
        Alert.alert('El grupo no existe o el link es inválido.');
        setLoading(false);
        return;
      }

      // 2. Intentar insertar en group_members
      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user!.id,
        });

      if (insertError) {
        // Si ya existe (p.ej. duplicado), asumimos que ya es miembro
        if (insertError.code === '23505') {
          // unique_violation → ya estaba en el grupo
          console.log('Ya eres miembro de este grupo.');
        } else {
          Alert.alert('Error al unirte al grupo. Intenta más tarde.');
          console.error(insertError);
          setLoading(false);
          return;
        }
      }

      // 3. Éxito: redirige a la pantalla principal del grupo o a HomeScreen
      router.replace('/'); // o router.replace(`/grupo/${groupId}`)
    };

    joinGroup();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12 }}>Un poco de paciencia...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Procesando invitación…</Text>
      <Pressable onPress={() => router.push('/')}>
        <Text style={{ marginTop: 8, color: 'blue' }}>Volver al inicio</Text>
      </Pressable>
    </View>
  );
}
