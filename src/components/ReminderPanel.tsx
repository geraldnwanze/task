import { formatDateTime, isBeforeNow } from '../utils/date'
import { EmptyState } from './EmptyState'

type ReminderItem = {
  date: string
  dueDate: string
  id: string
  isDone: boolean
  title: string
  type: 'Task' | 'Expense'
}

type ReminderPanelProps = {
  reminders: ReminderItem[]
}

export function ReminderPanel({ reminders }: ReminderPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Reminder schedule</h2>
      <div className="mt-4 grid gap-3">
        {reminders.length === 0 && (
          <EmptyState
            message="Task and expense reminders will appear in chronological order."
            title="No reminders yet"
          />
        )}
        {reminders.map((reminder) => (
          <article
            className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
            key={`${reminder.type}-${reminder.id}`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    reminder.type === 'Task'
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {reminder.type}
                </span>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    reminder.isDone
                      ? 'bg-slate-100 text-slate-500'
                      : isBeforeNow(reminder.date)
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {reminder.isDone
                    ? 'Completed'
                    : isBeforeNow(reminder.date)
                      ? 'Reminder due'
                      : 'Scheduled'}
                </span>
              </div>
              <h3 className="mt-2 font-bold text-slate-950">{reminder.title}</h3>
              <p className="text-sm text-slate-500">
                Due {formatDateTime(reminder.dueDate)}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Remind {formatDateTime(reminder.date)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
