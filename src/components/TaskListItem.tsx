import React, { useEffect, useState } from 'react';
import type { Task, User } from '@/types';
import { View, Text, Image, Pressable, Animated } from 'react-native';
import { CheckCircleIcon, ClockIcon, PencilIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';

type Props = {
  task: Task;
  onToggleComplete?: (task: Task, newCompleted: boolean) => void;
  userId?: string;
  onAwardPoints?: (points: number, userId: string) => void;
};

export default function TaskListItem({
  task,
  onToggleComplete,
  userId,
  onAwardPoints,
}: Props) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [anim] = useState(new Animated.Value(1));

  useEffect(() => {
    setIsCompleted(task.completed);
  }, [task.completed]);

  // Data formatada
  const due = new Date(task.dueDate).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short',
  });

  const potMarcar = !!userId && task.assignedTo.some(u => u.id === userId);

  const handleToggleComplete = () => {
    if (!potMarcar) return;

    // Animació simple
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    onToggleComplete?.(task, newCompleted);

    // Suma punts només si es marca com a feta
    if (newCompleted && onAwardPoints && userId) {
      onAwardPoints(task.points, userId);
    }
  };

  return (
    <Animated.View
      className="flex-row items-center justify-between bg-beige rounded-xl p-4 shadow mb-2"
      style={{ transform: [{ scale: anim }] }}
    >
      {/* ESQUERRA: info tasca */}
      <View className="flex-1 pr-2">
        <Text className="text-lg font-heading font-bold text-brown mb-1">{task.title}</Text>
        <Text className="text-xs text-brown">
          Fins: <Text className="text-orange">{due}</Text>
        </Text>

        {/* Assignats */}
        <View className="flex-row items-center mt-2 flex-wrap">
          {task.assignedTo.length === 0 ? (
            <Text className="text-sm text-orange">Sense assignar</Text>
          ) : (
            task.assignedTo.map(u => (
              <View key={u.id} className="flex-row items-center mr-2">
                {u.image
                  ? <Image source={{ uri: u.image }} className="w-6 h-6 rounded-full mr-1 bg-white" />
                  : <View className="w-6 h-6 rounded-full bg-orange mr-1" />
                }
                <Text className="text-sm text-brown">{u.name}</Text>
              </View>
            ))
          )}
        </View>

        {/* Completada per */}
        {task.completedBy?.length > 0 && (
          <Text className="text-xs text-green-700 mt-1">
            Completada per: {task.completedBy.map(cb => cb.userName || cb.userId).join(', ')}
          </Text>
        )}

        {/* Botó editar */}
        <Pressable
          onPress={() => router.push(`/edit-task?id=${task.id}`)}
          className="flex-row items-center mt-2"
        >
          <PencilIcon size={16} color="#A08C7A" />
          <Text className="text-xs font-sans text-orange ml-1 underline">Editar</Text>
        </Pressable>
      </View>

      {/* DRETA: punts i toggle completada */}
      <View className="items-end">
        <View className="flex-row items-center bg-orange/20 px-2 py-1 rounded-full mb-2">
          <Text className="text-orange font-bold mr-1">{task.points}</Text>
          <Text className="text-xs text-brown">pts</Text>
        </View>
        <Pressable
          onPress={handleToggleComplete}
          disabled={!potMarcar}
          className={`rounded-full p-1 ${potMarcar ? 'opacity-100' : 'opacity-40'}`}
        >
          {isCompleted
            ? <CheckCircleIcon size={28} color="#22c55e" />
            : <ClockIcon       size={28} color="#D98C38" />}
        </Pressable>
      </View>
    </Animated.View>
  );
}
