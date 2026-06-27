import type { ReminderNotificationItem } from '../hooks/useReminderNotifications'
import { formatDateTime } from '../utils/date'

type ReminderToastsProps = {
  onDismiss: (id: string) => void
  reminders: ReminderNotificationItem[]
}

export function ReminderToasts({ onDismiss, reminders }: ReminderToastsProps) {
  if (reminders.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 grid gap-3 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm">
      {reminders.map((reminder) => (
        <article
          className="rounded-lg border border-teal-200 bg-white p-4 shadow-xl"
          key={`${reminder.type}-${reminder.id}-${reminder.date}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                {reminder.type} reminder
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-950">
                {reminder.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Due {formatDateTime(reminder.dueDate)}
              </p>
            </div>
            <button
              aria-label="Dismiss reminder"
              className="rounded-md border border-slate-200 px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-50"
              onClick={() => onDismiss(`${reminder.type}-${reminder.id}-${reminder.date}`)}
              type="button"
            >
              X
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
