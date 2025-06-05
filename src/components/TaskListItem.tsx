// src/components/TaskListItem.tsx
import React from 'react';
import type { Task } from '@/types';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { CheckCircleIcon, ClockIcon } from 'react-native-heroicons/outline';

export default function TaskListItem({ task }: { task: Task }) {
  const due = new Date(task.dueDate).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short',
  });

  const assignee = task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center justify-between bg-blanc-pur rounded-xl p-4 shadow"
    >
      {/* Esquerra: info tasca */}
      <View className="flex-1 pr-2">
        <Text className="text-lg font-semibold text-marro-fosc">
          {task.title}
        </Text>
        <Text className="text-xs text-gray-500">
          Fins: <Text className="text-ocre">{due}</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          {assignee?.image ? (
            <Image
              source={{ uri: assignee.image }}
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <View className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
          )}
          <Text className="text-sm text-ocre">
            {assignee?.name ?? 'Sense assignar'}
          </Text>
        </View>
      </View>

      {/* Dreta: punts i icona estat */}
      <View className="items-end">
        <View className="flex-row items-center bg-ocre/20 px-2 py-1 rounded-full mb-2">
          <Text className="text-ocre font-bold mr-1">
            {task.points}
          </Text>
          <Text className="text-xs text-ocre">pts</Text>
        </View>
        {task.completed ? (
          <CheckCircleIcon size={28} color="#22c55e" />
        ) : (
          <ClockIcon size={28} color="#D98C38" />
        )}
      </View>
    </TouchableOpacity>
  );
}
