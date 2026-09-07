import { useState } from 'react';
import { useArticles, useTransferNews } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Transferts.module.css';

/* ─── Transferts du mercato d'été 2026 (annonces officielles des clubs) ───── */
const EN = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
const DEALS = [
  {
    player: 'Enzo Fernández', from: 'Chelsea', to: 'Manchester City', fee: '145M€',
    flag: '🇦🇷', date: '12 Août 2026', official: true, position: 'Milieu central', age: 25,
    nationality: 'Argentin',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Enzo_Fern%C3%A1ndez_2023.jpg',
    desc: "Transfert le plus cher de l'été : City casse sa tirelire pour le champion du monde argentin, chargé d'orchestrer le jeu de Guardiola.",
  },
  {
    player: 'Yan Diomandé', from: 'RB Leipzig', to: 'Real Madrid', fee: '130M€',
    flag: '🇨🇮', date: '5 Août 2026', official: true, position: 'Ailier', age: 20,
    nationality: 'Ivoirien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yan_Diomand%C3%A9.jpg',
    desc: 'Le Real s’offre l’une des plus grosses promesses du football européen après une saison XXL en Bundesliga.',
  },
  {
    player: 'Bradley Barcola', from: 'Paris Saint-Germain', to: 'Liverpool', fee: '125M€',
    flag: '🇫🇷', date: '20 Juil 2026', official: true, position: 'Ailier', age: 23,
    nationality: 'Français',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bradley_Barcola_2023.jpg',
    desc: 'Après trois saisons à Paris, l’international français rejoint Anfield pour 125 M€ plus 20 M€ de bonus.',
  },
  {
    player: 'Morgan Rogers', from: 'Aston Villa', to: 'Chelsea', fee: '110M€',
    flag: EN, date: '28 Juil 2026', official: true, position: 'Milieu offensif', age: 24,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Morgan_Rogers_2024.jpg',
    desc: 'Chelsea réinvestit une partie de la vente d’Enzo Fernández sur l’un des Anglais les plus en vue de la Premier League.',
  },
  {
    player: 'Savinho', from: 'Manchester City', to: 'Tottenham', fee: '88M€',
    flag: '🇧🇷', date: '30 Juil 2026', official: true, position: 'Ailier', age: 22,
    nationality: 'Brésilien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sav%C3%ADnho_2024.jpg',
    desc: 'Les Spurs frappent fort en récupérant l’ailier brésilien, barré par la concurrence à City.',
  },
  {
    player: 'Bruno Guimarães', from: 'Newcastle United', to: 'Arsenal', fee: '85M€',
    flag: '🇧🇷', date: '15 Juil 2026', official: true, position: 'Milieu central', age: 28,
    nationality: 'Brésilien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bruno_Guimar%C3%A3es_2019.jpg',
    desc: 'Arsenal s’attache les services du métronome brésilien pour densifier son entrejeu et viser le titre.',
  },
  {
    player: 'Carlos Baleba', from: 'Brighton', to: 'Manchester United', fee: '82M€',
    flag: '🇨🇲', date: '22 Juil 2026', official: true, position: 'Milieu défensif', age: 22,
    nationality: 'Camerounais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carlos_Baleba.jpg',
    desc: 'United mise sur la jeunesse et la puissance du Camerounais pour reconstruire son milieu de terrain.',
  },
  {
    player: 'Iliman Ndiaye', from: 'Everton', to: 'Manchester City', fee: '76M€',
    flag: '🇸🇳', date: '18 Août 2026', official: true, position: 'Ailier', age: 26,
    nationality: 'Sénégalais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Iliman_Ndiaye_2022.jpg',
    desc: 'City compense le départ de Savinho avec l’international sénégalais, étincelant sous le maillot d’Everton.',
  },
  {
    player: 'Rodri', from: 'Manchester City', to: 'FC Barcelone', fee: '75M€',
    flag: '🇪🇸', date: '25 Août 2026', official: true, position: 'Milieu défensif', age: 30,
    nationality: 'Espagnol',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rodri_2021.jpg',
    desc: 'Coup de tonnerre en fin de mercato : le Ballon d’Or 2024 quitte City pour revenir en Liga, au Barça.',
  },
  {
    player: 'Nicolas Jackson', from: 'Chelsea', to: 'Aston Villa', fee: '72M€',
    flag: '🇸🇳', date: '29 Juil 2026', official: true, position: 'Attaquant', age: 25,
    nationality: 'Sénégalais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nicolas_Jackson_2023.jpg',
    desc: 'Villa réinvestit l’argent de Morgan Rogers sur l’avant-centre sénégalais de Chelsea.',
  },
  {
    player: 'Gonçalo Ramos', from: 'Paris Saint-Germain', to: 'AC Milan', fee: '70M€',
    flag: '🇵🇹', date: '10 Juil 2026', official: true, position: 'Attaquant', age: 25,
    nationality: 'Portugais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gon%C3%A7alo_Ramos_2022.jpg',
    desc: 'Le buteur portugais quitte Paris pour devenir le fer de lance de l’attaque milanaise.',
  },
  {
    player: 'Anthony Gordon', from: 'Newcastle United', to: 'FC Barcelone', fee: '70M€',
    flag: EN, date: '20 Juin 2026', official: true, position: 'Ailier', age: 25,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anthony_Gordon_%28footballer%2C_born_2001%29.jpg',
    desc: 'Premier gros coup de l’été : l’ailier anglais rejoint le Barça après une saison à 17 buts.',
  },
  {
    player: 'Matías Fernández-Pardo', from: 'Lille', to: 'Newcastle United', fee: '60M€',
    flag: '🇧🇪', date: '5 Août 2026', official: true, position: 'Ailier', age: 21,
    nationality: 'Belge',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Football_pictogram.svg',
    desc: 'Newcastle réinvestit une partie du chèque Guimarães sur le jeune ailier belge du LOSC.',
  },
  {
    player: 'Maghnes Akliouche', from: 'AS Monaco', to: 'Paris Saint-Germain', fee: '50M€',
    flag: '🇫🇷', date: '1er Juil 2026', official: true, position: 'Milieu offensif', age: 24,
    nationality: 'Français',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Maghnes_Akliouche.jpg',
    desc: 'Paris rapatrie l’un des plus beaux talents de Ligue 1 pour succéder à Barcola sur le côté.',
  },
  {
    player: 'Ferran Torres', from: 'FC Barcelone', to: 'Paris Saint-Germain', fee: '48M€',
    flag: '🇪🇸', date: '15 Août 2026', official: true, position: 'Ailier', age: 26,
    nationality: 'Espagnol',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ferran_Torres_2021.jpg',
    desc: 'L’international espagnol quitte le Barça, où le temps de jeu manquait, pour rejoindre le PSG.',
  },
  {
    player: 'Diego Moreira', from: 'Strasbourg', to: 'AC Milan', fee: '45M€',
    flag: '🇵🇹', date: '8 Août 2026', official: true, position: 'Ailier', age: 21,
    nationality: 'Portugais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Football_pictogram.svg',
    desc: 'Milan poursuit son recrutement offensif avec le jeune ailier portugais révélé à Strasbourg.',
  },
  {
    player: 'Mason Greenwood', from: 'Olympique de Marseille', to: 'Fenerbahçe', fee: '39M€',
    flag: EN, date: '12 Août 2026', official: true, position: 'Ailier', age: 24,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mason_Greenwood_2019.jpg',
    desc: 'Après une saison pleine à Marseille, l’Anglais rejoint Fenerbahçe et la Ligue des Champions.',
  },
  {
    player: 'Guela Doué', from: 'Strasbourg', to: 'Bayer Leverkusen', fee: '37M€',
    flag: '🇫🇷', date: '20 Juil 2026', official: true, position: 'Latéral droit', age: 23,
    nationality: 'Français',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Football_pictogram.svg',
    desc: 'Leverkusen renforce son couloir droit avec le latéral français, frère de Désiré Doué.',
  },
  {
    player: 'Aladji Bamba', from: 'AS Monaco', to: 'Newcastle United', fee: '35M€',
    flag: '🇫🇷', date: '25 Juil 2026', official: true, position: 'Défenseur central', age: 20,
    nationality: 'Français',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Football_pictogram.svg',
    desc: 'Newcastle investit sur l’avenir avec le jeune défenseur central monégasque.',
  },
  {
    player: 'Djed Spence', from: 'Tottenham', to: 'Inter Milan', fee: '31M€',
    flag: EN, date: '18 Août 2026', official: true, position: 'Latéral droit', age: 25,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Football_pictogram.svg',
    desc: 'L’Inter reconstruit ses couloirs et récupère le latéral anglais, relancé aux Spurs.',
  },
  {
    player: 'Curtis Jones', from: 'Liverpool', to: 'Inter Milan', fee: '30M€',
    flag: EN, date: '22 Août 2026', official: true, position: 'Milieu central', age: 25,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Curtis_Jones_2021.jpg',
    desc: 'Le milieu formé à Liverpool tente l’aventure italienne pour gagner en temps de jeu.',
  },
  {
    player: 'Moussa Diaby', from: 'Al-Ittihad', to: 'Bayer Leverkusen', fee: '30M€',
    flag: '🇫🇷', date: '30 Juil 2026', official: true, position: 'Ailier', age: 26,
    nationality: 'Français',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Moussa_Diaby_2021.jpg',
    desc: 'Retour en Bundesliga pour l’ailier français, qui retrouve le club où il avait explosé.',
  },
  {
    player: 'Jakub Kiwior', from: 'Arsenal', to: 'FC Porto', fee: '22M€',
    flag: '🇵🇱', date: '14 Août 2026', official: true, position: 'Défenseur central', age: 26,
    nationality: 'Polonais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jakub_Kiwior_2023.jpg',
    desc: 'Le défenseur polonais quitte Arsenal pour du temps de jeu et la C1 avec Porto.',
  },
  {
    player: 'Amadou Haïdara', from: 'RB Leipzig', to: 'RC Lens', fee: '12M€',
    flag: '🇲🇱', date: '10 Août 2026', official: true, position: 'Milieu central', age: 28,
    nationality: 'Malien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amadou_Haidara_2019.jpg',
    desc: 'Lens réalise un joli coup avec l’expérimenté international malien en provenance de Leipzig.',
  },
  {
    player: 'Ansu Fati', from: 'FC Barcelone', to: 'AS Monaco', fee: '11M€',
    flag: '🇪🇸', date: '5 Juil 2026', official: true, position: 'Ailier', age: 23,
    nationality: 'Espagnol',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ansu_Fati_2021.jpg',
    desc: 'Monaco parie sur la relance de l’ex-pépite du Barça, freinée par les blessures.',
  },
  {
    player: 'Andy Robertson', from: 'Liverpool', to: 'Tottenham', fee: 'Libre',
    flag: '🏴', date: '1er Juil 2026', official: true, position: 'Latéral gauche', age: 32,
    nationality: 'Écossais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Andrew_Robertson_2018.jpg',
    desc: 'En fin de contrat, le capitaine écossais quitte Anfield après huit saisons et rejoint les Spurs libre.',
  },
  {
    player: 'John Stones', from: 'Manchester City', to: 'Inter Milan', fee: 'Libre',
    flag: EN, date: '8 Juil 2026', official: true, position: 'Défenseur central', age: 32,
    nationality: 'Anglais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/John_Stones_2018.jpg',
    desc: 'Libre après neuf ans à City, l’international anglais s’engage avec l’Inter Milan.',
  },
  {
    player: 'Olivier Giroud', from: 'Los Angeles FC', to: 'Lille', fee: 'Libre',
    flag: '🇫🇷', date: '12 Juil 2026', official: true, position: 'Attaquant', age: 39,
    nationality: 'Français',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Olivier_Giroud_2018.jpg',
    desc: 'Le meilleur buteur de l’histoire des Bleus revient en Ligue 1, à Lille, pour disputer la C1.',
  },
  {
    player: 'Vinícius Júnior', from: 'Real Madrid', to: 'Al-Hilal', fee: '~250M€',
    flag: '🇧🇷', date: 'Rumeur', official: false, position: 'Ailier', age: 26,
    nationality: 'Brésilien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vinicius_Junior_2021.jpg',
    desc: "Offre XXL du club saoudien pour le Brésilien. Le Real n'a rien confirmé : dossier à suivre cet hiver.",
  },
  {
    player: 'Erling Haaland', from: 'Manchester City', to: 'Real Madrid', fee: '~200M€',
    flag: '🇳🇴', date: 'Rumeur', official: false, position: 'Attaquant', age: 26,
    nationality: 'Norvégien',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Erling_Haaland_2023.jpg',
    desc: 'La presse anglaise évoque un intérêt du Real, mais aucune approche officielle à ce stade.',
  },
  {
    player: 'Rafael Leão', from: 'AC Milan', to: 'Paris Saint-Germain', fee: '~90M€',
    flag: '🇵🇹', date: 'Rumeur', official: false, position: 'Ailier', age: 27,
    nationality: 'Portugais',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rafael_Le%C3%A3o_2022.jpg',
    desc: 'Paris apprécie le profil du Portugais pour l’hiver, sans qu’un accord entre clubs existe.',
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
                Les transferts officiels du mercato estival · complété par les brèves RSS en direct
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
              <span className={styles.statLabel}>Rumeurs à suivre</span>
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
                  Rumeurs — {filtered.filter(d => !d.official).length} dossiers
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
