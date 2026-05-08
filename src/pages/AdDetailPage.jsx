import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import AdDetailView from '../components/ads/AdDetailView'
import AuthModal from '../components/auth/AuthModal'

export default function AdDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })

  useEffect(() => {
    async function fetchAd() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('*, categorias(nombre)')
          .eq('id', id)
          .single()
        
        if (error) throw error
        setAd(data)
      } catch (e) {
        console.error('Error fetching ad:', e)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchAd()
  }, [id])

  if (loading) {
    return (
      <div className="loading-page">
        <Header />
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando anuncio...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="error-page">
        <Header />
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
          <h2>Anuncio no encontrado</h2>
          <p>Lo sentimos, el anuncio que buscas no existe o ha sido eliminado.</p>
          <button className="btn-submit" onClick={() => navigate('/')} style={{ maxWidth: '200px', margin: '2rem auto' }}>
            Volver al inicio
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="ad-detail-page">
      <Header />
      <div className="container" style={{ padding: '2rem 0' }}>
        <button onClick={() => navigate(-1)} className="btn-back">
          <i className="fas fa-arrow-left"></i> Volver
        </button>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <AdDetailView ad={ad} onRequestAuth={() => setAuthModal({ open: true, mode: 'login' })} />
        </div>
      </div>
      <Footer />

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, mode: 'login' })}
        initialMode={authModal.mode}
      />
    </div>
  )
}
