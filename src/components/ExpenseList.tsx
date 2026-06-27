import type { Expense, ExpenseFrequency, ReminderLeadUnit } from '../types'
import {
  calculateReminderAt,
  formatCurrency,
  formatDateTime,
  getReminderLead,
  labelForFrequency,
} from '../utils/date'
import { EmptyState } from './EmptyState'
import { ReminderTimeframeInput } from './ReminderTimeframeInput'

type ExpenseListProps = {
  expenses: Expense[]
  onDeleteExpense: (expenseId: string) => void
  onMarkPaid: (expense: Expense) => void
  onUpdateExpense: (expense: Expense) => void
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

export function ExpenseList({
  expenses,
  onDeleteExpense,
  onMarkPaid,
  onUpdateExpense,
}: ExpenseListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Expenses</h2>
        <p className="text-sm text-slate-500">
          Default reminders are 3 days before the expense date.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {expenses.length === 0 && (
          <EmptyState
            message="Add a scheduled expense to begin tracking expenditure."
            title="No expenses yet"
          />
        )}

        {expenses.map((expense) => {
          const reminderLead =
            expense.reminderLeadValue && expense.reminderLeadUnit
              ? {
                  unit: expense.reminderLeadUnit,
                  value: expense.reminderLeadValue,
                }
              : getReminderLead(expense.nextDueAt, expense.reminderAt, 3, 'days')

          return (
            <article
              className="rounded-lg border border-slate-200 p-4"
              key={expense.id}
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Name
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateExpense({ ...expense, name: event.target.value })
                      }
                      type="text"
                      value={expense.name}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Amount
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      min="0"
                      onChange={(event) =>
                        onUpdateExpense({
                          ...expense,
                          amount: Number(event.target.value),
                        })
                      }
                      step="0.01"
                      type="number"
                      value={expense.amount}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Category
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateExpense({
                          ...expense,
                          category: event.target.value,
                        })
                      }
                      type="text"
                      value={expense.category}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Frequency
                    <select
                      className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateExpense({
                          ...expense,
                          frequency: event.target.value as ExpenseFrequency,
                        })
                      }
                      value={expense.frequency}
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
                        onUpdateExpense({
                          ...expense,
                          nextDueAt: event.target.value,
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
                      value={expense.nextDueAt}
                    />
                  </label>
                  <ReminderTimeframeInput
                    idPrefix={`expense-${expense.id}-reminder`}
                    onChange={(value, unit) =>
                      onUpdateExpense({
                        ...expense,
                        reminderAt: calculateReminderAt(
                          expense.nextDueAt,
                          value,
                          unit,
                        ),
                        reminderLeadUnit: unit,
                        reminderLeadValue: value,
                      })
                    }
                    unit={reminderLead.unit as ReminderLeadUnit}
                    value={reminderLead.value}
                  />
                  <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Reminder time: {formatDateTime(expense.reminderAt)}
                  </p>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Notes
                    <textarea
                      className="min-h-20 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      onChange={(event) =>
                        onUpdateExpense({ ...expense, notes: event.target.value })
                      }
                      value={expense.notes}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-start gap-2 lg:max-w-44 lg:justify-end">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                    {formatCurrency(expense.amount)}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {formatDateTime(expense.nextDueAt)}
                  </span>
                  <button
                    className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    onClick={() => onMarkPaid(expense)}
                    type="button"
                  >
                    Mark paid
                  </button>
                  <button
                    className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    onClick={() => onDeleteExpense(expense.id)}
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
