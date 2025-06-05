// src/app/(protected)/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { Link } from 'expo-router';
import TaskListItem from '@/components/TaskListItem';
import { useGroup } from '@/providers/GroupProvider';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentGroupId } = useGroup();

  // **Dades dummy d'usuari i grup** (en el futur pots substituir-ho per les dades reals)
  const usuariNom = 'nom_user';
  const grupNom = 'nom_grup';

  // **Estat per al toggle Dia / Calendari**
  const [modeView, setModeView] = useState<'llista' | 'calendar'>('llista');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error && data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [currentGroupId]);

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: '#D9C6A7' }}
      >
        <ActivityIndicator size="large" color="#7A4A15" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#D9C6A7' }}>
      {/* ================= ENCABEZADO ORIGINAL (logo + títol) ================= */}
      <View className="flex-row items-center justify-center py-4 bg-[#7A4A15]">
        <Image source={require('../../../../assets/LIVE.png')} className="w-10 h-10" /> 
        <Text className="text-2xl font-bold text-white ml-2">Colive</Text>
        {/* (Opcional) icona de configuració a la dreta */}
        <Pressable className="absolute right-4">
          <Text className="text-white text-xl">⚙️</Text>
        </Pressable>
      </View>

      {/* ================= SECCIÓ SUPERIOR AMB FOTO, NOM, FLETXES I DIA/CALENDARI ================= */}
      <View className="items-center mt-4 px-4">
        <View className="flex-row items-center justify-center w-full">
          {/* Fletxa esquerra */}
          <Pressable
            onPress={() => {
              /* Aquí podries canviar la data o qualsevol lògica */
            }}
            className="px-4"
          >
            <Text className="text-2xl text-[#7A4A15]">‹</Text>
          </Pressable>

          {/* Bloc central: foto rodona + noms + toggle Dia/Calendari */}
          <View className="items-center mx-4">
            {/* Cercle gris per a la foto d'usuari */}
            <View className="w-24 h-24 bg-gray-300 rounded-full" />

            {/* Noms usuari i grup */}
            <View className="flex-row items-center mt-2">
              <Text className="text-white text-base mr-2">{usuariNom}</Text>
              <Text className="text-white text-base">{grupNom}</Text>
            </View>

            {/* Botó Dia / Calendari */}
            <Pressable
              onPress={() =>
                setModeView(modeView === 'llista' ? 'calendar' : 'llista')
              }
              className="mt-2 px-3 py-1 rounded-full"
              style={{
                backgroundColor: modeView === 'llista' ? '#C09F52' : '#7A4A15',
              }}
            >
              <Text className="text-white font-medium text-sm">
                {modeView === 'llista' ? 'Calendari' : 'Llista'}
              </Text>
            </Pressable>
          </View>

          {/* Fletxa dreta */}
          <Pressable
            onPress={() => {
              /* Aquí podries canviar la data o qualsevol lògica */
            }}
            className="px-4"
          >
            <Text className="text-2xl text-[#7A4A15]">›</Text>
          </Pressable>
        </View>
      </View>

      {/* ================= CONTINGUT PRINCIPAL: LLISTA O CALENDARI ================= */}
      <View className="flex-1 mt-4">
        {modeView === 'llista' ? (
          <>
            {/* Botó “+ Nova Tarea” (tal com ja el tenies) */}
            <View className="px-4 mb-4">
              {currentGroupId ? (
                <Link href={`/new-task?groupId=${currentGroupId}`} asChild>
                  <Pressable
                    className="w-full rounded-full py-3 items-center"
                    style={{ backgroundColor: '#C09F52' }}
                  >
                    <Text className="text-white font-semibold text-lg">
                      + Nova Tarea
                    </Text>
                  </Pressable>
                </Link>
              ) : (
                <Text className="text-[#7A4A15] text-center">
                  Primer has d'unir-te o crear un grup per poder crear tasques.
                </Text>
              )}
            </View>

            {/* Llista de tasques (igual que abans) */}
            {tasks.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-center text-[#7A4A15] mt-8">
                  Encara no hi ha cap tasca. Crea’n una nova!
                </Text>
              </View>
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                renderItem={({ item }) => (
                  <View className="mb-4">
                    <TaskListItem task={item} />
                  </View>
                )}
              />
            )}
          </>
        ) : (
          // **Placeholder per al calendari** (fase 2)
          <View className="m-4 h-64 justify-center items-center bg-gray-200 rounded-lg">
            <Text className="text-[#7A4A15]">
              Aquí aniria el component de Calendari (fase 2)
            </Text>
          </View>
        )}
      </View>

      
      

      
      
    </View>
  );
}

// Si vols afegir alguna regla de StyleSheet “extra” per al TaskListItem, pots fer-ho aquí:
const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderLeftColor: '#C09F52',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
