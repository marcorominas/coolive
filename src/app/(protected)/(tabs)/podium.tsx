import React from 'react';
import { View, Text, Image, SafeAreaView, FlatList } from 'react-native';

const podiumData = [
  { id: '1', name: 'Marina', points: 34, image: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Albert', points: 23, image: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Paula', points: 15, image: 'https://i.pravatar.cc/150?img=3' },
];

export default function PodiumScreen() {
  return (
    <SafeAreaView className="flex-1 bg-beix-clar">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-2xl font-bold text-marro-fosc mb-2">Podium</Text>
        <Text className="text-base text-gray-500 mb-6">Ranking de punts de convivència</Text>
      </View>
      <View className="items-center mb-8">
        {/* Els tres primers (amb efecte de podi) */}
        <View className="flex-row items-end justify-center mb-8 gap-6">
          {/* 2n lloc */}
          <View className="items-center">
            <Image source={{ uri: podiumData[1].image }} className="w-16 h-16 rounded-full mb-2" />
            <View className="bg-ocre px-2 py-1 rounded-full mb-1">
              <Text className="text-blanc-pur font-bold text-sm">2n</Text>
            </View>
            <Text className="text-marro-fosc font-medium">{podiumData[1].name}</Text>
            <Text className="text-ocre font-bold">{podiumData[1].points} pts</Text>
          </View>
          {/* 1r lloc (al centre i més gran) */}
          <View className="items-center">
            <Image source={{ uri: podiumData[0].image }} className="w-24 h-24 rounded-full mb-2 border-4 border-ocre" />
            <View className="bg-ocre px-3 py-1 rounded-full mb-1">
              <Text className="text-blanc-pur font-bold text-base">1r</Text>
            </View>
            <Text className="text-marro-fosc font-semibold text-lg">{podiumData[0].name}</Text>
            <Text className="text-ocre font-extrabold text-lg">{podiumData[0].points} pts</Text>
          </View>
          {/* 3r lloc */}
          <View className="items-center">
            <Image source={{ uri: podiumData[2].image }} className="w-14 h-14 rounded-full mb-2" />
            <View className="bg-ocre px-2 py-1 rounded-full mb-1">
              <Text className="text-blanc-pur font-bold text-sm">3r</Text>
            </View>
            <Text className="text-marro-fosc font-medium">{podiumData[2].name}</Text>
            <Text className="text-ocre font-bold">{podiumData[2].points} pts</Text>
          </View>
        </View>
      </View>
      {/* Llista de la resta (si n'hi hagués) */}
      {/* <FlatList ... /> */}
      <View className="px-6">
        <Text className="text-gray-400 italic text-center">Aconsegueix punts per pujar al ranking! 🚀</Text>
      </View>
    </SafeAreaView>
  );
}
