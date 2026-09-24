// client/src/types.ts

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  user_id?: number;
  created_at?: string;
}

export interface User {
  id: number;
  email: string;
}

export type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';