import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseHistory } from './components/ExpenseHistory'
import { ExpenseList } from './components/ExpenseList'
import { NotificationControls } from './components/NotificationControls'
import { ReminderPanel } from './components/ReminderPanel'
import { ReminderToasts } from './components/ReminderToasts'
import { Shell } from './components/Shell'
import { StatCard } from './components/StatCard'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useHashRoute } from './hooks/useHashRoute'
import {
  sendTestNotification,
  useReminderNotifications,
  type ReminderNotificationItem,
} from './hooks/useReminderNotifications'
import { loadAppData, saveAppData } from './services/appData'
import type { AppData, Expense, ExpenseFrequency, Task } from './types'
import {
  addFrequency,
  calculateReminderAt,
  compareIsoDates,
  formatCurrency,
  isBeforeNow,
  sortByDate,
  startOfTodayInput,
} from './utils/date'

const emptyData: AppData = {
  tasks: [],
  expenses: [],
}

function App() {
  const route = useHashRoute()
  const lastSavedDataRef = useRef(JSON.stringify(emptyData))
  const [data, setData] = useState<AppData>(emptyData)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('Loading saved data...')
  const [activeReminderToasts, setActiveReminderToasts] = useState<
    ReminderNotificationItem[]
  >([])

  useEffect(() => {
    let isMounted = true

    loadAppData()
      .then((savedData) => {
        if (!isMounted) {
          return
        }

        setData(savedData)
        lastSavedDataRef.current = JSON.stringify(savedData)
        setNotice('Saved to data/task-data.json')
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setData(emptyData)
        lastSavedDataRef.current = JSON.stringify(emptyData)
        setNotice('Using a new local file')
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const serializedData = JSON.stringify(data)

    if (serializedData === lastSavedDataRef.current) {
      return
    }

    const timeout = window.setTimeout(() => {
      saveAppData(data)
        .then(() => {
          lastSavedDataRef.current = serializedData
          setNotice('Saved to data/task-data.json')
        })
        .catch(() => {
          lastSavedDataRef.current = serializedData
          setNotice('Saved in this browser; file storage is unavailable')
        })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [data, isLoading])

  const tasks = useMemo(() => sortByDate(data.tasks, 'dueAt'), [data.tasks])
  const expenses = useMemo(
    () => sortByDate(data.expenses, 'nextDueAt'),
    [data.expenses],
  )
  const reminders = useMemo(
    () =>
      [
        ...tasks.map((task) => ({
          id: task.id,
          title: task.title,
          date: task.reminderAt,
          dueDate: task.dueAt,
          type: 'Task' as const,
          isDone: task.completed,
        })),
        ...expenses.map((expense) => ({
          id: expense.id,
          title: expense.name,
          date: expense.reminderAt,
          dueDate: expense.nextDueAt,
          type: 'Expense' as const,
          isDone: expense.status === 'paid',
        })),
      ].sort(compareIsoDates),
    [expenses, tasks],
  )
  const dueTasks = tasks.filter((task) => !task.completed && isBeforeNow(task.dueAt))
  const upcomingExpenses = expenses.filter(
    (expense) => expense.status !== 'paid' && expense.nextDueAt >= startOfTodayInput(),
  )
  const totalPlanned = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const showInAppReminder = useCallback((reminder: ReminderNotificationItem) => {
    setActiveReminderToasts((currentReminders) => {
      const key = `${reminder.type}-${reminder.id}-${reminder.date}`
      const alreadyVisible = currentReminders.some(
        (currentReminder) =>
          `${currentReminder.type}-${currentReminder.id}-${currentReminder.date}` ===
          key,
      )

      if (alreadyVisible) {
        return currentReminders
      }

      return [reminder, ...currentReminders].slice(0, 3)
    })
  }, [])
  const {
    pendingReminderCount,
    permission: notificationPermission,
    requestPermission,
  } = useReminderNotifications(reminders, !isLoading, {
    onReminderDue: showInAppReminder,
  })

  const addTask = (task: Task) => {
    setData((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
    }))
  }

  const updateTask = (updatedTask: Task) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    }))
  }

  const deleteTask = (taskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }))
  }

  const addExpense = (expense: Expense) => {
    setData((current) => ({
      ...current,
      expenses: [expense, ...current.expenses],
    }))
  }

  const updateExpense = (updatedExpense: Expense) => {
    setData((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense,
      ),
    }))
  }

  const deleteExpense = (expenseId: string) => {
    setData((current) => ({
      ...current,
      expenses: current.expenses.filter((expense) => expense.id !== expenseId),
    }))
  }

  const markExpensePaid = (expense: Expense) => {
    const paidAt = new Date().toISOString()
    const nextDueAt =
      expense.frequency === 'once'
        ? expense.nextDueAt
        : addFrequency(expense.nextDueAt, expense.frequency)
    const reminderLeadUnit = expense.reminderLeadUnit ?? 'days'
    const reminderLeadValue = expense.reminderLeadValue ?? 3

    updateExpense({
      ...expense,
      status: expense.frequency === 'once' ? 'paid' : 'scheduled',
      lastPaidAt: paidAt,
      nextDueAt,
      reminderAt:
        expense.frequency === 'once'
          ? expense.reminderAt
          : calculateReminderAt(nextDueAt, reminderLeadValue, reminderLeadUnit),
      reminderLeadUnit,
      reminderLeadValue,
    })
  }

  return (
    <Shell notice={notice} route={route}>
      <NotificationControls
        onRequestPermission={() => {
          void requestPermission()
        }}
        onSendTest={() => {
          const testReminder: ReminderNotificationItem = {
            date: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            id: `test-${Date.now()}`,
            isDone: false,
            title: 'This is an in-app test reminder',
            type: 'Task',
          }

          showInAppReminder(testReminder)
          void (async () => {
            if (notificationPermission === 'default') {
              const permission = await requestPermission()

              if (permission !== 'granted') {
                return permission
              }
            }

            return sendTestNotification()
          })().then((result) => {
            if (result === 'sent') {
              setNotice('Sent a test notification and showed an in-app test')
              return
            }

            if (result === 'denied') {
              setNotice('Notifications are blocked in this browser')
              return
            }

            if (result === 'unsupported') {
              setNotice('System notifications are not supported here')
              return
            }

            setNotice('Notification permission was not granted')
          })
        }}
        pendingReminderCount={pendingReminderCount}
        permission={notificationPermission}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tasks" value={tasks.filter((task) => !task.completed).length} />
        <StatCard label="Overdue tasks" value={dueTasks.length} tone="danger" />
        <StatCard label="Upcoming expenses" value={upcomingExpenses.length} />
        <StatCard label="Planned spend" value={formatCurrency(totalPlanned)} tone="money" />
      </section>

      {route === '/tasks' && (
        <section className="grid gap-5 xl:grid-cols-[minmax(280px,420px)_1fr]">
          <TaskForm onAddTask={addTask} />
          <TaskList
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            tasks={tasks}
          />
        </section>
      )}

      {route === '/expenses' && (
        <section className="grid gap-5 xl:grid-cols-[minmax(300px,440px)_1fr]">
          <ExpenseForm onAddExpense={addExpense} />
          <ExpenseList
            expenses={expenses}
            onDeleteExpense={deleteExpense}
            onMarkPaid={markExpensePaid}
            onUpdateExpense={updateExpense}
          />
        </section>
      )}

      {route === '/history' && (
        <ExpenseHistory
          expenses={expenses}
          frequencies={
            [
              'daily',
              'weekly',
              'monthly',
              'quarterly',
              'semiannually',
              'yearly',
            ] satisfies ExpenseFrequency[]
          }
        />
      )}

      {route === '/reminders' && <ReminderPanel reminders={reminders} />}
      <ReminderToasts
        onDismiss={(toastId) =>
          setActiveReminderToasts((currentReminders) =>
            currentReminders.filter(
              (reminder) =>
                `${reminder.type}-${reminder.id}-${reminder.date}` !== toastId,
            ),
          )
        }
        reminders={activeReminderToasts}
      />
    </Shell>
  )
}

export default App
