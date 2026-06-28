import type { ExpenseFrequency, ReminderLeadUnit } from '../types'

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  currency: 'NGN',
  style: 'currency',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
})

export const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

export const toDateTimeInput = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 16)
}

export const addMinutes = (value: string, minutes: number) => {
  const date = new Date(value)
  date.setMinutes(date.getMinutes() + minutes)
  return toDateTimeInput(date)
}

export const addDays = (value: string, days: number) => {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return toDateTimeInput(date)
}

export const calculateReminderAt = (
  dueAt: string,
  leadValue: number,
  leadUnit: ReminderLeadUnit,
) => {
  const date = new Date(dueAt)

  if (leadUnit === 'minutes') {
    date.setMinutes(date.getMinutes() - leadValue)
  }

  if (leadUnit === 'hours') {
    date.setHours(date.getHours() - leadValue)
  }

  if (leadUnit === 'days') {
    date.setDate(date.getDate() - leadValue)
  }

  if (leadUnit === 'weeks') {
    date.setDate(date.getDate() - leadValue * 7)
  }

  return toDateTimeInput(date)
}

export const getReminderLead = (
  dueAt: string,
  reminderAt: string,
  fallbackValue: number,
  fallbackUnit: ReminderLeadUnit,
) => {
  const differenceMinutes = Math.max(
    1,
    Math.round((new Date(dueAt).getTime() - new Date(reminderAt).getTime()) / 60_000),
  )
  const units: { minutes: number; unit: ReminderLeadUnit }[] = [
    { minutes: 10_080, unit: 'weeks' },
    { minutes: 1_440, unit: 'days' },
    { minutes: 60, unit: 'hours' },
    { minutes: 1, unit: 'minutes' },
  ]
  const matchingUnit = units.find(
    (unit) => differenceMinutes >= unit.minutes && differenceMinutes % unit.minutes === 0,
  )

  if (!Number.isFinite(differenceMinutes) || !matchingUnit) {
    return {
      unit: fallbackUnit,
      value: fallbackValue,
    }
  }

  return {
    unit: matchingUnit.unit,
    value: differenceMinutes / matchingUnit.minutes,
  }
}

export const addFrequency = (value: string, frequency: ExpenseFrequency) => {
  const date = new Date(value)

  if (frequency === 'daily') {
    date.setDate(date.getDate() + 1)
  }

  if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7)
  }

  if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1)
  }

  if (frequency === 'quarterly') {
    date.setMonth(date.getMonth() + 3)
  }

  if (frequency === 'semiannually') {
    date.setMonth(date.getMonth() + 6)
  }

  if (frequency === 'yearly') {
    date.setFullYear(date.getFullYear() + 1)
  }

  return toDateTimeInput(date)
}

export const defaultTaskDueAt = () => {
  const date = new Date()
  date.setHours(date.getHours() + 2, 0, 0, 0)
  return toDateTimeInput(date)
}

export const defaultExpenseDueAt = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(9, 0, 0, 0)
  return toDateTimeInput(date)
}

export const startOfTodayInput = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return toDateTimeInput(date)
}

export const formatDateTime = (value: string) =>
  dateTimeFormatter.format(new Date(value))

export const formatDate = (value: string) => dateFormatter.format(new Date(value))

export const formatCurrency = (value: number) => currencyFormatter.format(value)

export const isBeforeNow = (value: string) => new Date(value).getTime() < Date.now()

export const compareIsoDates = <T extends { date: string }>(first: T, second: T) =>
  new Date(first.date).getTime() - new Date(second.date).getTime()

export const sortByDate = <T, K extends keyof T>(items: T[], key: K) =>
  [...items].sort(
    (first, second) =>
      new Date(String(first[key])).getTime() - new Date(String(second[key])).getTime(),
  )

export const labelForFrequency = (frequency: ExpenseFrequency) => {
  const labels: Record<ExpenseFrequency, string> = {
    daily: 'Daily',
    monthly: 'Monthly',
    once: 'One time',
    quarterly: 'Quarterly',
    semiannually: 'Semiannually',
    weekly: 'Weekly',
    yearly: 'Yearly',
  }

  return labels[frequency]
}
