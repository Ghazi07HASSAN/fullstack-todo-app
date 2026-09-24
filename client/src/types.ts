// client/src/types.ts

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at?: string;
}

export type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';