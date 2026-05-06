import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAds() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAds = useCallback(async (filters = {}) => {
    setLoading(true)
    try {
      let query = supabase
        .from('anuncios')
        .select('*, categorias(*)')
        .eq('activo', true)

      if (filters.onlyMine && filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.categoria_id && filters.categoria_id !== 'all') {
        query = query.eq('categoria_id', filters.categoria_id)
      }
      if (filters.provincia && filters.provincia !== 'all') {
        query = query.eq('provincia', filters.provincia)
      }
      if (filters.ubicacion && filters.ubicacion !== 'all') {
        query = query.eq('ubicacion', filters.ubicacion)
      }
      if (filters.search) {
        query = query.or(
          `titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query.order('fecha_publicacion', {
        ascending: false,
      })

      if (error) throw error
      setAds(data || [])
    } catch (e) {
      console.error('Error fetching ads:', e)
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAd = useCallback(async (id) => {
    const { error } = await supabase
      .from('anuncios')
      .update({ activo: false })
      .eq('id', id)
    if (error) {
      alert('Error al eliminar')
      return false
    }
    return true
  }, [])

  const publishAd = useCallback(async (adData, files, editingId = null) => {
    let imageUrls = []

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('anuncios_images')
        .upload(fileName, file)
      if (uploadError) throw uploadError
      const url = supabase.storage
        .from('anuncios_images')
        .getPublicUrl(fileName).data.publicUrl
      imageUrls.push(url)
    }

    const payload = { ...adData }
    if (imageUrls.length > 0) {
      payload.imagen = imageUrls[0]
      payload.imagenes = imageUrls
    }

    if (editingId) {
      const { error } = await supabase
        .from('anuncios')
        .update(payload)
        .eq('id', editingId)
      if (error) throw error
    } else {
      const { error } = await supabase.from('anuncios').insert([payload])
      if (error) throw error
    }
  }, [])

  return { ads, loading, fetchAds, deleteAd, publishAd }
}
