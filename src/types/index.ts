export type MovementType = 'income' | 'expense';

export interface Movement {
  id?: string;
  userId: string;
  amount: number;
  type: MovementType;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  isNecessary: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id?: string;
  userId: string;
  name: string;
  type: MovementType;
  createdAt: number;
}
