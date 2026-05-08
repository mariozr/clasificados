import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useAds } from '../hooks/useAds'
import { useGeography } from '../hooks/useGeography'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SearchBar from '../components/ui/SearchBar'
import CategoriesGrid from '../components/categories/CategoriesGrid'
import CategoriesModal from '../components/categories/CategoriesModal'
import FilterSection from '../components/filters/FilterSection'
import AdGrid from '../components/ads/AdGrid'
import PublishModal from '../components/ads/PublishModal'
import AuthModal from '../components/auth/AuthModal'

const PROVINCES = [
  'Argentina', 'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

function HeroSection({ onSearch }) {
  const [heroText, setHeroText] = useState('Argentina')
  const [fading, setFading] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        i = (i + 1) % PROVINCES.length
        setHeroText(PROVINCES[i])
        setFading(false)
      }, 100)
    }, 1600)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__content">
          <h1>
            Encontrá lo mejor de{' '}
            <strong className={`animate-text ${fading ? 'fade-out' : ''}`}>
              {heroText}
            </strong>
          </h1>
          <p>La plataforma más moderna para comprar y vender en tu provincia</p>
          <div className="hide-mobile">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categories } = useCategories()
  const { ads, loading: adsLoading, fetchAds, deleteAd, publishAd } = useAds()
  const { provinces, cities, loadingCities, fetchProvinces, fetchCities } = useGeography()

  // Modal states
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState(null)

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    categoria_id: 'all',
    provincia: 'all',
    ubicacion: 'all',
    sort: 'recent',
    onlyMine: false,
  })

  // Publish modal cities
  const [publishCities, setPublishCities] = useState([])
  const [publishLoadingCities, setPublishLoadingCities] = useState(false)

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces()
  }, [fetchProvinces])

  // Fetch ads when filters or user change
  useEffect(() => {
    fetchAds({
      ...filters,
      userId: user?.id,
    })
  }, [filters, fetchAds, user?.id])

  // Search handler
  const handleSearch = useCallback((val) => {
    setFilters((prev) => ({ ...prev, search: val }))
  }, [])

  // Filter change handler
  const handleFilterChange = useCallback((filterUpdate) => {
    setFilters((prev) => ({
      ...prev,
      categoria_id: filterUpdate.categoria_id,
      provincia: filterUpdate.provincia,
      ubicacion: filterUpdate.ubicacion,
      sort: filterUpdate.sort,
    }))
  }, [])

  // Province change for filters
  const handleProvinceChange = useCallback((provinceName) => {
    fetchCities(provinceName)
  }, [fetchCities])

  // Province change for publish modal
  const handlePublishProvinceChange = useCallback(async (provinceName) => {
    if (!provinceName || provinceName === '') {
      setPublishCities([])
      return
    }
    setPublishLoadingCities(true)
    try {
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/municipios?provincia=${provinceName}&campos=id,nombre&max=1000`
      )
      const { municipios } = await response.json()
      const sorted = municipios
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((m) => ({ id: m.id, name: m.nombre }))
      setPublishCities(sorted)
    } catch (e) {
      console.error('Error ciudades:', e)
    } finally {
      setPublishLoadingCities(false)
    }
  }, [])

  // Category select
  const handleCategorySelect = useCallback((id) => {
    setFilters((prev) => ({ ...prev, categoria_id: id }))
    setCategoriesModalOpen(false)
    document.getElementById('filtersSection')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Explore / reset
  const handleExplore = useCallback(() => {
    setFilters({
      search: '',
      categoria_id: 'all',
      provincia: 'all',
      ubicacion: 'all',
      sort: 'recent',
      onlyMine: false,
    })
  }, [])

  // My ads
  const handleShowMyAds = useCallback(() => {
    setFilters((prev) => ({ ...prev, onlyMine: true }))
    document.getElementById('filtersSection')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Open detail - Now navigates to the ad page
  const handleOpenDetail = useCallback((adId) => {
    navigate(`/ad/${adId}`)
  }, [navigate])

  // Edit ad
  const handleEdit = useCallback((adId) => {
    const ad = ads.find((a) => a.id === adId)
    if (ad) {
      setEditingAd(ad)
      setPublishModalOpen(true)
    }
  }, [ads])

  // Delete ad
  const handleDelete = useCallback(async (adId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción también borrará las fotos permanentemente.')) {
      const success = await deleteAd(adId)
      if (success) {
        fetchAds({ ...filters, userId: user?.id })
      }
    }
  }, [deleteAd, fetchAds, filters, user?.id])

  // Publish
  const handlePublish = useCallback(async (adData, files, editingId) => {
    await publishAd(adData, files, editingId)
    setPublishModalOpen(false)
    setEditingAd(null)
    fetchAds({ ...filters, userId: user?.id })
  }, [publishAd, fetchAds, filters, user?.id])

  // Auth
  const handleShowAuth = useCallback((mode = 'login') => {
    setAuthModal({ open: true, mode })
  }, [])

  return (
    <>
      <Header
        onSearch={handleSearch}
        onShowAuth={handleShowAuth}
        onShowCategories={() => setCategoriesModalOpen(true)}
        onExplore={handleExplore}
        onShowMyAds={handleShowMyAds}
        onShowPublish={() => {
          setEditingAd(null)
          setPublishModalOpen(true)
        }}
        onOpenAd={handleOpenDetail}
      />

      <HeroSection onSearch={handleSearch} />

      <section className="categories-main">
        <div className="container">
          <CategoriesGrid categories={categories} onSelect={handleCategorySelect} />
        </div>
      </section>

      <FilterSection
        categories={categories}
        provinces={provinces}
        cities={cities}
        loadingCities={loadingCities}
        filters={filters}
        onFilterChange={handleFilterChange}
        onProvinceChange={handleProvinceChange}
      />

      <AdGrid
        ads={ads}
        loading={adsLoading}
        onlyMine={filters.onlyMine}
        onOpenDetail={handleOpenDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, mode: 'login' })}
        initialMode={authModal.mode}
      />

      <CategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        categories={categories}
        onSelect={handleCategorySelect}
      />

      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => {
          setPublishModalOpen(false)
          setEditingAd(null)
        }}
        categories={categories}
        provinces={provinces}
        cities={publishCities}
        loadingCities={publishLoadingCities}
        onPublish={handlePublish}
        onProvinceChange={handlePublishProvinceChange}
        editingAd={editingAd}
      />
    </>
  )
}
