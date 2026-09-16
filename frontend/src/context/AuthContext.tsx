import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../lib/api';
import type { Role, User } from '../types';

const TOKEN_KEY = 'kulture.session.token';
const USER_KEY = 'kulture.session.user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isBooting: boolean;
  isAuthenticating: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = () => {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = readStoredUser();
    if (!storedToken || !storedUser) {
      setIsBooting(false);
      return;
    }

    // Revalidate persisted sessions so role-gated CRUD never trusts stale browser state.
    authApi.profile(storedToken)
      .then((profile) => {
        setToken(storedToken);
        setUser(profile);
        window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      })
      .finally(() => setIsBooting(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const response = await authApi.login(email, password);
      const userData = response.user ?? (response as unknown as User);
      window.localStorage.setItem(TOKEN_KEY, response.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setToken(response.token);
      setUser(userData);
      return userData;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
    [user],
  );

  const value = useMemo(
    () => ({ user, token, isBooting, isAuthenticating, signIn, signOut, hasRole }),
    [user, token, isBooting, isAuthenticating, signIn, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
};
