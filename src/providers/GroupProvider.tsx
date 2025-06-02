import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

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
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrentGroup = async () => {
      if (!user) {
        console.warn('No user found in GroupProvider.');
        setCurrentGroupId(null);
        return;
      }

      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching group:', error);
        setCurrentGroupId(null);
        return;
      }

      if (data && data.group_id) {
        console.log('Fetched group ID:', data.group_id);
        setCurrentGroupId(data.group_id);
      } else {
        console.warn('No group found for this user.');
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
