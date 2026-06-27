import type { ReminderLeadUnit, Task, TaskPriority } from '../types'
import {
  calculateReminderAt,
  formatDateTime,
  getReminderLead,
  isBeforeNow,
} from '../utils/date'
import { EmptyState } from './EmptyState'
import { ReminderTimeframeInput } from './ReminderTimeframeInput'

type TaskListProps = {
  onDeleteTask: (taskId: string) => void
  onUpdateTask: (task: Task) => void
  tasks: Task[]
}

const priorities: TaskPriority[] = ['low', 'normal', 'high']

export function TaskList({ onDeleteTask, onUpdateTask, tasks }: TaskListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Tasks</h2>
          <p className="text-sm text-slate-500">
            Default reminders are 30 minutes before the due time.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {tasks.length === 0 && (
          <EmptyState
            message="Add a task with a due date to see it here."
            title="No tasks yet"
          />
        )}

        {tasks.map((task) => {
          const reminderLead =
            task.reminderLeadValue && task.reminderLeadUnit
              ? {
                  unit: task.reminderLeadUnit,
                  value: task.reminderLeadValue,
                }
              : getReminderLead(task.dueAt, task.reminderAt, 30, 'minutes')

          return (
            <article
              className="rounded-lg border border-slate-200 p-4"
              key={task.id}
            >
              <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-start">
                <input
                  checked={task.completed}
                  className="mt-1 h-5 w-5 accent-teal-700"
                  onChange={(event) =>
                    onUpdateTask({ ...task, completed: event.target.checked })
                  }
                  type="checkbox"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Name
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateTask({ ...task, title: event.target.value })
                      }
                      type="text"
                      value={task.title}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Due
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateTask({
                          ...task,
                          dueAt: event.target.value,
                          reminderAt: calculateReminderAt(
                            event.target.value,
                            reminderLead.value,
                            reminderLead.unit,
                          ),
                          reminderLeadUnit: reminderLead.unit,
                          reminderLeadValue: reminderLead.value,
                        })
                      }
                      type="datetime-local"
                      value={task.dueAt}
                    />
                  </label>
                  <ReminderTimeframeInput
                    idPrefix={`task-${task.id}-reminder`}
                    onChange={(value, unit) =>
                      onUpdateTask({
                        ...task,
                        reminderAt: calculateReminderAt(task.dueAt, value, unit),
                        reminderLeadUnit: unit,
                        reminderLeadValue: value,
                      })
                    }
                    unit={reminderLead.unit as ReminderLeadUnit}
                    value={reminderLead.value}
                  />
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Priority
                    <select
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal capitalize outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateTask({
                          ...task,
                          priority: event.target.value as TaskPriority,
                        })
                      }
                      value={task.priority}
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Reminder time: {formatDateTime(task.reminderAt)}
                  </p>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Notes
                    <textarea
                      className="min-h-20 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateTask({ ...task, notes: event.target.value })
                      }
                      value={task.notes}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      task.completed
                        ? 'bg-slate-100 text-slate-600'
                        : isBeforeNow(task.dueAt)
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {task.completed
                      ? 'Done'
                      : isBeforeNow(task.dueAt)
                        ? 'Overdue'
                        : formatDateTime(task.dueAt)}
                  </span>
                  <button
                    className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    onClick={() => onDeleteTask(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
