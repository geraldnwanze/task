import { useEffect, useState } from 'react'
import type { AppRoute } from '../types'

const routes: AppRoute[] = ['/tasks', '/expenses', '/history', '/reminders']

const normalizeRoute = (): AppRoute => {
  const hashRoute = window.location.hash.replace('#', '')

  if (routes.includes(hashRoute as AppRoute)) {
    return hashRoute as AppRoute
  }

  window.location.hash = '/tasks'
  return '/tasks'
}

export const useHashRoute = () => {
  const [route, setRoute] = useState<AppRoute>(normalizeRoute)

  useEffect(() => {
    const handleHashChange = () => setRoute(normalizeRoute())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return route
}
