import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDate } from '../../utils/formatters'

function NotificationBell({ userId, onOpenAd }) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleNotifClick = useCallback(async (notif) => {
    setIsOpen(false)
    await markAsRead(notif.id)
    if (onOpenAd) onOpenAd(notif.anuncio_id)
  }, [markAsRead, onOpenAd])

  return (
    <div className="nav__item-notifications" ref={dropdownRef}>
      <button
        className="notif-btn"
        id="btnNotifications"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      <div className={`notif-dropdown ${isOpen ? 'active' : ''}`}>
        <div className="notif-header">Notificaciones</div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <p className="notif-empty">No tienes notificaciones</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.leida ? '' : 'unread'}`}
                onClick={() => handleNotifClick(n)}
              >
                <p>{n.mensaje}</p>
                <span className="notif-time">
                  {new Date(n.fecha_creacion).toLocaleDateString('es-AR')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(NotificationBell)
