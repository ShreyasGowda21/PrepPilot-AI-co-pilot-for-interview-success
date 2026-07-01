// Auth context. The browser carries the session via an httpOnly cookie that
// the server sets on login/register; the frontend never sees the token. We
// only persist the user profile locally so the navbar can render the user's
// name across reloads.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';

export const AuthContext = createContext(null);

const USER_KEY = 'mockmate_user';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persistUser = useCallback((next) => {
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
    else localStorage.removeItem(USER_KEY);
    setUser(next);
  }, []);

  // On mount, ask the server who we are. The cookie travels automatically; if
  // it's valid we get the user back, otherwise the request 401s and we treat
  // the user as logged out.
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await authApi.me();
        if (active) persistUser(res.user);
      } catch {
        if (active) persistUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [persistUser]);

  const register = useCallback(
    async (payload) => {
      setError(null);
      const res = await authApi.register(payload);
      persistUser(res.user);
      return res.user;
    },
    [persistUser]
  );

  const login = useCallback(
    async (payload) => {
      setError(null);
      const res = await authApi.login(payload);
      persistUser(res.user);
      return res.user;
    },
    [persistUser]
  );

  const logout = useCallback(async () => {
    // Best-effort server logout (clears the cookie). Don't fail the UI if it
    // doesn't reach the server — the local state still needs to clear.
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback(
    (next) => {
      persistUser(next);
    },
    [persistUser]
  );

  const value = useMemo(
    () => ({ user, loading, error, register, login, logout, updateUser, setError }),
    [user, loading, error, register, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
