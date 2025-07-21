import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GroupContextType = {
  currentGroupId: string | null;
  setCurrentGroupId: (id: string) => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentGroupId, setCurrentGroupIdState] = useState<string | null>(null);
  const { user } = useAuth();

  const setCurrentGroupId = async (id: string | null) => {
    setCurrentGroupIdState(id);
    if (id) {
      await AsyncStorage.setItem('currentGroupId', id);
    } else {
      await AsyncStorage.removeItem('currentGroupId');
    }
  };

  useEffect(() => {
    const fetchCurrentGroup = async () => {
      if (!user) {
        setCurrentGroupId(null);
        return;
      }

      // 1️⃣ Primer, mirar AsyncStorage (més ràpid)
      const storedGroupId = await AsyncStorage.getItem('currentGroupId');
      if (storedGroupId) {
        setCurrentGroupIdState(storedGroupId);
        return;
      }

      // 2️⃣ Si no hi ha res a AsyncStorage, consultar Supabase
      const { data } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (data?.group_id) {
        await setCurrentGroupId(data.group_id);
      } else {
        setCurrentGroupId(null);
      }
    };

    fetchCurrentGroup();
  }, [user]);

  return (
    <GroupContext.Provider value={{ currentGroupId, setCurrentGroupId }}>
      {children}
    </GroupContext.Provider>
  );
};
