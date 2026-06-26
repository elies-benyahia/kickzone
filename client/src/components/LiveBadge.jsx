export default function LiveBadge({ minute }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#dcfce7', color:'#16a34a', borderRadius:4, padding:'2px 7px', fontSize:'0.7rem', fontWeight:700 }}>
      <span className="live-dot" />
      {minute ? `${minute}'` : 'LIVE'}
    </span>
  );
}
