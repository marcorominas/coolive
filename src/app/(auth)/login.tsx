// src/app/(auth)/login.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';




export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Introdueix un email i una contrasenya');
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Error al fer login:', error.message);
      } else {
        router.replace('/(protected)/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Error inesperat al fer login:', err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-beige">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >

    
    <ScrollView contentContainerStyle={{ 
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 120 : 20,
       }} 
       keyboardShouldPersistTaps="handled"
    >
    <View className="flex-1 bg-beige items-center justify-center">

      {/* Logo*/}
      <View className="items-center mb-12">
        <Text className="font-heading text-2xl font-bold text-brown m-8">Benvingut/da de nou!</Text>
        <Image
          source={require('../../../assets/LIVE.png')} 
          className="w-60 h-60 rounded"
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View className="w-full max-w-md space-y-6">
        <View>
          <Text className="text-sm font-medium text-brown mb-1">Email</Text>
          <TextInput
            className="w-full px-4 py-3 mb-5 bg-white border border-gray-300 rounded-lg text-brown"
            placeholder="Introdueix email"
            placeholderTextColor="#A08C7A"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View>
          <Text className="text-sm font-medium text-brown mb-1">Contasenya</Text>
          <TextInput
            className="w-full px-4 py-3 mb-5 bg-white border border-gray-300 rounded-lg text-brown"
            placeholder="Introdueix contrasenya "
            placeholderTextColor="#A08C7A"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-orange py-3 mt-6 mb-4 rounded-lg items-center"
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Iniciant sessió...' : 'Iniciar Sessió'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-brown">No tens compte? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text className="text-orange font-medium">Crear una compte</Text>
            </TouchableOpacity>
          </Link>
        </View>


        
      </View>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView> 
  );
}
