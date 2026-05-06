import { useEffect, useCallback } from 'react'

export default function Modal({ isOpen, onClose, children, maxWidth = '550px', noPadding = false }) {
  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="modal active" onClick={onClose}>
      <div
        className="modal__content"
        style={{ maxWidth, ...(noPadding ? { padding: 0, overflow: 'hidden' } : {}) }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
