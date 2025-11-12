type SummaryCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  tone?: 'default' | 'success' | 'danger';
};

const toneStyles: Record<NonNullable<SummaryCardProps['tone']>, string> = {
  default: 'bg-slate-900/60 border-slate-800 text-slate-100',
  success: 'bg-emerald-600/10 border-emerald-500/40 text-emerald-200',
  danger: 'bg-rose-600/10 border-rose-500/40 text-rose-200',
};

export const SummaryCard = ({ title, value, subtitle, tone = 'default' }: SummaryCardProps) => (
  <div className={`rounded-xl border p-4 ${toneStyles[tone]}`}>
    <p className="text-sm uppercase tracking-wide text-slate-400">{title}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
    {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
  </div>
);
