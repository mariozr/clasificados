import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const subscriptionRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('user_id', userId)
      .order('fecha_creacion', { ascending: false })
      .limit(10)

    if (!error && data) {
      setNotifications(data)
    }
  }, [userId])

  const markAsRead = useCallback(async (notifId) => {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notifId)
    loadNotifications()
  }, [loadNotifications])

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return

    loadNotifications()

    const channel = supabase
      .channel('notif-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          if (Notification.permission === 'granted') {
            new Notification('ClasiForm', { body: payload.new.mensaje })
          }
        }
      )
      .subscribe()

    subscriptionRef.current = channel

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [userId, loadNotifications])

  const unreadCount = notifications.filter((n) => !n.leida).length

  return { notifications, unreadCount, markAsRead, loadNotifications }
}
