import React from 'react';
import type { Task } from '@/types';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  CheckCircleIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';


// TaskListItem component to display individual task details

export default function TaskListItem({ task }: { task: Task }) {
    // Format due date as e.g. "Mar 22"
  const due = new Date(task.dueDate).toLocaleDateString(undefined, {
    day:   'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center justify-between bg-white rounded-lg p-4 mb-3 shadow"
    >
      {/* Left block: title, due, assignee */}
      <View className="flex-1 pr-2">
        <Text className="text-lg font-semibold text-gray-900">
          {task.title}
        </Text>
        <Text className="text-sm text-gray-500">
          Due: {due}
        </Text>
        <View className="flex-row items-center mt-2">
          {task.assignedTo ? (
            <Image
              source={{ uri: task.assignedTo.image }}
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <View className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
          )}
          <Text className="text-sm text-gray-700">
            {task.assignedTo?.name ?? 'Unassigned'}
          </Text>
        </View>
      </View>

      {/* Right block: points + status icon */}
      <View className="items-end">
        <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-full mb-2">
          <Text className="text-blue-700 font-bold mr-1">
            {task.points}
          </Text>
          <Text className="text-xs text-blue-700">pts</Text>
        </View>
        {task.completed ? (
          <CheckCircleIcon size={28} color="#22c55e" />
        ) : (
          <ClockIcon size={28} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );
}

