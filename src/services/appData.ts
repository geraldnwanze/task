import type { AppData } from '../types'

const fallbackData: AppData = {
  expenses: [],
  tasks: [],
}
const localStorageKey = 'task-ledger-data'

const loadLocalData = () => {
  const savedData = window.localStorage.getItem(localStorageKey)

  if (!savedData) {
    return fallbackData
  }

  return JSON.parse(savedData) as AppData
}

const saveLocalData = (data: AppData) => {
  window.localStorage.setItem(localStorageKey, JSON.stringify(data))
}

export const loadAppData = async (): Promise<AppData> => {
  try {
    const response = await fetch('/api/data')

    if (!response.ok) {
      return loadLocalData()
    }

    const data = (await response.json()) as AppData
    saveLocalData(data)
    return data
  } catch {
    return loadLocalData()
  }
}

export const saveAppData = async (data: AppData) => {
  saveLocalData(data)

  try {
    const response = await fetch('/api/data', {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })

    if (!response.ok) {
      throw new Error('Unable to save app data')
    }
  } catch {
    throw new Error('Saved locally, but file storage is unavailable')
  }
}
