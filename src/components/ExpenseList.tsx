import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Expense, ExpenseFrequency } from '../types'
import {
  calculateReminderAt,
  formatCurrency,
  formatDateTime,
  getReminderLead,
  labelForFrequency,
} from '../utils/date'
import { EmptyState } from './EmptyState'
import { Modal } from './Modal'
import { ReminderTimeframeInput } from './ReminderTimeframeInput'

type ExpenseListProps = {
  expenses: Expense[]
  onDeleteExpense: (expenseId: string) => void
  onMarkPaid: (expense: Expense) => void
  onUpdateExpense: (expense: Expense) => void
}

type ExpenseEditModalProps = {
  expense: Expense
  onClose: () => void
  onSave: (expense: Expense) => void
}

const frequencies: ExpenseFrequency[] = [
  'once',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'semiannually',
  'yearly',
]

function ExpenseEditModal({ expense, onClose, onSave }: ExpenseEditModalProps) {
  const initialLead =
    expense.reminderLeadValue && expense.reminderLeadUnit
      ? {
          unit: expense.reminderLeadUnit,
          value: expense.reminderLeadValue,
        }
      : getReminderLead(expense.nextDueAt, expense.reminderAt, 3, 'days')
  const [draft, setDraft] = useState<Expense>({
    ...expense,
    reminderLeadUnit: initialLead.unit,
    reminderLeadValue: initialLead.value,
  })

  const saveExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draft.name.trim() || Number.isNaN(draft.amount) || draft.amount <= 0) {
      return
    }

    onSave({
      ...draft,
      category: draft.category.trim() || 'General',
      name: draft.name.trim(),
      notes: draft.notes.trim(),
    })
    onClose()
  }

  return (
    <Modal onClose={onClose} title="Edit expense">
      <form className="grid gap-4" onSubmit={saveExpense}>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Name
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            type="text"
            value={draft.name}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Amount
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              min="0"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  amount: Number(event.target.value),
                }))
              }
              step="0.01"
              type="number"
              value={draft.amount}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Category
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              type="text"
              value={draft.category}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Frequency
            <select
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  frequency: event.target.value as ExpenseFrequency,
                }))
              }
              value={draft.frequency}
            >
              {frequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {labelForFrequency(frequency)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Expense date
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              onChange={(event) =>
                setDraft((current) => {
                  const leadValue = current.reminderLeadValue ?? 3
                  const leadUnit = current.reminderLeadUnit ?? 'days'

                  return {
                    ...current,
                    nextDueAt: event.target.value,
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
              value={draft.nextDueAt}
            />
          </label>
          <ReminderTimeframeInput
            idPrefix={`expense-${expense.id}-edit-reminder`}
            onChange={(value, unit) =>
              setDraft((current) => ({
                ...current,
                reminderAt: calculateReminderAt(current.nextDueAt, value, unit),
                reminderLeadUnit: unit,
                reminderLeadValue: value,
              }))
            }
            unit={draft.reminderLeadUnit ?? 'days'}
            value={draft.reminderLeadValue ?? 3}
          />
          <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Reminder time: {formatDateTime(draft.reminderAt)}
          </p>
        </div>
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
            Save expense
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function ExpenseList({
  expenses,
  onDeleteExpense,
  onMarkPaid,
  onUpdateExpense,
}: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const openOnKeyDown = (event: KeyboardEvent<HTMLElement>, expense: Expense) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setEditingExpense(expense)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Expenses</h2>
        <p className="text-sm text-slate-500">
          Compact cards open into a full editor when selected.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {expenses.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState
              message="Add a scheduled expense to begin tracking expenditure."
              title="No expenses yet"
            />
          </div>
        )}

        {expenses.map((expense) => (
          <article
            className="cursor-pointer rounded-lg border border-slate-200 p-4 transition hover:border-teal-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            key={expense.id}
            onClick={() => setEditingExpense(expense)}
            onKeyDown={(event) => openOnKeyDown(event, expense)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-950">
                  {expense.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Due {formatDateTime(expense.nextDueAt)}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            {expense.notes && (
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                {expense.notes}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                  {expense.category}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                  {labelForFrequency(expense.frequency)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    onMarkPaid(expense)
                  }}
                  type="button"
                >
                  Mark paid
                </button>
                <button
                  className="rounded-md border border-teal-200 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    setEditingExpense(expense)
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDeleteExpense(expense.id)
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

      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={onUpdateExpense}
        />
      )}
    </section>
  )
}
