import type { ReminderLeadUnit } from '../types'

type ReminderTimeframeInputProps = {
  idPrefix: string
  label?: string
  onChange: (value: number, unit: ReminderLeadUnit) => void
  unit: ReminderLeadUnit
  value: number
}

const reminderUnits: ReminderLeadUnit[] = ['minutes', 'hours', 'days', 'weeks']

export function ReminderTimeframeInput({
  idPrefix,
  label = 'Remind before',
  onChange,
  unit,
  value,
}: ReminderTimeframeInputProps) {
  const amountId = `${idPrefix}-amount`
  const unitId = `${idPrefix}-unit`

  return (
    <div className="grid gap-1 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(110px,0.8fr)] gap-2">
        <label className="sr-only" htmlFor={amountId}>
          Reminder amount
        </label>
        <input
          className="min-w-0 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          id={amountId}
          min="1"
          onChange={(event) => {
            const nextValue = Math.max(1, Number(event.target.value) || 1)
            onChange(nextValue, unit)
          }}
          type="number"
          value={value}
        />
        <label className="sr-only" htmlFor={unitId}>
          Reminder unit
        </label>
        <select
          className="min-w-0 rounded-md border border-slate-300 px-3 py-2 font-normal capitalize outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          id={unitId}
          onChange={(event) =>
            onChange(value, event.target.value as ReminderLeadUnit)
          }
          value={unit}
        >
          {reminderUnits.map((reminderUnit) => (
            <option key={reminderUnit} value={reminderUnit}>
              {reminderUnit}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
