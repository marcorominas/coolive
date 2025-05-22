import React, { useState } from 'react';
import { useRouter } from 'expo-router';
//import { useSupabase } from '../../lib/supabase';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

'use client';


export default function SignUP() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // Handle login logic here
    };

    return (
        <View className='flex-1 justify-center items-center bg-white px-6'>
            <Text className='text-3xl font-bold mb-8'>Login</Text>
            <TextInput
                className='w-full border border-gray-300 rounded-lg px-4 py-3 mb-4'
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                className='w-full border border-gray-300 rounded-lg px-4 py-3 mb-6'
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity
                className='w-full bg-blue-600 py-3 rounded-lg mb-4'
                onPress={handleLogin}
            >
                <Text className='text-white text-center font-semibold'>Login</Text>
            </TouchableOpacity>
            <View className='flex-row justify-center'>
                <Text className='text-gray-600'>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text className='text-blue-600 font-semibold'>Create one</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}