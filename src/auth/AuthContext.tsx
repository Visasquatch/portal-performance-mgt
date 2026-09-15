import { useState, type ReactNode } from 'react';
import type { User } from '../api/types';
import { AuthContext } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (u: User) => setUser(u);
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}