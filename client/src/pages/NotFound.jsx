import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.ball}>⚽</div>
      <h1 className={styles.code}>404</h1>
      <p className={styles.msg}>Ce contenu est hors-jeu !</p>
      <p className={styles.sub}>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn btn-primary" style={{marginTop:'1.5rem'}}>← Retour à l'accueil</Link>
    </div>
  );
}
