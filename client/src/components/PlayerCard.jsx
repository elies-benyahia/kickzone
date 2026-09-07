// PlayerCard — carte d'un transfert (page Transferts) : photo, badge Officiel/Rumeur, infos, montant.

import { useState } from 'react';
import styles from '../pages/Transferts.module.css';

export default function PlayerCard({ deal }) {
  const [imgError, setImgError] = useState(false);
  // Initiales de secours si l'image ne charge pas : "Enzo Fernández" -> "EF"
  const initial = deal.player.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <article className={styles.dealCard}>
      <div className={styles.dealImgWrap}>
        {!imgError
          ? <img src={deal.image} alt={deal.player} className={styles.dealImg} onError={() => setImgError(true)} />
          : <div className={styles.dealImgFallback}>{initial}</div>}
        <span className={`${styles.dealBadge} ${deal.official ? styles.dealDone : styles.dealPending}`}>
          {deal.official ? 'Officiel' : 'Rumeur'}
        </span>
      </div>

      <div className={styles.dealBody}>
        <div className={styles.dealHeader}>
          <span className={styles.dealFlag}>{deal.flag}</span>
          <span className={styles.dealDate}>{deal.date}</span>
          <span className={styles.dealPos}>{deal.position}</span>
        </div>

        <h3 className={styles.dealPlayer}>{deal.player}</h3>
        <p className={styles.dealNat}>{deal.nationality} · {deal.age} ans</p>

        <div className={styles.dealTransfer}>
          <span className={styles.dealFrom}>{deal.from}</span>
          <span className={styles.dealArrow}>→</span>
          <span className={styles.dealTo}>{deal.to}</span>
        </div>

        <div className={styles.dealFee}>{deal.fee}</div>
        <p className={styles.dealDesc}>{deal.desc}</p>
      </div>
    </article>
  );
}
