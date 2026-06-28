import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Task, TaskPriority } from '../types'
import {
  calculateReminderAt,
  formatDateTime,
  getReminderLead,
  isBeforeNow,
} from '../utils/date'
import { EmptyState } from './EmptyState'
import { Modal } from './Modal'
import { ReminderTimeframeInput } from './ReminderTimeframeInput'

type TaskListProps = {
  onDeleteTask: (taskId: string) => void
  onUpdateTask: (task: Task) => void
  tasks: Task[]
}

type TaskEditModalProps = {
  onClose: () => void
  onSave: (task: Task) => void
  task: Task
}

const priorities: TaskPriority[] = ['low', 'normal', 'high']

const taskStatusClass = (task: Task) => {
  if (task.completed) {
    return 'bg-slate-100 text-slate-600'
  }

  if (isBeforeNow(task.dueAt)) {
    return 'bg-rose-100 text-rose-700'
  }

  return 'bg-teal-100 text-teal-700'
}

const taskStatusLabel = (task: Task) => {
  if (task.completed) {
    return 'Done'
  }

  if (isBeforeNow(task.dueAt)) {
    return 'Overdue'
  }

  return 'Scheduled'
}

function TaskEditModal({ onClose, onSave, task }: TaskEditModalProps) {
  const initialLead =
    task.reminderLeadValue && task.reminderLeadUnit
      ? {
          unit: task.reminderLeadUnit,
          value: task.reminderLeadValue,
        }
      : getReminderLead(task.dueAt, task.reminderAt, 30, 'minutes')
  const [draft, setDraft] = useState<Task>({
    ...task,
    reminderLeadUnit: initialLead.unit,
    reminderLeadValue: initialLead.value,
  })

  const saveTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draft.title.trim()) {
      return
    }

    onSave({
      ...draft,
      notes: draft.notes.trim(),
      title: draft.title.trim(),
    })
    onClose()
  }

  return (
    <Modal onClose={onClose} title="Edit task">
      <form className="grid gap-4" onSubmit={saveTask}>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Name
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            type="text"
            value={draft.title}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Due
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              onChange={(event) =>
                setDraft((current) => {
                  const leadValue = current.reminderLeadValue ?? 30
                  const leadUnit = current.reminderLeadUnit ?? 'minutes'

                  return {
                    ...current,
                    dueAt: event.target.value,
                    reminderAt: calculateReminderAt(
                      event.target.value,
                      leadValue,
                      leadUnit,
                    ),
                    reminderLeadUnit: leadUnit,
                    reminderLeadValue: leadValue,
                  }
                })
              }
              type="datetime-local"
              value={draft.dueAt}
            />
          </label>
          <ReminderTimeframeInput
            idPrefix={`task-${task.id}-edit-reminder`}
            onChange={(value, unit) =>
              setDraft((current) => ({
                ...current,
                reminderAt: calculateReminderAt(current.dueAt, value, unit),
                reminderLeadUnit: unit,
                reminderLeadValue: value,
              }))
            }
            unit={draft.reminderLeadUnit ?? 'minutes'}
            value={draft.reminderLeadValue ?? 30}
          />
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Priority
            <select
              className="rounded-md border border-slate-300 px-3 py-2 font-normal capitalize outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  priority: event.target.value as TaskPriority,
                }))
              }
              value={draft.priority}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              checked={draft.completed}
              className="h-4 w-4 accent-teal-700"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  completed: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Completed
          </label>
        </div>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Reminder time: {formatDateTime(draft.reminderAt)}
        </p>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Notes
          <textarea
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setDraft((current) => ({ ...current, notes: event.target.value }))
            }
            value={draft.notes}
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
            type="submit"
          >
            Save task
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function TaskList({ onDeleteTask, onUpdateTask, tasks }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const openOnKeyDown = (event: KeyboardEvent<HTMLElement>, task: Task) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setEditingTask(task)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Tasks</h2>
          <p className="text-sm text-slate-500">
            Compact cards open into a full editor when selected.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {tasks.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState
              message="Add a task with a due date to see it here."
              title="No tasks yet"
            />
          </div>
        )}

        {tasks.map((task) => (
          <article
            className="cursor-pointer rounded-lg border border-slate-200 p-4 transition hover:border-teal-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            key={task.id}
            onClick={() => setEditingTask(task)}
            onKeyDown={(event) => openOnKeyDown(event, task)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-950">{task.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Due {formatDateTime(task.dueAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${taskStatusClass(task)}`}
              >
                {taskStatusLabel(task)}
              </span>
            </div>
            {task.notes && (
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{task.notes}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-700">
                {task.priority}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    onUpdateTask({ ...task, completed: !task.completed })
                  }}
                  type="button"
                >
                  {task.completed ? 'Reopen' : 'Done'}
                </button>
                <button
                  className="rounded-md border border-teal-200 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    setEditingTask(task)
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDeleteTask(task.id)
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingTask && (
        <TaskEditModal
          onClose={() => setEditingTask(null)}
          onSave={onUpdateTask}
          task={editingTask}
        />
      )}
    </section>
  )
}
