export default function LiveBadge({ minute }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(239,68,68,0.15)', color:'#f87171', borderRadius:4, padding:'2px 7px', fontSize:'0.7rem', fontWeight:700 }}>
      <span className="live-dot" />
      {minute ? `${minute}'` : 'LIVE'}
    </span>
  );
}
