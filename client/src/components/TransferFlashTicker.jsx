// ============================================================================
//  TransferFlashTicker — bandeau "MERCATO" défilant en haut du site (dans la Navbar).
//  Le texte défile en boucle grâce à une animation CSS ; ici on se contente
//  d'afficher deux fois la liste pour que la boucle soit sans "trou".
// ============================================================================

import styles from './TransferFlashTicker.module.css';

// Brèves affichées. tag "OFFICIEL" = transfert acté, tag "INFO" = rumeur.
const FLASHES = [
  { tag: 'OFFICIEL', text: 'ENZO FERNÁNDEZ signe à Manchester City pour 145M€ (record de l\'été)' },
  { tag: 'OFFICIEL', text: 'DIOMANDÉ rejoint le Real Madrid — 130M€ en provenance de Leipzig' },
  { tag: 'OFFICIEL', text: 'BARCOLA (PSG) s\'engage à Liverpool — 125M€ + 20M€ de bonus' },
  { tag: 'OFFICIEL', text: 'BRUNO GUIMARÃES quitte Newcastle pour Arsenal — 85M€' },
  { tag: 'OFFICIEL', text: 'RODRI quitte Manchester City pour le FC Barcelone — 75M€' },
  { tag: 'OFFICIEL', text: 'GORDON rejoint le FC Barcelone pour 70M€' },
  { tag: 'OFFICIEL', text: 'GONÇALO RAMOS (PSG) file à l\'AC Milan — 70M€' },
  { tag: 'OFFICIEL', text: 'FERRAN TORRES quitte le Barça pour le PSG — 48M€' },
  { tag: 'OFFICIEL', text: 'GREENWOOD (Marseille) rejoint Fenerbahçe pour 39M€' },
  { tag: 'OFFICIEL', text: 'GIROUD revient en Ligue 1, à Lille, libre' },
  { tag: 'INFO', text: 'VINÍCIUS JR : offre XXL d\'Al-Hilal, le Real n\'a rien confirmé' },
  { tag: 'INFO', text: 'HAALAND : la presse anglaise évoque un intérêt du Real Madrid' },
  { tag: 'INFO', text: 'RAFAEL LEÃO (Milan) apprécié par le PSG pour cet hiver' },
];

export default function TransferFlashTicker() {
  const items = [...FLASHES, ...FLASHES]; // liste doublée -> défilement en boucle continue

  return (
    <div className={styles.bar}>
      <div className={styles.label}>MERCATO</div>
      <div className={styles.track}>
        <div className={styles.rail}>
          {items.map((f, i) => (
            <span key={i} className={styles.item}>
              <span className={`${styles.tag} ${f.tag === 'OFFICIEL' ? styles.tagOfficiel : styles.tagInfo}`}>
                {f.tag}
              </span>
              <span className={styles.text}>{f.text}</span>
              <span className={styles.sep} aria-hidden="true">—</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
