import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

export default function NewTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('0');

  const handleCreate = () => {
    // UI-only placeholder
    console.log('Creating task:', { title, description, points });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-bold mb-4">Create New Task</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-1">Title</Text>
              <TextInput
                className="border border-gray-300 rounded p-2"
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-1">Description</Text>
              <TextInput
                className="border border-gray-300 rounded p-2 h-24"
                placeholder="Enter task description"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-1">Points</Text>
              <TextInput
                className="border border-gray-300 rounded p-2"
                placeholder="0"
                keyboardType="number-pad"
                value={points}
                onChangeText={setPoints}
              />
            </View>

            <Pressable
              onPress={handleCreate}
              className="bg-blue-500 rounded py-3 items-center mt-6"
            >
              <Text className="text-white font-semibold">Create Task</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
