import { createContext } from 'react';
import type { User } from '../api/types';

export interface AuthValue {
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthValue | null>(null);