// ============================================================================
//  contexts/AuthContext.jsx — état d'authentification partagé
//  Un "contexte" React permet de partager une valeur (ici : l'utilisateur
//  connecté) avec tous les composants sans la passer de parent en enfant.
//
//  Utilisation dans un composant :  const { user, login, logout } = useAuth();
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../hooks/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // l'utilisateur connecté (ou null)
  const [loading, setLoading] = useState(true); // true tant qu'on vérifie le jeton au démarrage

  // Au chargement de l'appli : si un jeton est en mémoire, on récupère le profil.
  useEffect(() => {
    const token = localStorage.getItem('kz_token');
    if (!token) { setLoading(false); return; }         // pas de jeton -> pas connecté
    api.get('/auth/me')
      .then((r) => setUser(r.data))                    // jeton valide -> on connaît l'utilisateur
      .catch(() => localStorage.removeItem('kz_token')) // jeton invalide/expiré -> on le jette
      .finally(() => setLoading(false));
  }, []);

  // Connexion : appelle l'API, stocke le jeton, met à jour l'utilisateur.
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('kz_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  // Inscription : même principe que login.
  const register = useCallback(async (email, password, username) => {
    const { data } = await api.post('/auth/register', { email, password, username });
    localStorage.setItem('kz_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  // Déconnexion : on efface le jeton et l'utilisateur.
  const logout = useCallback(() => {
    localStorage.removeItem('kz_token');
    setUser(null);
  }, []);

  // Tout ce qui est dans "value" devient accessible via useAuth().
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

// Petit raccourci pour lire le contexte dans n'importe quel composant.
export const useAuth = () => useContext(AuthContext);
