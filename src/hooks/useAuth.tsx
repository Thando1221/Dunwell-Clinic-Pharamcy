import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Clear any saved authentication on app start to always show login
  useEffect(() => {
    localStorage.removeItem('clinic-user');
    setUser(null);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('clinic-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinic-user');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "P";

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};