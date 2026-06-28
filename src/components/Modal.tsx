import { useEffect, type PropsWithChildren } from 'react'

type ModalProps = PropsWithChildren<{
  onClose: () => void
  title: string
}>

export function Modal({ children, onClose, title }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-950" id="modal-title">
            {title}
          </h2>
          <button
            aria-label="Close modal"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
