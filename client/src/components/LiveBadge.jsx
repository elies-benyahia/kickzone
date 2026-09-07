// ============================================================================
//  LiveBadge — petit badge rouge "LIVE" (ou la minute de jeu) pour un match
//  en cours. Utilisé par MatchCard et la page Match.
// ============================================================================

export default function LiveBadge({ minute }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 4, padding: '2px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
      <span className="live-dot" /> {/* pastille rouge qui clignote (animée en CSS) */}
      {minute ? `${minute}'` : 'LIVE'} {/* minute de jeu si connue, sinon "LIVE" */}
    </span>
  );
}
