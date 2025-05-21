
export type User = {
  id: string
  username: string
  name: string
  image: string
  bio?: string
  // maybe track current points if you want to render a podium
  points?: number
}

// A “flat” object for a shared household / project / group
export type Group = {
  id: string
  name: string
  createdBy: string        // User.id of the creator
  members: User[]          // list of users in this group
  createdAt: string
}

// The core “task” or “chore” item
export type Task = {
  id: string
  title: string
  description?: string
  createdAt: string

  groupId: string          // which group this task belongs to
  assignedTo: User[]       // who’s responsible each time it runs

  // scheduling info
  dueDate: string          // ISO date of next due
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'

  // completion history (you can also normalize this into its own table)
  completedBy: Completion[]  
}

// record of a single completion
export type Completion = {
  id: string
  taskId: string
  userId: string
  completedAt: string
}
