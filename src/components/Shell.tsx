import type { PropsWithChildren } from 'react'
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt'
import type { AppRoute } from '../types'

type ShellProps = PropsWithChildren<{
  notice: string
  route: AppRoute
}>

const navItems: { href: `#${AppRoute}`; label: string; route: AppRoute }[] = [
  { href: '#/tasks', label: 'Tasks', route: '/tasks' },
  { href: '#/expenses', label: 'Expenses', route: '/expenses' },
  { href: '#/history', label: 'History', route: '/history' },
  { href: '#/reminders', label: 'Reminders', route: '/reminders' },
]

export function Shell({ children, notice, route }: ShellProps) {
  const { canInstall, promptInstall } = usePwaInstallPrompt()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Task Ledger
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              Tasks, reminders, and expenditure
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canInstall && (
              <button
                className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                onClick={() => {
                  void promptInstall()
                }}
                type="button"
              >
                Install app
              </button>
            )}
            <nav className="flex flex-wrap gap-2" aria-label="Primary">
              {navItems.map((item) => (
                <a
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    route === item.route
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-800'
                  }`}
                  href={item.href}
                  key={item.route}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {notice}
        </div>
        {children}
      </main>
    </div>
  )
}
