import React, { useState, useEffect } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useGroup } from '@/providers/GroupProvider';
import { useRouter } from 'expo-router';



type RankingUser = {
  id: string;
  name: string;
  points: number;
  image: string | null;
};



// const podiumData = [
//   { id: '1', name: 'Marina', points: 34, image: 'https://i.pravatar.cc/150?img=1' },
//   { id: '2', name: 'Albert', points: 23, image: 'https://i.pravatar.cc/150?img=2' },
//   { id: '3', name: 'Paula', points: 15, image: 'https://i.pravatar.cc/150?img=3' },
// ];

export default function PodiumScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { currentGroupId } = useGroup();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const fetchRanking = async () => {
      if (!currentGroupId) {
        setRanking([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, profiles(id, full_name, avatar_url, points)')
        .eq('group_id', currentGroupId);

      if (error) {
        console.error('Error carregant ranking:', error);
        setRanking([]);
        setLoading(false);
        return;
      }

      const parsed = (data ?? []).map((row: any) => ({
        id: row.user_id,
        name: row.profiles?.full_name ?? 'Sense nom',
        points: row.profiles?.points ?? 0,
        image: row.profiles?.avatar_url ?? null,
      })) as RankingUser[];

      parsed.sort((a, b) => b.points - a.points);
      setRanking(parsed);
      setLoading(false);
    };

    fetchRanking();
  }, [isAuthenticated, currentGroupId]);

  if (!currentGroupId) {
    return (
      <SafeAreaView className="flex-1 bg-beix-clar justify-center items-center">
        <Text className="text-marro-fosc text-center px-6">
          Crea o uneix-te a un grup per veure el rànquing!
        </Text>
      </SafeAreaView>
    );
  }

  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const renderItem = ({ item, index }: { item: RankingUser; index: number }) => (
    <View className="flex-row items-center justify-between bg-blanc-pur rounded-xl p-4 mb-2 shadow">
      <View className="flex-row items-center">
        <Text className="text-marro-fosc font-bold mr-4">{index + 4}.</Text>
        {item.image ? (
          <Image source={{ uri: item.image }} className="w-10 h-10 rounded-full mr-3" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
        )}
        <Text className="text-marro-fosc">{item.name}</Text>
      </View>
      <Text className="text-ocre font-semibold">{item.points} pts</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-beix-clar">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-2xl font-bold text-marro-fosc mb-2">Podium</Text>
        <Text className="text-base text-gray-500 mb-6">Ranking de punts de convivència</Text>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#D98C38" size="large" />
        </View>
      ) : (
        <>
          <View className="items-center mb-8">
            <View className="flex-row items-end justify-center mb-8 gap-6">
              {topThree[1] && (
                <View className="items-center">
                  {topThree[1].image ? (
                    <Image source={{ uri: topThree[1].image }} className="w-16 h-16 rounded-full mb-2" />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-gray-200 mb-2" />
                  )}
                  <View className="bg-ocre px-2 py-1 rounded-full mb-1">
                    <Text className="text-blanc-pur font-bold text-sm">2n</Text>
                  </View>
                  <Text className="text-marro-fosc font-medium">{topThree[1].name}</Text>
                  <Text className="text-ocre font-bold">{topThree[1].points} pts</Text>
                </View>
              )}

              {topThree[0] && (
                <View className="items-center">
                  {topThree[0].image ? (
                    <Image source={{ uri: topThree[0].image }} className="w-24 h-24 rounded-full mb-2 border-4 border-ocre" />
                  ) : (
                    <View className="w-24 h-24 rounded-full bg-gray-200 mb-2 border-4 border-ocre" />
                  )}
                  <View className="bg-ocre px-3 py-1 rounded-full mb-1">
                    <Text className="text-blanc-pur font-bold text-base">1r</Text>
                  </View>
                  <Text className="text-marro-fosc font-semibold text-lg">{topThree[0].name}</Text>
                  <Text className="text-ocre font-extrabold text-lg">{topThree[0].points} pts</Text>
                </View>
              )}

              {topThree[2] && (
                <View className="items-center">
                  {topThree[2].image ? (
                    <Image source={{ uri: topThree[2].image }} className="w-14 h-14 rounded-full mb-2" />
                  ) : (
                    <View className="w-14 h-14 rounded-full bg-gray-200 mb-2" />
                  )}
                  <View className="bg-ocre px-2 py-1 rounded-full mb-1">
                    <Text className="text-blanc-pur font-bold text-sm">3r</Text>
                  </View>
                  <Text className="text-marro-fosc font-medium">{topThree[2].name}</Text>
                  <Text className="text-ocre font-bold">{topThree[2].points} pts</Text>
                </View>
              )}
            </View>
          </View>

          {rest.length > 0 && (
            <FlatList
              data={rest}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          )}

          {ranking.length === 0 && (
            <View className="px-6">
              <Text className="text-gray-400 italic text-center">Encara no hi ha puntuacions.</Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}


