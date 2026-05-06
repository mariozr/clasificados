import { useState, useCallback } from 'react'

export function useGeography() {
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)

  const fetchProvinces = useCallback(async () => {
    try {
      const response = await fetch(
        'https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre'
      )
      const { provincias } = await response.json()
      const sorted = provincias
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((p) => ({ id: p.id, name: p.nombre }))
      setProvinces(sorted)
    } catch (e) {
      console.error('Error provincias:', e)
    }
  }, [])

  const fetchCities = useCallback(async (provinceName) => {
    if (!provinceName || provinceName === 'all') {
      setCities([])
      return
    }
    setLoadingCities(true)
    try {
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/municipios?provincia=${provinceName}&campos=id,nombre&max=1000`
      )
      const { municipios } = await response.json()
      const sorted = municipios
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((m) => ({ id: m.id, name: m.nombre }))
      setCities(sorted)
    } catch (e) {
      console.error('Error ciudades:', e)
    } finally {
      setLoadingCities(false)
    }
  }, [])

  return { provinces, cities, loadingCities, fetchProvinces, fetchCities }
}
