
import type { User, Group, Task, Completion } from './types'

// ----- Usuaris falsos -----
export const DUMMY_USERS: User[] = [
  {
    id: 'user-1',
    username: 'alice',
    name: 'Alice Smith',
    image: 'https://i.pravatar.cc/150?img=1',
    bio: 'Loves keeping things tidy.',
    points: 30,
  },
  {
    id: 'user-2',
    username: 'bob',
    name: 'Bob Johnson',
    image: 'https://i.pravatar.cc/150?img=2',
    bio: 'Always up for a clean kitchen.',
    points: 20,
  },
  {
    id: 'user-3',
    username: 'carol',
    name: 'Carol Davis',
    image: 'https://i.pravatar.cc/150?img=3',
    bio: 'Vacuum master.',
    points: 10,
  },
]

// ----- Grup de prova -----
export const DUMMY_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: 'Flatmates',
    createdBy: 'user-1',
    members: DUMMY_USERS,
    createdAt: '2025-05-15T08:00:00Z',
  },
]

// ----- Historial de completions -----
export const DUMMY_COMPLETIONS: Completion[] = [
  {
    id: 'comp-1',
    taskId: 'task-1',
    userId: 'user-2',
    completedAt: '2025-05-20T09:00:00Z',
  },
  {
    id: 'comp-2',
    taskId: 'task-2',
    userId: 'user-3',
    completedAt: '2025-05-21T08:00:00Z',
  },
]

// ----- Tasques falses -----
export const DUMMY_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Take out the trash',
    description: 'Collect all bins…',
    createdAt: '2025-05-10T12:00:00Z',
    groupId: 'group-1',
    assignedTo: DUMMY_USERS[1], // Bob
    points: DUMMY_COMPLETIONS.filter(c => c.taskId === 'task-1').length * 10,
    completed:      DUMMY_COMPLETIONS.some(c => c.taskId === 'task-1'),
    dueDate: '2025-05-22',
    frequency: 'weekly',
    completedBy: DUMMY_COMPLETIONS.filter(c => c.taskId === 'task-1'),
  },
  {
    id: 'task-2',
    title: 'Clean the dishes',
    description: 'Wash, dry and put away all dishes.',
    createdAt: '2025-05-12T14:30:00Z',
    groupId: 'group-1',
    assignedTo:  DUMMY_USERS[2], // Bob i Carol
    dueDate: '2025-05-21',
    frequency: 'daily',
    completedBy: DUMMY_COMPLETIONS.filter(c => c.taskId === 'task-2'),
  },
  {
    id: 'task-3',
    title: 'Vacuum living room',
    description: 'Vacuum under the sofa and carpets.',
    createdAt: '2025-05-14T09:45:00Z',
    groupId: 'group-1',
    assignedTo: DUMMY_USERS[2], // Carol
    dueDate: '2025-05-23',
    frequency: 'once',
    completedBy: [], // encara no s'ha marcat
  },
]
