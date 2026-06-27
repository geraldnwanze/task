import type { MouseEventHandler } from 'react'

type NotificationControlsProps = {
  onRequestPermission: MouseEventHandler<HTMLButtonElement>
  onSendTest: MouseEventHandler<HTMLButtonElement>
  pendingReminderCount: number
  permission: NotificationPermission | 'unsupported'
}

const statusText: Record<NotificationControlsProps['permission'], string> = {
  default: 'Notifications are off',
  denied: 'Notifications blocked',
  granted: 'Notifications on',
  unsupported: 'Notifications unavailable',
}

export function NotificationControls({
  onRequestPermission,
  onSendTest,
  pendingReminderCount,
  permission,
}: NotificationControlsProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900">{statusText[permission]}</p>
        <p>
          {pendingReminderCount > 0
            ? `${pendingReminderCount} reminder${pendingReminderCount === 1 ? '' : 's'} ready to notify.`
            : 'Due reminders will notify while the app is open or installed and running.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-teal-200 px-3 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
          disabled={permission === 'granted' || permission === 'unsupported'}
          onClick={onRequestPermission}
          type="button"
        >
          Enable notifications
        </button>
        <button
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
          disabled={permission === 'denied' || permission === 'unsupported'}
          onClick={onSendTest}
          type="button"
        >
          Send test
        </button>
      </div>
    </div>
  )
}
