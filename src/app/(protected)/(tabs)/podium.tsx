import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useGroup } from "@/providers/GroupProvider";
import { useRouter } from "expo-router";

type RankingUser = {
  id: string;
  name: string;
  points: number;
  image: string | null;
  completedTasks: number;
};

type HistoryItem = {
  id: string;
  userName: string;
  userImage: string | null;
  taskTitle: string;
  completedAt: string;
};

export default function PodiumScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { currentGroupId } = useGroup();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentGroupId) {
      setRanking([]);
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // ✅ Rànquing bàsic
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, profiles(id, full_name, avatar_url, points)")
      .eq("group_id", currentGroupId);

    if (error) {
      console.error("Error carregant ranking:", error);
      setRanking([]);
      setHistory([]);
      setLoading(false);
      return;
    }

    // ✅ Comptar completions
    const userIds = data?.map((d: any) => d.user_id) ?? [];
    const { data: completionsData } = await supabase
      .from("completions")
      .select("user_id, task_id")
      .in("user_id", userIds);

    const completionsCount: { [userId: string]: number } = {};
    (completionsData ?? []).forEach((c) => {
      completionsCount[c.user_id] =
        (completionsCount[c.user_id] ?? 0) + 1;
    });

    const parsed = (data ?? []).map((row: any) => ({
      id: row.user_id,
      name: row.profiles?.full_name ?? "Sense nom",
      points: row.profiles?.points ?? 0,
      image: row.profiles?.avatar_url ?? null,
      completedTasks: completionsCount[row.user_id] ?? 0,
    })) as RankingUser[];

    parsed.sort((a, b) => b.points - a.points);
    setRanking(parsed);

    // ✅ Historial (últimes 10 tasques)
    const { data: historyData } = await supabase
      .from("completions")
      .select("id, completed_at, profiles(full_name, avatar_url), tasks(title)")
      .eq("tasks.group_id", currentGroupId)
      .order("completed_at", { ascending: false })
      .limit(10);

    const parsedHistory =
      historyData?.map((h: any) => ({
        id: h.id,
        userName: h.profiles?.full_name ?? "Sense nom",
        userImage: h.profiles?.avatar_url ?? null,
        taskTitle: h.tasks?.title ?? "Tasca",
        completedAt: new Date(h.completed_at).toLocaleDateString("ca-ES", {
          day: "numeric",
          month: "short",
        }),
      })) ?? [];

    setHistory(parsedHistory);
    setLoading(false);
    setRefreshing(false);
  }, [currentGroupId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, currentGroupId]);

  const handleReward = async (user: RankingUser) => {
    Alert.alert(
      "Premiar",
      `Vols donar 5 punts extra a ${user.name}?`,
      [
        { text: "Cancel·lar", style: "cancel" },
        {
          text: "Premiar",
          style: "default",
          onPress: async () => {
            const newPoints = user.points + 5;
            await supabase
              .from("profiles")
              .update({ points: newPoints })
              .eq("id", user.id);
            Alert.alert("Premiat!", `${user.name} ha rebut 5 punts extra`);
            await fetchData(); 
          },
        },
      ]
    );
  };

  if (!currentGroupId) {
    return (
      <SafeAreaView className="flex-1 bg-beige justify-center items-center">
        <Text className="text-brown text-center px-6">
          Crea o uneix-te a un grup per veure el rànquing!
        </Text>
      </SafeAreaView>
    );
  }

  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const renderItem = ({ item, index }: { item: RankingUser; index: number }) => (
    <View className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-2 shadow">
      <View className="flex-row items-center">
        <Text className="text-brown font-bold mr-4">{index + 4}.</Text>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
        )}
        <View>
          <Text className="text-brown font-semibold">{item.name}</Text>
          <Text className="text-brown opacity-70 text-xs">
            {item.completedTasks} tasques fetes
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-orange font-semibold mb-1">
          {item.points} pts
        </Text>
        <Pressable
          onPress={() => handleReward(item)}
          className="bg-orange px-2 py-1 rounded-full"
        >
          <Text className="text-white text-xs">Premiar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-beige">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
      >
        <View className="px-6 pt-8 pb-4">
          <Text className="text-2xl font-bold text-brown mb-2">Pòdium</Text>
          <Text className="text-base text-brown opacity-70 mb-6">
            Rànquing de punts i tasques completades
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="#D98C38" size="large" />
          </View>
        ) : (
          <>
            {/* TOP 3 */}
            <View className="items-center mb-8">
              <View className="flex-row items-end justify-center mb-8 gap-6">
                {topThree.map((user, idx) => (
                  <View
                    key={user.id}
                    className={`items-center ${idx === 0 ? "scale-110" : ""}`}
                  >
                    <Image
                      source={{
                        uri:
                          user.image ??
                          `https://api.dicebear.com/7.x/identicon/png?seed=${user.id}`,
                      }}
                      className={`${
                        idx === 0
                          ? "w-24 h-24 border-4"
                          : idx === 1
                          ? "w-16 h-16"
                          : "w-14 h-14"
                      } rounded-full mb-2 border-ocre`}
                    />
                    <View className="bg-orange px-2 py-1 rounded-full mb-1">
                      <Text className="text-white font-bold">{idx + 1}r</Text>
                    </View>
                    <Text className="text-brown font-medium">{user.name}</Text>
                    <Text className="text-orange font-bold">{user.points} pts</Text>
                    <Text className="text-brown opacity-70 text-xs">
                      {user.completedTasks} tasques
                    </Text>
                    <Pressable
                      onPress={() => handleReward(user)}
                      className="bg-orange px-2 py-1 rounded-full mt-1"
                    >
                      <Text className="text-white text-xs">Premiar</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            {rest.length > 0 && (
              <FlatList
                data={rest}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 24 }}
              />
            )}

            {/* HISTORIAL */}
            <View className="px-6 mt-10">
              <Text className="text-lg text-brown font-heading font-bold mb-3">
                Últimes tasques fetes
              </Text>
              {history.map((h) => (
                <View
                  key={h.id}
                  className="flex-row items-center bg-white rounded-xl p-3 mb-2 shadow"
                >
                  <Image
                    source={{
                      uri:
                        h.userImage ??
                        `https://api.dicebear.com/7.x/identicon/png?seed=${h.userName}`,
                    }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-brown text-sm font-semibold">
                      {h.userName}
                    </Text>
                    <Text className="text-brown opacity-70 text-xs">
                      {h.taskTitle}
                    </Text>
                  </View>
                  <Text className="text-brown opacity-50 text-xs">
                    {h.completedAt}
                  </Text>
                </View>
              ))}
              {history.length === 0 && (
                <Text className="text-gray-400 italic text-center">
                  Encara no hi ha activitats recents.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
