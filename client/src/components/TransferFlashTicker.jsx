import styles from './TransferFlashTicker.module.css';

const FLASHES = [
  { tag: 'OFFICIEL', text: 'GORDON rejoint le FC Barcelone pour 80M€' },
  { tag: 'OFFICIEL', text: 'CUCURELLA signe au Real Madrid — 55M€, contrat 6 ans' },
  { tag: 'OFFICIEL', text: 'BERNARDO SILVA rejoint le Real Madrid en tant que joueur libre' },
  { tag: 'OFFICIEL', text: 'JACQUET rejoint Liverpool — 60M€ + 5M de bonus' },
  { tag: 'OFFICIEL', text: 'QUENDA s\'engage avec Chelsea pour 52M€' },
  { tag: 'OFFICIEL', text: 'VAN HECKE rejoint Tottenham pour 52M€' },
  { tag: 'OFFICIEL', text: 'HINCAPIÉ permanent à Arsenal — 35M€' },
  { tag: 'OFFICIEL', text: 'HOJLUND reste à Naples — Napoli lève l\'option d\'achat (43M€)' },
  { tag: 'INFO', text: 'BARCOLA (PSG) ouvert à un départ — Liverpool et Chelsea sur les rangs' },
  { tag: 'INFO', text: 'AKLIOUCHE (Monaco) a donné son accord de principe au PSG' },
  { tag: 'INFO', text: 'DIOMANDÉ (Leipzig) très proche du PSG — accord quasi signé' },
  { tag: 'INFO', text: 'KANG-IN LEE (PSG) vers l\'Atlético de Madrid pour 35M€' },
  { tag: 'INFO', text: 'MORGAN ROGERS convoité par Chelsea et Arsenal — Villa réclame un record' },
  { tag: 'INFO', text: 'BOUADDI (LOSC) dans le viseur du PSG pour renforcer le milieu' },
];

export default function TransferFlashTicker() {
  const items = [...FLASHES, ...FLASHES];

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
