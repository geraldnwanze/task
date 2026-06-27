import { useMemo, useState } from 'react'
import type { Expense, ExpenseFrequency } from '../types'
import {
  formatCurrency,
  formatDate,
  labelForFrequency,
  sortByDate,
} from '../utils/date'
import { EmptyState } from './EmptyState'

type ExpenseHistoryProps = {
  expenses: Expense[]
  frequencies: ExpenseFrequency[]
}

type HistoryGroup = {
  key: string
  label: string
  total: number
  expenses: Expense[]
}

const pad = (value: number) => value.toString().padStart(2, '0')

const weekStart = (date: Date) => {
  const clone = new Date(date)
  const day = clone.getDay()
  const diff = clone.getDate() - day + (day === 0 ? -6 : 1)
  clone.setDate(diff)
  clone.setHours(0, 0, 0, 0)
  return clone
}

const groupLabel = (dateValue: string, frequency: ExpenseFrequency) => {
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = date.getMonth()

  if (frequency === 'daily') {
    return formatDate(dateValue)
  }

  if (frequency === 'weekly') {
    return `Week of ${formatDate(weekStart(date).toISOString())}`
  }

  if (frequency === 'monthly') {
    return `${date.toLocaleString('en-US', { month: 'long' })} ${year}`
  }

  if (frequency === 'quarterly') {
    return `Q${Math.floor(month / 3) + 1} ${year}`
  }

  if (frequency === 'semiannually') {
    return `${month < 6 ? 'H1' : 'H2'} ${year}`
  }

  return `${year}`
}

const groupKey = (dateValue: string, frequency: ExpenseFrequency) => {
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = date.getMonth()

  if (frequency === 'daily') {
    return `${year}-${pad(month + 1)}-${pad(date.getDate())}`
  }

  if (frequency === 'weekly') {
    const start = weekStart(date)
    return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
  }

  if (frequency === 'monthly') {
    return `${year}-${pad(month + 1)}`
  }

  if (frequency === 'quarterly') {
    return `${year}-Q${Math.floor(month / 3) + 1}`
  }

  if (frequency === 'semiannually') {
    return `${year}-H${month < 6 ? 1 : 2}`
  }

  return `${year}`
}

export function ExpenseHistory({ expenses, frequencies }: ExpenseHistoryProps) {
  const [activeFrequency, setActiveFrequency] =
    useState<ExpenseFrequency>('monthly')

  const groups = useMemo(() => {
    const matchingExpenses =
      activeFrequency === 'daily'
        ? expenses
        : expenses.filter((expense) => expense.frequency === activeFrequency)
    const grouped = new Map<string, HistoryGroup>()

    sortByDate(matchingExpenses, 'nextDueAt').forEach((expense) => {
      const key = groupKey(expense.nextDueAt, activeFrequency)
      const existingGroup = grouped.get(key)

      if (existingGroup) {
        existingGroup.expenses.push(expense)
        existingGroup.total += expense.amount
        return
      }

      grouped.set(key, {
        expenses: [expense],
        key,
        label: groupLabel(expense.nextDueAt, activeFrequency),
        total: expense.amount,
      })
    })

    return [...grouped.values()].reverse()
  }, [activeFrequency, expenses])

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Expense history</h2>
          <p className="text-sm text-slate-500">
            Review scheduled expenditure by daily, weekly, monthly, quarterly,
            semiannual, and annual views.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {frequencies.map((frequency) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                activeFrequency === frequency
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-800'
              }`}
              key={frequency}
              onClick={() => setActiveFrequency(frequency)}
              type="button"
            >
              {labelForFrequency(frequency)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {groups.length === 0 && (
          <EmptyState
            message="Add expenses for this period to see totals and history."
            title="No history for this view"
          />
        )}

        {groups.map((group) => (
          <article className="rounded-lg border border-slate-200" key={group.key}>
            <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold text-slate-950">{group.label}</h3>
              <p className="text-sm font-bold text-emerald-700">
                {formatCurrency(group.total)}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {group.expenses.map((expense) => (
                <div
                  className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  key={expense.id}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{expense.name}</p>
                    <p className="text-sm text-slate-500">
                      {expense.category} · {labelForFrequency(expense.frequency)}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
