export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration can fail on unsupported origins; the app still works normally.
    })
  })
}
