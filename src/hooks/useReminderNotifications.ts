import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDateTime } from '../utils/date'

export type ReminderNotificationItem = {
  date: string
  dueDate: string
  id: string
  isDone: boolean
  title: string
  type: 'Task' | 'Expense'
}

type NotificationStatus = NotificationPermission | 'unsupported'
type UseReminderNotificationsOptions = {
  onReminderDue?: (reminder: ReminderNotificationItem) => void
}

const notifiedRemindersKey = 'task-ledger-notified-reminders'
const shownInAppRemindersKey = 'task-ledger-shown-in-app-reminders'

const loadNotifiedReminders = () => {
  try {
    return new Set<string>(
      JSON.parse(window.localStorage.getItem(notifiedRemindersKey) ?? '[]') as string[],
    )
  } catch {
    return new Set<string>()
  }
}

const saveNotifiedReminders = (notifiedReminders: Set<string>) => {
  window.localStorage.setItem(
    notifiedRemindersKey,
    JSON.stringify([...notifiedReminders].slice(-500)),
  )
}

const reminderKey = (reminder: ReminderNotificationItem) =>
  `${reminder.type}:${reminder.id}:${reminder.date}`

const withTimeout = <T,>(promise: Promise<T>, milliseconds: number) =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Timed out')), milliseconds)
    }),
  ])

const showReminderNotification = async (reminder: ReminderNotificationItem) => {
  const title =
    reminder.type === 'Task'
      ? `Task reminder: ${reminder.title}`
      : `Expense reminder: ${reminder.title}`
  const body =
    reminder.type === 'Task'
      ? `Due ${formatDateTime(reminder.dueDate)}`
      : `Expense date ${formatDateTime(reminder.dueDate)}`
  const options: NotificationOptions = {
    badge: '/pwa-icon-192.png',
    body,
    data: {
      route: reminder.type === 'Task' ? '#/tasks' : '#/expenses',
    },
    icon: '/pwa-icon-192.png',
    tag: reminderKey(reminder),
  }

  if ('serviceWorker' in navigator) {
    const registration = await withTimeout(navigator.serviceWorker.ready, 1_500)
    await registration.showNotification(title, options)
    return
  }

  new Notification(title, options)
}

export const sendTestNotification = async () => {
  if (!('Notification' in window)) {
    return 'unsupported' as const
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      return permission
    }
  }

  if (Notification.permission !== 'granted') {
    return Notification.permission
  }

  const testReminder = {
    date: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    id: `test-${Date.now()}`,
    isDone: false,
    title: 'This is a test reminder',
    type: 'Task' as const,
  }

  try {
    await showReminderNotification(testReminder)
    return 'sent' as const
  } catch {
    new Notification('Task reminder: This is a test reminder', {
      body: 'If you can see this, browser notifications are working.',
      icon: '/pwa-icon-192.png',
      tag: reminderKey(testReminder),
    })
    return 'sent' as const
  }
}

export const useReminderNotifications = (
  reminders: ReminderNotificationItem[],
  isReady: boolean,
  options: UseReminderNotificationsOptions = {},
) => {
  const onReminderDue = options.onReminderDue
  const [permission, setPermission] = useState<NotificationStatus>(() =>
    'Notification' in window ? Notification.permission : 'unsupported',
  )
  const [currentTime, setCurrentTime] = useState(0)
  const pendingReminderCount = useMemo(
    () =>
      reminders.filter(
        (reminder) =>
          !reminder.isDone && new Date(reminder.date).getTime() <= currentTime,
      ).length,
    [currentTime, reminders],
  )

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now())

    updateCurrentTime()
    const interval = window.setInterval(updateCurrentTime, 30_000)

    return () => window.clearInterval(interval)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return 'unsupported'
    }

    const nextPermission = await Notification.requestPermission()
    setPermission(nextPermission)
    return nextPermission
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    const checkReminders = () => {
      const notifiedReminders = loadNotifiedReminders()
      const shownInAppReminders = (() => {
        try {
          return new Set(
            JSON.parse(
              window.localStorage.getItem(shownInAppRemindersKey) ?? '[]',
            ) as string[],
          )
        } catch {
          return new Set<string>()
        }
      })()
      const now = Date.now()
      const dueReminders = reminders.filter(
        (reminder) =>
          !reminder.isDone &&
          new Date(reminder.date).getTime() <= now,
      )

      if (dueReminders.length === 0) {
        return
      }

      dueReminders.forEach((reminder) => {
        const key = reminderKey(reminder)

        if (!shownInAppReminders.has(key)) {
          shownInAppReminders.add(key)
          onReminderDue?.(reminder)
        }

        if (permission === 'granted' && !notifiedReminders.has(key)) {
          notifiedReminders.add(key)
          void showReminderNotification(reminder).catch(() => {
            notifiedReminders.delete(key)
            saveNotifiedReminders(notifiedReminders)
          })
        }
      })
      saveNotifiedReminders(notifiedReminders)
      window.localStorage.setItem(
        shownInAppRemindersKey,
        JSON.stringify([...shownInAppReminders].slice(-500)),
      )
    }

    checkReminders()
    const interval = window.setInterval(checkReminders, 30_000)
    window.addEventListener('focus', checkReminders)
    document.addEventListener('visibilitychange', checkReminders)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', checkReminders)
      document.removeEventListener('visibilitychange', checkReminders)
    }
  }, [isReady, onReminderDue, permission, reminders])

  return {
    pendingReminderCount,
    permission,
    requestPermission,
  }
}
