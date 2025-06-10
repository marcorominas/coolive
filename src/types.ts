// src/types.ts

export type User = {
  id: string
  name: string
  image: string
  bio?: string
  // maybe track current points if you want to render a podium
  points?: number
}

// A “flat” object for a shared household / project / group
// This is the main entity that users will interact with
export type Group = {
  id: string
  name: string
  createdBy: string        // User.id of the creator
  members: User[]          // list of users in this group
  createdAt: string
}
// A “join” record for a user in a group    
// This is a many-to-many relationship between User and Group
export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
};


// The core “task” or “chore” item
export type Task = {
  id: string
  title: string
  description?: string
  createdAt: string

  groupId: string          // which group this task belongs to
  points: number;         // add this
  completed: boolean;     // add this
  assignedTo: User[]  // list of users
  // scheduling info
  dueDate: string          // ISO date of next due
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  completedBy?: Completion []      // ISO date of when it was last completed
}

// record of a single completion

export type Completion = {
  id: string
  taskId: string
  userId: string
  completedAt: string
}
