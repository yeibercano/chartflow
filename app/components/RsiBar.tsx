export default function RsiBar({ rsi }: { rsi: number }) {
  const color = rsi > 65 ? "#f87171" : rsi < 35 ? "#34d399" : "#fbbf24";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, minWidth: 50 }}>
        <div style={{ width: `${rsi}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", minWidth: 24 }}>{rsi}</span>
    </div>
  );
}
