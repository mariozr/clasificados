import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetch() {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre')

      if (error) {
        console.error('Error cargando categorías:', error)
      } else if (mounted) {
        setCategories(data || [])
      }
      if (mounted) setLoading(false)
    }

    fetch()
    return () => { mounted = false }
  }, [])

  return { categories, loading }
}
