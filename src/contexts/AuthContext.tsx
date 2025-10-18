import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, ChatUser } from '../lib/supabase';

interface AuthContextType {
  user: ChatUser | null;
  loading: boolean; // Add loading to the context type
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading to true

  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Set loading to false after the check is complete
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('chat_users')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    setUser(data);
    localStorage.setItem('chatUser', JSON.stringify(data));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}