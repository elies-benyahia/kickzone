// ============================================================================
//  main.jsx — point d'entrée du front-end
//  C'est le premier fichier JS exécuté par le navigateur.
//  Il "monte" le composant <App /> dans la page HTML (la div #root).
// ============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';           // styles globaux (variables de couleur, reset...)
import App from './App.jsx';

// createRoot(...).render(...) : React prend le contrôle de <div id="root">.
// <StrictMode> : mode développement plus strict (détecte certains bugs).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
