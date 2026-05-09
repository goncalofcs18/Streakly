import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={clsx("card flex flex-col gap-1", accent && "border-flame-500/40 bg-flame-500/5")}>
      <span className="text-xs text-coal-300 font-mono uppercase tracking-widest">{label}</span>
      <span className={clsx("text-4xl font-display font-bold", accent ? "text-flame-400" : "text-white")}>
        {value}
      </span>
      {sub && <span className="text-xs text-coal-300">{sub}</span>}
    </div>
  );
}
