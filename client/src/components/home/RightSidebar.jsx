// RightSidebar (accueil) — liste courte des gros transferts (données dans src/data/homeContent.js).

import { Link } from 'react-router-dom';
import { SIDEBAR_DEALS } from '../../data/homeContent';
import styles from '../../pages/Home.module.css';

export default function RightSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Mercato 2026</h2>
        <Link to="/transferts" className={styles.seeAll}>Tout voir</Link>
      </div>
      {SIDEBAR_DEALS.map((d, i) => (
        <div key={i} className={styles.transferItem}>
          <div className={styles.transferInfo}>
            <span className={styles.transferPlayer}>{d.player}</span>
            <span className={styles.transferArrow}>{d.from} → {d.to}</span>
          </div>
          <span className={`${styles.transferFee} ${d.official ? styles.feeOfficial : styles.feePending}`}>{d.fee}</span>
        </div>
      ))}
    </aside>
  );
}
