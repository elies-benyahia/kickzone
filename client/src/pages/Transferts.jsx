import { useState } from 'react';
import { useArticles, useTransferNews } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Transferts.module.css';

/* ─── Données réelles mercato été 2026 ─────────────────────────────── */
const DEALS = [
  {
    player: 'Anthony Gordon',
    from: 'Newcastle United',
    to: 'FC Barcelone',
    fee: '80M€',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    date: '30 Mai 2026',
    official: true,
    position: 'Ailier gauche',
    age: 25,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthony_Gordon_%28footballer%2C_born_2001%29.jpg',
    desc: "L'ailier anglais réalise son rêve en rejoignant le Barça après une saison exceptionnelle (17 buts dont 10 en C1).",
  },
  {
    player: 'Marc Cucurella',
    from: 'Chelsea',
    to: 'Real Madrid',
    fee: '55M€',
    flag: '🇪🇸',
    date: '15 Juin 2026',
    official: true,
    position: 'Défenseur gauche',
    age: 26,
    nationality: 'Espagnol',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Marc_Cucurella_(cropped).jpg',
    desc: "Malgré son passé au Barça, Cucurella franchit le pas et rejoint la Casa Blanca pour 6 ans. Titulaire avec l'Espagne au Mondial.",
  },
  {
    player: 'Bernardo Silva',
    from: 'Manchester City',
    to: 'Real Madrid',
    fee: 'Libre',
    flag: '🇵🇹',
    date: 'Juin 2026',
    official: true,
    position: 'Milieu offensif',
    age: 31,
    nationality: 'Portugais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bernardo_Silva_-_Portugal_vs_Republic_of_Ireland_2021_%28cropped%29.jpg',
    desc: "Après 9 saisons à City, le capitaine rejoint Mourinho au Real Madrid en tant que joueur libre. Contrat de 2 ans.",
  },
  {
    player: 'Jérémy Jacquet',
    from: 'Stade Rennais',
    to: 'Liverpool',
    fee: '60M€',
    flag: '🇫🇷',
    date: '1er Juil 2026',
    official: true,
    position: 'Défenseur central',
    age: 20,
    nationality: 'Français',
    image: 'https://images.fotmob.com/image_resources/playerimages/1473534.png',
    desc: "Le jeune défenseur rennais avait décliné Chelsea pour Liverpool. Slot a fait de lui sa priorité absolue pour succéder à Van Dijk.",
  },
  {
    player: 'Geovany Quenda',
    from: 'Sporting CP',
    to: 'Chelsea',
    fee: '52M€',
    flag: '🇵🇹',
    date: '1er Juil 2026',
    official: true,
    position: 'Ailier droit',
    age: 17,
    nationality: 'Portugais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Geovany_Quenda.jpg',
    desc: "L'une des plus grandes pépites d'Europe. À seulement 17 ans, Chelsea mise gros sur ce phénomène du Sporting.",
  },
  {
    player: 'Jan Paul van Hecke',
    from: 'Brighton',
    to: 'Tottenham',
    fee: '52M€',
    flag: '🇳🇱',
    date: 'Juin 2026',
    official: true,
    position: 'Défenseur central',
    age: 26,
    nationality: 'Néerlandais',
    image: 'https://images.fotmob.com/image_resources/playerimages/974618.png',
    desc: "De Zerbi retrouve son protégé de Brighton. Van Hecke rejoint Tottenham pour renforcer la défense avant la C1.",
  },
  {
    player: 'Piero Hincapié',
    from: 'Bayer Leverkusen',
    to: 'Arsenal',
    fee: '35M€',
    flag: '🇪🇨',
    date: '25 Juin 2026',
    official: true,
    position: 'Défenseur / Latéral',
    age: 24,
    nationality: 'Équatorien',
    image: 'https://images.fotmob.com/image_resources/playerimages/1137667.png',
    desc: "Arsenal lève l'option d'achat sur le défenseur équatorien après une saison pleine. 39 matchs toutes compétitions confondues.",
  },
  {
    player: 'Rasmus Hojlund',
    from: 'Manchester United',
    to: 'Napoli',
    fee: '43M€',
    flag: '🇩🇰',
    date: 'Juin 2026',
    official: true,
    position: 'Attaquant centre',
    age: 23,
    nationality: 'Danois',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rasmushøjlund.jpg',
    desc: "Après une période difficile à Old Trafford, Hojlund retrouve le sourire à Naples. Napoli lève l'option de son prêt.",
  },
  {
    player: 'Quinten Timber',
    from: 'Feyenoord',
    to: 'Olympique de Marseille',
    fee: '18M€',
    flag: '🇳🇱',
    date: 'Juin 2026',
    official: true,
    position: 'Milieu',
    age: 24,
    nationality: 'Néerlandais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Quinten_Timber_2022.jpg',
    desc: "Frère cadet de Jurrien Timber, le milieu néerlandais rejoint l'OM pour renforcer l'entrejeu sous Conceiçao.",
  },
  {
    player: 'Yan Diomandé',
    from: 'RB Leipzig',
    to: 'PSG',
    fee: '~100M€',
    flag: '🇨🇮',
    date: 'En négociation',
    official: false,
    position: 'Milieu défensif',
    age: 22,
    nationality: 'Ivoirien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yan_Diomande.jpg',
    desc: "Le PSG très confiant pour signer le phénomène ivoirien de Leipzig. Le joueur a confirmé son accord de principe.",
  },
  {
    player: 'Kang-in Lee',
    from: 'PSG',
    to: 'Atlético de Madrid',
    fee: '35M€',
    flag: '🇰🇷',
    date: 'En cours',
    official: false,
    position: 'Milieu offensif',
    age: 24,
    nationality: 'Sud-Coréen',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kang-in_Lee_2023.jpg',
    desc: "Kang-in Lee ne s'est jamais imposé comme titulaire indiscutable à Paris. L'Atlético profite pour attirer le Sud-Coréen.",
  },
];

function PlayerCard({ deal }) {
  const [imgError, setImgError] = useState(false);
  const initial = deal.player.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <article className={styles.dealCard}>
      <div className={styles.dealImgWrap}>
        {!imgError ? (
          <img
            src={deal.image}
            alt={deal.player}
            className={styles.dealImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.dealImgFallback}>{initial}</div>
        )}
        <span className={`${styles.dealBadge} ${deal.official ? styles.dealDone : styles.dealPending}`}>
          {deal.official ? 'Officiel' : 'En cours'}
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

export default function Transferts() {
  const [search, setSearch] = useState('');
  const { data: articlesData } = useArticles({ category: 'TRANSFERT', limit: 20 });
  const { data: news, isLoading: newsLoading } = useTransferNews();
  const articles = articlesData?.data ?? [];

  const filtered = DEALS.filter(d =>
    d.player.toLowerCase().includes(search.toLowerCase()) ||
    d.from.toLowerCase().includes(search.toLowerCase()) ||
    d.to.toLowerCase().includes(search.toLowerCase())
  );
  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '1.5rem var(--gutter)' }}>

      {/* Ticker RSS */}
      {news && news.length > 0 && (
        <div className={styles.ticker}>
          {news.slice(0, 12).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className={styles.tickerItem}>
              <strong>{item.source}</strong> — {item.title}
            </a>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>

          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Mercato Été 2026</h1>
              <p className={styles.subtitle}>
                Tous les transferts officiels et en cours · mis à jour en direct
              </p>
            </div>
            <input
              className={styles.search}
              placeholder="Chercher joueur, club..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Stats rapides */}
          <div className={styles.stats}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{DEALS.filter(d => d.official).length}</span>
              <span className={styles.statLabel}>Transferts officiels</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{DEALS.filter(d => !d.official).length}</span>
              <span className={styles.statLabel}>En négociation</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>
                {DEALS.filter(d => d.official && d.fee !== 'Libre' && !d.fee.includes('~')).reduce((acc, d) => acc + parseInt(d.fee), 0)}M€
              </span>
              <span className={styles.statLabel}>Volume officiel</span>
            </div>
          </div>

          {/* Grille des deals */}
          <div>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                Officiels — {filtered.filter(d => d.official).length} transferts
              </h2>
            </div>
            <div className={styles.dealsGrid}>
              {filtered.filter(d => d.official).map((d, i) => (
                <PlayerCard key={i} deal={d} />
              ))}
            </div>
          </div>

          {filtered.filter(d => !d.official).length > 0 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  En négociation — {filtered.filter(d => !d.official).length} dossiers
                </h2>
              </div>
              <div className={styles.dealsGrid}>
                {filtered.filter(d => !d.official).map((d, i) => (
                  <PlayerCard key={i} deal={d} />
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          {filteredArticles.length > 0 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Articles de la rédaction</h2>
              </div>
              <div className={styles.grid}>
                {filteredArticles.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Brèves mercato</h2>
          {newsLoading && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chargement...</p>}
          {(news ?? []).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className={styles.newsItem}>
              <div className={styles.newsMeta}>
                <span className={styles.newsSource}>{item.source}</span>
                <span className={styles.newsDate}>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className={styles.newsTitle}>{item.title}</p>
            </a>
          ))}
          {!newsLoading && (!news || news.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aucune actualité disponible.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
