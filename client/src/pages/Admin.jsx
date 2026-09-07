// Admin — tableau de bord de la rédaction (/admin).
// Les 2 formulaires sont dans components/admin/.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useArticles, usePronostics } from '../hooks/api';
import toast from 'react-hot-toast';
import ArticleForm from '../components/admin/ArticleForm';
import AdminPronoForm from '../components/admin/AdminPronoForm';
import styles from './Admin.module.css';

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('articles');          // onglet actif
  const [editArticle, setEditArticle] = useState(null); // article en cours d'édition
  const [showForm, setShowForm] = useState(false);      // formulaire de création visible ?
  // refetch permet de recharger la liste après une création / suppression.
  const { data: articlesData, refetch: refetchArticles } = useArticles({ limit: 50 });
  const { data: pronostics, refetch: refetchPronos } = usePronostics();
  const articles = articlesData?.data ?? [];

  // Garde d'accès : pas de jeton -> retour à la page de connexion admin.
  useEffect(() => {
    const token = localStorage.getItem('kz_token');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const logout = () => { localStorage.removeItem('kz_token'); navigate('/admin/login'); };

  const deleteArticle = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return; // confirmation
    try { await api.delete(`/articles/${id}`); refetchArticles(); toast.success('Supprimé'); }
    catch { toast.error('Erreur'); }
  };

  // Marque un pronostic comme CORRECT ou RATE (valeurs de l'énum en base).
  const updatePronoResult = async (id, result) => {
    try { await api.put(`/pronostics/${id}`, { result }); refetchPronos(); toast.success('Résultat mis à jour'); }
    catch { toast.error('Erreur'); }
  };

  const TABS = [{key:'articles',label:'Articles'},{key:'pronos',label:'Pronostics'}];

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <span className={styles.logo}>KickZone Admin ⚽</span>
        <div className={styles.topbarRight}>
          <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>
            {articles.length} articles · {pronostics?.length ?? 0} pronos
          </span>
          <button className="btn btn-outline" onClick={logout} style={{fontSize:'0.82rem',padding:'6px 14px'}}>Déconnexion</button>
        </div>
      </div>

      <div className="container" style={{padding:'1.5rem var(--gutter)'}}>
        <div className={styles.tabs}>
          {TABS.map(t => <button key={t.key} className={`${styles.tab} ${tab===t.key?styles.tabActive:''}`} onClick={()=>{setTab(t.key);setShowForm(false);setEditArticle(null);}}>{t.label}</button>)}
        </div>

        {tab === 'articles' && (
          <>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Articles</h2>
              <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditArticle(null); }}>+ Nouvel article</button>
            </div>
            {(showForm || editArticle) && (
              <div className={styles.formWrap}>
                <ArticleForm initial={editArticle} onSaved={() => { setShowForm(false); setEditArticle(null); refetchArticles(); }} />
              </div>
            )}
            <div className={styles.table}>
              {articles.map(a => (
                <div key={a.id} className={styles.row}>
                  <span className={`badge badge-${a.category==='TRANSFERT'?'orange':a.category==='RESULTATS'?'green':'blue'}`}>{a.category}</span>
                  <span className={styles.rowTitle}>{a.title}</span>
                  <div className={styles.rowActions}>
                    <button className="btn btn-outline" style={{fontSize:'0.78rem',padding:'4px 10px'}} onClick={() => { setEditArticle(a); setShowForm(false); }}>Modifier</button>
                    <button className="btn" style={{fontSize:'0.78rem',padding:'4px 10px',background:'#fee2e2',color:'#dc2626'}} onClick={() => deleteArticle(a.id)}>Supprimer</button>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p style={{color:'var(--text-muted)',padding:'1rem'}}>Aucun article.</p>}
            </div>
          </>
        )}

        {tab === 'pronos' && (
          <>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Pronostics</h2>
              <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>+ Nouveau prono</button>
            </div>
            {showForm && (
              <div className={styles.formWrap}>
                <AdminPronoForm onSaved={() => { setShowForm(false); refetchPronos(); }} />
              </div>
            )}
            <div className={styles.table}>
              {(pronostics ?? []).map(p => (
                <div key={p.id} className={styles.row}>
                  <span className={styles.rowTitle}>{p.homeTeam} vs {p.awayTeam}</span>
                  <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{p.prediction}</span>
                  <div className={styles.rowActions}>
                    {!p.result && (
                      <>
                        <button className="btn" style={{fontSize:'0.78rem',padding:'4px 10px',background:'#dcfce7',color:'var(--green-live)'}} onClick={() => updatePronoResult(p.id, 'CORRECT')}>✅ Correct</button>
                        <button className="btn" style={{fontSize:'0.78rem',padding:'4px 10px',background:'#fee2e2',color:'#dc2626'}} onClick={() => updatePronoResult(p.id, 'RATE')}>❌ Raté</button>
                      </>
                    )}
                    {p.result && <span className={`badge ${p.result==='CORRECT'?'badge-green':'badge-gray'}`}>{p.result}</span>}
                  </div>
                </div>
              ))}
              {(!pronostics || pronostics.length === 0) && <p style={{color:'var(--text-muted)',padding:'1rem'}}>Aucun pronostic.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
