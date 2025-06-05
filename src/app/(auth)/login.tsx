// src/app/(auth)/login.tsx

import React, { useState } from 'react';
import {
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

  const handleGoogleSignIn = async () => {
    // Exemple bàsic de sign in amb Google a Supabase
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) {
        Alert.alert('Error (Google):', error.message);
      }
    } catch (err: any) {
      console.error('Google SignIn Error:', err);
      Alert.alert('Error inesperat amb Google Sign In');
    }
  };

  return (
    <View className="flex-1 bg-beix-clar items-center px-6 pt-16">
      {/* Logo / Splash */}
      <View className="items-center mb-12">
        <Image
          source={require('../../../assets/LIVE.png')} 
          className="w-36 h-36"
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View className="w-full max-w-md space-y-6">
        <View>
          <Text className="text-sm font-medium text-marron-fosc mb-1">Email</Text>
          <TextInput
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-marron-fosc"
            placeholder="Enter your email"
            placeholderTextColor="#A08C7A"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View>
          <Text className="text-sm font-medium text-marron-fosc mb-1">Password</Text>
          <TextInput
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-marron-fosc"
            placeholder="Enter your password"
            placeholderTextColor="#A08C7A"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-ocre py-3 rounded-lg items-center"
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-blanc-pur font-semibold">
            {isLoading ? 'Logging in...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-marron-fosc">No tens compte? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text className="text-ocre font-medium">Create an Account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text className="text-center text-marron-fosc">OR</Text>

        <TouchableOpacity
          className="w-full bg-white border border-gray-300 flex-row items-center justify-center py-3 rounded-lg"
          activeOpacity={0.8}
          onPress={handleGoogleSignIn}
        >
          <Image
            source={require('../../../assets/google-icon.png')} // posa el teu icona de Google
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-marron-fosc font-medium">Sign In With Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
