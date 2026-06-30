import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

const Home        = lazy(() => import('./pages/Home'));
const Matches     = lazy(() => import('./pages/Matches'));
const Match       = lazy(() => import('./pages/Match'));
const Transferts  = lazy(() => import('./pages/Transferts'));
const Actu        = lazy(() => import('./pages/Actu'));
const Article     = lazy(() => import('./pages/Article'));
const Classements = lazy(() => import('./pages/Classements'));
const Pronos      = lazy(() => import('./pages/Pronos'));
const Admin       = lazy(() => import('./pages/Admin'));
const AdminLogin  = lazy(() => import('./pages/AdminLogin'));
const Joueurs     = lazy(() => import('./pages/Joueurs'));
const Joueur      = lazy(() => import('./pages/Joueur'));
const Equipes     = lazy(() => import('./pages/Equipes'));
const NotFound    = lazy(() => import('./pages/NotFound'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const Profile      = lazy(() => import('./pages/Profile'));
const CoupeDuMonde  = lazy(() => import('./pages/CoupeDuMonde'));
const Competition   = lazy(() => import('./pages/Competition'));

const Loader = () => (
  <div style={{minHeight:'40vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontWeight:600}}>
    Chargement...
  </div>
);

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const saved = localStorage.getItem('kz_theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  return (
    <>
      {!isAdmin && <Navbar />}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/matches"        element={<Matches />} />
          <Route path="/match/:id"      element={<Match />} />
          <Route path="/transferts"     element={<Transferts />} />
          <Route path="/actu"           element={<Actu />} />
          <Route path="/article/:slug"  element={<Article />} />
          <Route path="/classements"    element={<Classements />} />
          <Route path="/pronos"         element={<Pronos />} />
          <Route path="/admin"          element={<Admin />} />
          <Route path="/admin/login"    element={<AdminLogin />} />
          <Route path="/joueurs"        element={<Joueurs />} />
          <Route path="/joueur/:id"     element={<Joueur />} />
          <Route path="/equipes/:id"    element={<Equipes />} />
          <Route path="/connexion"        element={<Login />} />
          <Route path="/inscription"      element={<Register />} />
          <Route path="/profil"           element={<Profile />} />
          <Route path="/coupe-du-monde"    element={<CoupeDuMonde />} />
          <Route path="/competition/:id"  element={<Competition />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style:{ fontFamily:'var(--font)', fontSize:'0.85rem' } }} />
    </QueryClientProvider>
  );
}
