import { useState } from 'react'
import type { Expense, ExpenseFrequency, ReminderLeadUnit } from '../types'
import {
  calculateReminderAt,
  defaultExpenseDueAt,
  labelForFrequency,
  makeId,
} from '../utils/date'
import { ReminderTimeframeInput } from './ReminderTimeframeInput'

type ExpenseFormProps = {
  onAddExpense: (expense: Expense) => void
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

const newExpenseState = () => {
  const nextDueAt = defaultExpenseDueAt()

  return {
    amount: '',
    category: '',
    frequency: 'monthly' as ExpenseFrequency,
    name: '',
    nextDueAt,
    notes: '',
    reminderLeadUnit: 'days' as ReminderLeadUnit,
    reminderLeadValue: 3,
    reminderAt: calculateReminderAt(nextDueAt, 3, 'days'),
  }
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [form, setForm] = useState(newExpenseState)

  const submitExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0) {
      return
    }

    onAddExpense({
      amount,
      category: form.category.trim() || 'General',
      createdAt: new Date().toISOString(),
      frequency: form.frequency,
      id: makeId(),
      name: form.name.trim(),
      nextDueAt: form.nextDueAt,
      notes: form.notes.trim(),
      reminderAt: form.reminderAt,
      reminderLeadUnit: form.reminderLeadUnit,
      reminderLeadValue: form.reminderLeadValue,
      status: 'scheduled',
    })
    setForm(newExpenseState())
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={submitExpense}
    >
      <h2 className="text-lg font-bold text-slate-950">Add expenditure</h2>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Expense name
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Rent, subscription, payroll..."
            type="text"
            value={form.name}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Amount
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              min="0"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              placeholder="0.00"
              step="0.01"
              type="number"
              value={form.amount}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Category
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              placeholder="Operations"
              type="text"
              value={form.category}
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Frequency
          <select
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                frequency: event.target.value as ExpenseFrequency,
              }))
            }
            value={form.frequency}
          >
            {frequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {labelForFrequency(frequency)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Expense date and time
          <input
            className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                nextDueAt: event.target.value,
                reminderAt: calculateReminderAt(
                  event.target.value,
                  current.reminderLeadValue,
                  current.reminderLeadUnit,
                ),
              }))
            }
            type="datetime-local"
            value={form.nextDueAt}
          />
        </label>
        <ReminderTimeframeInput
          idPrefix="new-expense-reminder"
          onChange={(value, unit) =>
            setForm((current) => ({
              ...current,
              reminderAt: calculateReminderAt(current.nextDueAt, value, unit),
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
          Add expense
        </button>
      </div>
    </form>
  )
}
