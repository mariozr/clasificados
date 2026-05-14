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

      // Sorting
      let orderColumn = 'fecha_publicacion'
      let ascending = false

      if (filters.sort === 'price-asc') {
        orderColumn = 'precio'
        ascending = true
      } else if (filters.sort === 'price-desc') {
        orderColumn = 'precio'
        ascending = false
      }

      const { data, error } = await query.order(orderColumn, { ascending })

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
    try {
      // 1. Get ad data to find image URLs
      const { data: ad, error: fetchError } = await supabase
        .from('anuncios')
        .select('imagenes, imagen')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 2. Delete images from storage if they exist
      let allImageUrls = []
      if (ad?.imagenes && ad.imagenes.length > 0) {
        allImageUrls = [...ad.imagenes]
      } else if (ad?.imagen) {
        allImageUrls = [ad.imagen]
      }

      if (allImageUrls.length > 0) {
        const paths = allImageUrls.map(url => {
          try {
            const urlObj = new URL(url)
            const pathname = urlObj.pathname
            const parts = pathname.split('/')
            return decodeURIComponent(parts[parts.length - 1])
          } catch (e) {
            const parts = url.split('/')
            const fileNameWithParams = parts[parts.length - 1]
            return decodeURIComponent(fileNameWithParams.split('?')[0])
          }
        }).filter(Boolean)

        if (paths.length > 0) {
          const { error: storageError, data: storageData } = await supabase.storage
            .from('anuncios_images')
            .remove(paths)
          
          if (storageError) {
            console.error('Error cleaning storage:', storageError)
          } else {
            console.log('Successfully deleted images from storage:', paths, storageData)
          }
        }
      }

      // 3. Mark as inactive (soft delete)
      const { error: deleteError } = await supabase
        .from('anuncios')
        .update({ activo: false, imagenes: [], imagen: null })
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (e) {
      console.error('Error deleting ad:', e)
      const errorMessage = e?.message || e?.error_description || JSON.stringify(e)
      alert(`Error al eliminar la publicación: ${errorMessage}`)
      return false
    }
  }, [])

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else {
            if (height > maxWidth) {
              width *= maxWidth / height
              height = maxWidth
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            quality
          )
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const publishAd = useCallback(async (adData, files, editingId = null) => {
    let imageUrls = []

    for (const file of files) {
      // Compress before upload
      const compressedFile = await compressImage(file)
      
      const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('anuncios_images')
        .upload(fileName, compressedFile)
      
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
