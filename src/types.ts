export type AppRoute = '/tasks' | '/expenses' | '/history' | '/reminders'

export type ExpenseFrequency =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'yearly'

export type ExpenseStatus = 'scheduled' | 'paid'

export type ReminderLeadUnit = 'minutes' | 'hours' | 'days' | 'weeks'

export type TaskPriority = 'low' | 'normal' | 'high'

export type Task = {
  id: string
  title: string
  notes: string
  dueAt: string
  reminderAt: string
  reminderLeadUnit?: ReminderLeadUnit
  reminderLeadValue?: number
  completed: boolean
  priority: TaskPriority
  createdAt: string
}

export type Expense = {
  id: string
  name: string
  category: string
  amount: number
  frequency: ExpenseFrequency
  nextDueAt: string
  reminderAt: string
  reminderLeadUnit?: ReminderLeadUnit
  reminderLeadValue?: number
  status: ExpenseStatus
  notes: string
  createdAt: string
  lastPaidAt?: string
}

export type AppData = {
  tasks: Task[]
  expenses: Expense[]
}
