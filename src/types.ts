// src/types.ts

export type Profile = {
  id: string;                // PK - mateix que auth.users.id
  full_name: string | null;  // nom complet
  avatar_url: string | null; // URL de l'avatar
  bio: string | null;        // descripció curta
  points: number;            // punts acumulats
  updated_at?: string | null;
};

export type Group = {
  id: string;                // PK
  name: string;              // nom del grup
  created_by: string;        // FK cap a profiles.id (creador)
  created_at: string;        // data de creació
};

export type GroupMember = {
  id: string;                // PK
  group_id: string;          // FK cap a groups.id
  user_id: string;           // FK cap a profiles.id
  joined_at: string;         // data quan es va unir al grup
};

export type Task = {
  id: string;                // PK
  title: string;             // títol de la tasca
  description?: string | null;
  created_at: string;        // data creació
  created_by: string;        // FK cap a profiles.id
  group_id: string;          // FK cap a groups.id
  points: number;            // punts de la tasca
  completed: boolean;        // estat
  dueDate?: string | null;  // data límit (ISO)
};

export type TaskAssignment = {
  id: string;                // PK
  task_id: string;           // FK cap a tasks.id
  user_id: string;           // FK cap a profiles.id
  assigned_at: string;       // data assignació
};

export type Completion = {
  id: string;                // PK
  task_id: string;           // FK cap a tasks.id
  user_id: string;           // FK cap a profiles.id
  completed_at: string;      // data completada
};

// Alias per simplicitat en components on només es necessiten uns quants camps
export type User = Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
