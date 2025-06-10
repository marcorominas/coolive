import React from 'react';
import type { Task, User } from '@/types';
import { View, Text, Image, Pressable } from 'react-native';
import { CheckCircleIcon, ClockIcon, PencilIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';

type Props = {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  userId?: string; // Passa-ho des de TaskCalendar
};

export default function TaskListItem({ task, onToggleComplete, userId }: Props) {
  const router = useRouter();
  const due = new Date(task.dueDate).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short',
  });

  // Només pot marcar si està assignat
  const potMarcar = !!userId && task.assignedTo.some(u => u.id === userId);

  return (
    <View className="flex-row items-center justify-between bg-blanc-pur rounded-xl p-4 shadow">
      {/* Esquerra: info tasca */}
      <View className="flex-1 pr-2">
        <Text className="text-lg font-semibold text-marro-fosc">
          {task.title}
        </Text>
        <Text className="text-xs text-gray-500">
          Fins: <Text className="text-ocre">{due}</Text>
        </Text>

        {/* Assignats */}
        <View className="flex-row items-center mt-2 flex-wrap">
          {task.assignedTo.length === 0 ? (
            <Text className="text-sm text-ocre">Sense assignar</Text>
          ) : (
            task.assignedTo.map(u => (
              <View key={u.id} className="flex-row items-center mr-2">
                {u.image
                  ? <Image source={{ uri: u.image }} className="w-6 h-6 rounded-full mr-1" />
                  : <View className="w-6 h-6 rounded-full bg-gray-200 mr-1" />
                }
                <Text className="text-sm text-ocre">{u.name}</Text>
              </View>
            ))
          )}
        </View>

        {/* Historial de completions */}
        {task.completedBy && task.completedBy.length > 0 && (
          <Text className="text-xs text-green-700 mt-1">
            Completada per: {task.completedBy.map(cb => cb.userId).join(', ')}
          </Text>
        )}

        {/* Botó editar */}
        <Pressable
          onPress={() => router.push(`/edit-task?id=${task.id}`)}
          className="flex-row items-center mt-2"
        >
          <PencilIcon size={16} color="#A08C7A" />
          <Text className="text-xs text-ocre ml-1 underline">Editar</Text>
        </Pressable>
      </View>

      {/* Dreta: punts i cercle interactiu */}
      <View className="items-end">
        <View className="flex-row items-center bg-ocre/20 px-2 py-1 rounded-full mb-2">
          <Text className="text-ocre font-bold mr-1">{task.points}</Text>
          <Text className="text-xs text-ocre">pts</Text>
        </View>
        <Pressable
          onPress={() => potMarcar && onToggleComplete?.(task)}
          disabled={!potMarcar}
          className={`rounded-full p-1 ${potMarcar ? 'opacity-100' : 'opacity-40'}`}
        >
          {task.completed
            ? <CheckCircleIcon size={28} color="#22c55e" />
            : <ClockIcon       size={28} color="#D98C38" />}
        </Pressable>
      </View>
    </View>
  );
}
