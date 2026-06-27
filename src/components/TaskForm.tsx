import { useState } from 'react'
import type { ReminderLeadUnit, Task, TaskPriority } from '../types'
import { calculateReminderAt, defaultTaskDueAt, makeId } from '../utils/date'
import { ReminderTimeframeInput } from './ReminderTimeframeInput'

type TaskFormProps = {
  onAddTask: (task: Task) => void
}

const priorities: TaskPriority[] = ['low', 'normal', 'high']

const newTaskState = () => {
  const dueAt = defaultTaskDueAt()

  return {
    dueAt,
    notes: '',
    priority: 'normal' as TaskPriority,
    reminderLeadUnit: 'minutes' as ReminderLeadUnit,
    reminderLeadValue: 30,
    reminderAt: calculateReminderAt(dueAt, 30, 'minutes'),
    title: '',
  }
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [form, setForm] = useState(newTaskState)

  const submitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.title.trim()) {
      return
    }

    onAddTask({
      completed: false,
      createdAt: new Date().toISOString(),
      dueAt: form.dueAt,
      id: makeId(),
      notes: form.notes.trim(),
      priority: form.priority,
      reminderAt: form.reminderAt,
      reminderLeadUnit: form.reminderLeadUnit,
      reminderLeadValue: form.reminderLeadValue,
      title: form.title.trim(),
    })
    setForm(newTaskState())
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={submitTask}
    >
      <h2 className="text-lg font-bold text-slate-950">Add task reminder</h2>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Task name
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Pay supplier, call client..."
            type="text"
            value={form.title}
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Due date and time
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                dueAt: event.target.value,
                reminderAt: calculateReminderAt(
                  event.target.value,
                  current.reminderLeadValue,
                  current.reminderLeadUnit,
                ),
              }))
            }
            type="datetime-local"
            value={form.dueAt}
          />
        </label>
        <ReminderTimeframeInput
          idPrefix="new-task-reminder"
          onChange={(value, unit) =>
            setForm((current) => ({
              ...current,
              reminderAt: calculateReminderAt(current.dueAt, value, unit),
              reminderLeadUnit: unit,
              reminderLeadValue: value,
            }))
          }
          unit={form.reminderLeadUnit}
          value={form.reminderLeadValue}
        />
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Reminder time: {form.reminderAt.replace('T', ' ')}
        </p>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Priority
          <select
            className="rounded-md border border-slate-300 px-3 py-2 font-normal capitalize outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                priority: event.target.value as TaskPriority,
              }))
            }
            value={form.priority}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Notes
          <textarea
            className="min-h-24 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            placeholder="Optional details"
            value={form.notes}
          />
        </label>
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
          type="submit"
        >
          Add task
        </button>
      </div>
    </form>
  )
}
