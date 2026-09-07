// contexts/AuthContext.jsx — partage l'utilisateur connecté à toute l'appli.
// Usage :  const { user, login, logout } = useAuth();

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../hooks/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // utilisateur connecté (ou null)
  const [loading, setLoading] = useState(true);  // true pendant la vérif du jeton au démarrage

  // Au démarrage : si un jeton est en mémoire, on récupère le profil.
  useEffect(() => {
    const token = localStorage.getItem('kz_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('kz_token')) // jeton invalide -> on le jette
      .finally(() => setLoading(false));
  }, []);

  // login / register : appellent l'API, stockent le jeton, mettent à jour user.
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('kz_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (email, password, username) => {
    const { data } = await api.post('/auth/register', { email, password, username });
    localStorage.setItem('kz_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kz_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
