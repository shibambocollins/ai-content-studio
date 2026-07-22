import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../lib/api.js';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authError, setAuthError] = useState('');
  const [bootstrapping, setBootstrapping] = useState(true);

  const refreshHistory = useCallback(async () => {
    try {
      const { history: items } = await api.getHistory();
      setHistory(items);
    } catch {
      // Token likely expired/invalid — log the user out quietly.
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  // On load, if we have a stored token, treat the user as logged in and
  // hydrate their history. We don't store a full "session" server-side
  // beyond the JWT itself, so we trust the token until an API call rejects it.
  useEffect(() => {
    const stored = tokenStore.get();
    const storedUser = localStorage.getItem('ai-studio-user');
    if (stored && storedUser) {
      setUser(JSON.parse(storedUser));
      refreshHistory().finally(() => setBootstrapping(false));
    } else {
      setBootstrapping(false);
    }
  }, [refreshHistory]);

  const login = async (email, password) => {
    setAuthError('');
    try {
      const { token, user: loggedInUser } = await api.login(email, password);
      tokenStore.set(token);
      localStorage.setItem('ai-studio-user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      await refreshHistory();
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setAuthError('');
    try {
      const { token, user: newUser } = await api.register(name, email, password);
      tokenStore.set(token);
      localStorage.setItem('ai-studio-user', JSON.stringify(newUser));
      setUser(newUser);
      setHistory([]);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem('ai-studio-user');
    setUser(null);
    setHistory([]);
    setCurrentView('dashboard');
  };

  const value = {
    user,
    login,
    register,
    logout,
    authError,
    bootstrapping,
    currentView,
    setCurrentView,
    history,
    refreshHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
