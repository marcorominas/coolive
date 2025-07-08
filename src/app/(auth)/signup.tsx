// src/app/(auth)/signup.tsx

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
  Alert 
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';






export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Introdueix un email i una contrasenya');
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Error al registrar-te:', error.message);
      } else {
        router.replace('/profile-setup');
      }
    } catch (err: any) {
      console.error('[Signup] Error:', err.message);
      Alert.alert('Error inesperat al registrar-te.');
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
      {/* Logo */}

      <View className="items-center mb-12">
        <Text className="font-heading text-2xl font-bold text-brown m-8">Uneix-te a Coolive!</Text>
        
        <Image
          source={require('../../../assets/LIVE.png')}
          className="w-60 h-60 rounded transform rotate-90"
          resizeMode="contain"
        />
      </View>

      <View className="w-full max-w-md space-y-6">
        <View>
          <Text className="text-sm font-sans font-medium text-brown mb-1">Email</Text>
          <TextInput
            className="w-full px-4 py-3 mb-5 bg-white border border-gray-300 rounded-lg text-brown"
            placeholder="Escriu el teu email"
            placeholderTextColor="#A08C7A"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View>
          <Text className="text-sm font-sans font-medium text-brown mb-1">Contrasenya</Text>
          <TextInput
            className="w-full px-4 py-3 mb-5 bg-white border border-gray-300 rounded-lg text-brown"
            placeholder="Escriu la teva contrasenya"
            placeholderTextColor="#A08C7A"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-orange py-3 mt-6 mb-4  font-sans rounded-lg items-center"
          activeOpacity={0.8}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Registrant-se...' : 'Crear un compte'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-brown">Ja tens un compte? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-orange font-medium">Inicia Sessió</Text>
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
