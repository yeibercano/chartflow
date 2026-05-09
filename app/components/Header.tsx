import { BarChart2, Bell, Settings, User } from "lucide-react";

export default function Header() {
  return (
    <header style={{
      height: 48, display: "flex", alignItems: "center",
      borderBottom: "0.5px solid var(--border)",
      background: "var(--bg-secondary)", padding: "0 20px",
      flexShrink: 0, gap: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BarChart2 size={18} color="var(--accent)" />
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.06em", color: "var(--text-primary)" }}>
          CHART<span style={{ color: "var(--accent)" }}>FLOW</span>
        </span>
      </div>

      <nav style={{ display: "flex", gap: 4, flex: 1 }}>
        {["Screener", "Charts", "Alerts", "Portfolio"].map((item, i) => (
          <button key={item} style={{
            fontSize: 12, padding: "4px 12px", borderRadius: 6, cursor: "pointer",
            border: "none", fontFamily: "inherit",
            background: i === 0 ? "rgba(56,189,248,0.12)" : "transparent",
            color: i === 0 ? "var(--accent)" : "var(--text-muted)",
            transition: "all 0.15s",
          }}>
            {item}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 11, color: "var(--green)", letterSpacing: "0.04em" }}>● MARKET OPEN</span>
        {[Bell, Settings, User].map((Icon, i) => (
          <button key={i} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}>
            <Icon size={16} />
          </button>
        ))}
      </div>
    </header>
  );
}
