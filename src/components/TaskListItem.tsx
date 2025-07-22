import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { CheckCircle, Circle } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { Task } from "@/types";

type Props = {
  task: Task;
  onToggleComplete: (task: Task) => void;
  userId?: string;
};

export default function TaskListItem({ task, onToggleComplete }: Props) {
  const router = useRouter();
  const isCompleted = task.completed;

  const handleNavigateToEdit = () => {
    router.push(`/edit-task?taskId=${task.id}`);
  };

  return (
    <Pressable
      onPress={handleNavigateToEdit}
      className="
        bg-white
        rounded-2xl
        p-4
        mb-3
        shadow
        flex-row
        items-center
        justify-between
      "
      android_ripple={{ color: "#f3e9d2" }}
    >
      {/* ✅ Esquerra: check + info tasca */}
      <View className="flex-row items-center flex-1">
        <Pressable
          onPress={(e) => {
            e.stopPropagation(); // ✅ Evitem que es dispari la navegació en clicar el check
            onToggleComplete(task);
          }}
          className="mr-3"
          android_ripple={{ color: "#eab308" }}
        >
          {isCompleted ? (
            <CheckCircle size={28} color="#D98C38" />
          ) : (
            <Circle size={28} color="#3E2C2A" />
          )}
        </Pressable>

        <View className="flex-1">
          <Text
            className={`font-heading text-base ${
              isCompleted ? "text-brown opacity-50 line-through" : "text-brown"
            }`}
          >
            {task.title}
          </Text>
          <Text className="text-xs text-brown opacity-70 mt-0.5">
            Per a:{" "}
            {new Date(task.due_date || "").toLocaleDateString("ca-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>
      </View>

      {/* ✅ Dreta: avatars i punts */}
      <View className="items-end">
        <View className="flex-row mb-1">
          {task.assignedTo?.map((user) => (
            <Image
              key={user.id}
              source={{
                uri:
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/identicon/png?seed=${user.id}`,
              }}
              className="w-6 h-6 rounded-full border border-beige -ml-1"
            />
          ))}
        </View>
        <Text className="text-xs text-orange font-bold">
          {task.points} ⭐ pts
        </Text>
      </View>
    </Pressable>
  );
}
