// App.jsx — structure de l'appli : fournit React Query + le contexte d'auth, et déclare les routes (URL -> page).

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

// Réglages communs à tous les appels API (cache 5 min, 1 seule nouvelle tentative).
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

// lazy() : chaque page n'est téléchargée que lorsqu'on y accède.
const Home        = lazy(() => import('./pages/Home'));
const Matches     = lazy(() => import('./pages/Matches'));
const Match       = lazy(() => import('./pages/Match'));
const Transferts  = lazy(() => import('./pages/Transferts'));
const Actu        = lazy(() => import('./pages/Actu'));
const Article     = lazy(() => import('./pages/Article'));
const Classements = lazy(() => import('./pages/Classements'));
const LigueDesChampions = lazy(() => import('./pages/LigueDesChampions'));
const Pronos      = lazy(() => import('./pages/Pronos'));
const Admin       = lazy(() => import('./pages/Admin'));
const AdminLogin  = lazy(() => import('./pages/AdminLogin'));
const Joueurs     = lazy(() => import('./pages/Joueurs'));
const Joueur      = lazy(() => import('./pages/Joueur'));
const Equipes     = lazy(() => import('./pages/Equipes'));
const NotFound    = lazy(() => import('./pages/NotFound'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const Profile     = lazy(() => import('./pages/Profile'));

const Loader = () => (
  <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
    Chargement...
  </div>
);

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin'); // pages admin : pas de Navbar publique

  // Applique le thème clair si l'utilisateur l'avait choisi.
  useEffect(() => {
    const saved = localStorage.getItem('kz_theme');
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  }, []);

  return (
    <>
      {!isAdmin && <Navbar />}
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* URL -> page. ":id" / ":slug" = paramètre variable. */}
          <Route path="/"                    element={<Home />} />
          <Route path="/matches"             element={<Matches />} />
          <Route path="/match/:id"           element={<Match />} />
          <Route path="/transferts"          element={<Transferts />} />
          <Route path="/actu"                element={<Actu />} />
          <Route path="/article/:slug"       element={<Article />} />
          <Route path="/classements"         element={<Classements />} />
          <Route path="/ligue-des-champions" element={<LigueDesChampions />} />
          <Route path="/pronos"              element={<Pronos />} />
          <Route path="/admin"               element={<Admin />} />
          <Route path="/admin/login"         element={<AdminLogin />} />
          <Route path="/joueurs"             element={<Joueurs />} />
          <Route path="/joueur/:id"          element={<Joueur />} />
          <Route path="/equipes/:id"         element={<Equipes />} />
          <Route path="/connexion"           element={<Login />} />
          <Route path="/inscription"         element={<Register />} />
          <Route path="/profil"              element={<Profile />} />
          <Route path="*"                    element={<NotFound />} /> {/* URL inconnue -> 404 */}
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>   {/* cache des appels API */}
      <BrowserRouter>                            {/* gère l'URL / la navigation */}
        <AuthProvider>                           {/* expose l'utilisateur connecté */}
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'var(--font)', fontSize: '0.85rem' } }} />
    </QueryClientProvider>
  );
}
