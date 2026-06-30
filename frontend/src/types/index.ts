export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export type RoadmapNodeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  status: RoadmapNodeStatus;
  order: number;
  commands?: string[];
  resources?: string[];
  parentId?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  nodes: RoadmapNode[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface KanbanSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate?: string;
  subtasks: KanbanSubtask[];
  noteId?: string;
  roadmapNodeId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetric {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  timestamp: string;
}

export interface SystemProcess {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
}
