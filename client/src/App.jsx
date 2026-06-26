import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';

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

const Loader = () => <div style={{minHeight:'40vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontWeight:600}}>Chargement...</div>;

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/matches"       element={<Matches />} />
          <Route path="/match/:id"     element={<Match />} />
          <Route path="/transferts"    element={<Transferts />} />
          <Route path="/actu"          element={<Actu />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/classements"   element={<Classements />} />
          <Route path="/pronos"        element={<Pronos />} />
          <Route path="/admin"         element={<Admin />} />
          <Route path="/admin/login"   element={<AdminLogin />} />
          <Route path="/joueurs"       element={<Joueurs />} />
          <Route path="/joueur/:id"    element={<Joueur />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style:{ fontFamily:'var(--font)', fontSize:'0.85rem' } }} />
    </QueryClientProvider>
  );
}
