const updateCheckIntervalMs = 30 * 60 * 1000

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const hadController = Boolean(navigator.serviceWorker.controller)
  let isReloadingForUpdate = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || isReloadingForUpdate) {
      return
    }

    isReloadingForUpdate = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        void registration.update()

        window.setInterval(() => {
          if (!document.hidden) {
            void registration.update()
          }
        }, updateCheckIntervalMs)

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        registration.addEventListener('updatefound', () => {
          const nextWorker = registration.installing

          nextWorker?.addEventListener('statechange', () => {
            if (nextWorker.state === 'installed' && navigator.serviceWorker.controller) {
              nextWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      })
      .catch(() => {
        // Registration can fail on unsupported origins; the app still works normally.
      })
  })
}
