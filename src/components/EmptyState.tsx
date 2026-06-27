type EmptyStateProps = {
  title: string
  message: string
}

export function EmptyState({ message, title }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
  )
}
