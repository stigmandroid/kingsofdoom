import Link from "next/link";

type AccentColor = "amber" | "red" | "blue" | "emerald";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
  href: string;
  accent?: AccentColor;
};

const accentStyles: Record<AccentColor, string> = {
  amber: "border-amber-400/20 bg-amber-400/5 text-amber-300",
  red: "border-red-400/20 bg-red-400/5 text-red-300",
  blue: "border-blue-400/20 bg-blue-400/5 text-blue-300",
  emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
};

export function StatCard({
  title,
  value,
  description,
  icon,
  href,
  accent = "amber",
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition duration-200 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
    >
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/[0.03] blur-2xl"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl ${accentStyles[accent]}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="relative mt-5 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <span className="relative mt-5 inline-flex text-sm font-semibold text-slate-300 transition group-hover:text-amber-300">
        Ver detalhes
        <span className="ml-2 transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}