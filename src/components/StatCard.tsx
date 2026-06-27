type StatCardProps = {
  label: string
  value: number | string
  tone?: 'default' | 'danger' | 'money'
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  default: 'border-slate-200 bg-white text-slate-900',
  money: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export function StatCard({ label, tone = 'default', value }: StatCardProps) {
  return (
    <article className={`rounded-lg border p-4 shadow-sm ${toneClass[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  )
}
