type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: string;
  accent: "amber" | "blue" | "emerald" | "red";
};

const accentClasses = {
  amber: {
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    glow: "bg-amber-400/10",
  },
  blue: {
    icon: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    glow: "bg-blue-400/10",
  },
  emerald: {
    icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    glow: "bg-emerald-400/10",
  },
  red: {
    icon: "border-red-400/20 bg-red-400/10 text-red-300",
    glow: "bg-red-400/10",
  },
};

export function StatCard({
  label,
  value,
  description,
  icon,
  accent,
}: StatCardProps) {
  const classes = accentClasses[accent];

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition duration-300 group-hover:scale-125 ${classes.glow}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-400">{label}</p>

            <p className="mt-4 text-3xl font-black tracking-tight text-white">
              {value}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${classes.icon}`}
          >
            {icon}
          </div>
        </div>

        <p className="mt-6 min-h-[48px] text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-300">
          <span>Ver detalhes</span>
          <span className="transition group-hover:translate-x-1">→</span>
        </div>
      </div>
    </article>
  );
}
