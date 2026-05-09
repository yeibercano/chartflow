export default function RsiBar({ rsi }: { rsi: number }) {
  const toneClass = rsi > 65 ? "bg-red-400" : rsi < 35 ? "bg-emerald-400" : "bg-amber-400";

  return (
    <div className="flex items-center gap-2">
      <div className="h-[3px] min-w-[50px] flex-1 rounded bg-white/10">
        <div className={`h-full rounded ${toneClass}`} style={{ width: `${rsi}%` }} />
      </div>
      <span className="min-w-6 text-[11px] text-white/50">{rsi}</span>
    </div>
  );
}
