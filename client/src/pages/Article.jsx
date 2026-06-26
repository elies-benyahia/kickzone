import { useParams } from 'react-router-dom';
import { useArticle, useArticles, useStandings } from '../hooks/api';
import StandingsTable from '../components/StandingsTable';
import ArticleCard from '../components/ArticleCard';
import styles from './Article.module.css';

export default function Article() {
  const { slug } = useParams();
  const { data: article, isLoading } = useArticle(slug);
  const { data: recentsData } = useArticles({ limit: 5 });
  const { data: standings } = useStandings(61);
  const recents = recentsData?.data?.filter(a => a.slug !== slug) ?? [];

  if (isLoading) return <div className={styles.loading}>Chargement...</div>;
  if (!article) return <div className={styles.loading}>Article introuvable.</div>;

  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '';

  return (
    <div className={styles.layout}>
      <article className={styles.article}>
        {article.imageUrl && <div className={styles.heroImg} style={{backgroundImage:`url(${article.imageUrl})`}} />}
        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={`badge badge-blue`}>{article.category}</span>
            <span className={styles.date}>{date}</span>
            {article.author && <span className={styles.author}>Par {article.author}</span>}
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          {article.summary && <p className={styles.summary}>{article.summary}</p>}
          {article.content && <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.content }} />}
        </div>
      </article>
      <aside className={styles.aside}>
        <h2 className={styles.asideTitle}>Derniers articles</h2>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {recents.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
        <h2 className={styles.asideTitle} style={{marginTop:'1.5rem'}}>Classement Ligue 1</h2>
        <StandingsTable standings={standings} compact />
      </aside>
    </div>
  );
}
