import { useParams } from 'react-router-dom';
import { useArticle, useArticles } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import styles from './Article.module.css';

const relativeDate = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d);
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'il y a moins d\'1h';
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
};

const readTime = (text) => {
  if (!text) return '';
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min de lecture`;
};

const CATEGORY_COLOR = {
  TRANSFERT: 'var(--orange)', ANALYSE: 'var(--blue)', ACTU: '#8b5cf6',
  INTERVIEW: 'var(--green-live)', RESULTATS: '#dc2626',
};

function ShareButtons({ article }) {
  const url = `${window.location.origin}/article/${article.slug}`;
  const text = encodeURIComponent(article.title);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => alert('Lien copié !'));
  };

  return (
    <div className={styles.share}>
      <span className={styles.shareLabel}>Partager :</span>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} style={{background:'#1da1f2'}}>
        𝕏 Twitter
      </a>
      <a href={`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} style={{background:'#25d366'}}>
        WhatsApp
      </a>
      <button className={styles.shareBtn} style={{background:'var(--text-muted)'}} onClick={copyLink}>
        🔗 Copier
      </button>
    </div>
  );
}

export default function Article() {
  const { slug } = useParams();
  const { data: article, isLoading } = useArticle(slug);
  const { data: recentsData } = useArticles({ limit: 6 });
  const recents = recentsData?.data?.filter(a => a.slug !== slug).slice(0, 4) ?? [];

  if (isLoading) return <div className={styles.loading}>Chargement...</div>;
  if (!article) return <div className={styles.loading}>Article introuvable.</div>;

  const catColor = CATEGORY_COLOR[article.category] ?? 'var(--blue)';

  return (
    <div className={styles.layout}>
      <article className={styles.article}>
        {article.imageUrl && (
          <div className={styles.heroImg} style={{backgroundImage:`url(${article.imageUrl})`}}>
            <div className={styles.heroOverlay} />
          </div>
        )}
        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.catBadge} style={{background:catColor}}>{article.category}</span>
            <span className={styles.metaDot}>·</span>
            <span className={styles.date}>{relativeDate(article.publishedAt)}</span>
            {article.author && <><span className={styles.metaDot}>·</span><span className={styles.author}>Par {article.author}</span></>}
            <span className={styles.metaDot}>·</span>
            <span className={styles.readTime}>{readTime((article.content ?? '') + (article.summary ?? ''))}</span>
            {article.views > 0 && (
              <><span className={styles.metaDot}>·</span><span className={styles.views}>👁 {article.views >= 1000 ? `${(article.views/1000).toFixed(1)}k` : article.views} vues</span></>
            )}
          </div>

          <h1 className={styles.title}>{article.title}</h1>
          {article.summary && <p className={styles.summary}>{article.summary}</p>}

          {article.content && (
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.content }} />
          )}

          <ShareButtons article={article} />
        </div>
      </article>

      <aside className={styles.aside}>
        <h2 className={styles.asideTitle}>À lire aussi</h2>
        <div className={styles.recentList}>
          {recents.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      </aside>
    </div>
  );
}
