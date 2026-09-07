// ============================================================================
//  App.jsx — structure générale de l'application
//   - fournit React Query (cache des appels API) à toute l'appli
//   - fournit le contexte d'authentification (utilisateur connecté)
//   - déclare la table des routes (URL -> page)
// ============================================================================

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast'; // petites notifications ("Pronostic publié !")
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

// Configuration commune à tous les appels API :
//  - staleTime 5 min : une donnée déjà chargée est considérée "fraîche" 5 min
//  - retry 1 : une seule nouvelle tentative en cas d'échec
//  - refetchOnWindowFocus false : ne recharge pas quand on revient sur l'onglet
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

// lazy(...) : chaque page est chargée seulement quand on y accède
// (le navigateur ne télécharge pas tout le site d'un coup -> démarrage plus rapide).
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

// Affiché pendant le chargement d'une page (fallback de <Suspense>).
const Loader = () => (
  <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
    Chargement...
  </div>
);

// Barre de navigation + zone de contenu (la page correspondant à l'URL).
function AppLayout() {
  const location = useLocation();                       // URL courante
  const isAdmin = location.pathname.startsWith('/admin'); // pages admin : pas de Navbar publique

  // Au premier rendu : applique le thème clair si l'utilisateur l'avait choisi.
  useEffect(() => {
    const saved = localStorage.getItem('kz_theme');
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  }, []);

  return (
    <>
      {!isAdmin && <Navbar />}
      {/* <Suspense> affiche <Loader/> le temps que la page "lazy" se télécharge */}
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Chaque <Route> associe une URL à une page. ":id" / ":slug" = paramètre variable. */}
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
          <Route path="*"                    element={<NotFound />} /> {/* toute autre URL -> 404 */}
        </Routes>
      </Suspense>
    </>
  );
}

// Composant racine : empile les "fournisseurs" (providers) autour de l'appli.
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>      {/* cache des appels API */}
      <BrowserRouter>                               {/* gère la navigation / l'URL */}
        <AuthProvider>                              {/* expose l'utilisateur connecté */}
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'var(--font)', fontSize: '0.85rem' } }} />
    </QueryClientProvider>
  );
}
