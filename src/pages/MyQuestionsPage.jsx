import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import AuthModal from '../components/auth/AuthModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatPrice } from '../utils/formatters'
import { sanitize } from '../utils/sanitize'
import { getCategoryImage } from '../utils/categoryImages'

export default function MyQuestionsPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [loading, setLoading] = useState(true)
  const [interactions, setInteractions] = useState([]) // Array of { ad: adObject, comments: [commentObjects] }

  const fetchMyQuestions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Fetch comments made by user
      const { data: comments, error: commentsError } = await supabase
        .from('comentarios')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_creacion', { ascending: false })

      if (commentsError) throw commentsError

      if (!comments || comments.length === 0) {
        setInteractions([])
        return
      }

      // 2. Extract unique ad IDs
      const adIds = [...new Set(comments.map((c) => c.anuncio_id))]

      // 3. Fetch ads with their categories
      const { data: ads, error: adsError } = await supabase
        .from('anuncios')
        .select('*, categorias(*)')
        .in('id', adIds)
        .eq('activo', true)

      if (adsError) throw adsError

      // 4. Group comments by ad
      const grouped = ads.map((ad) => {
        const adComments = comments
          .filter((c) => c.anuncio_id === ad.id)
          .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion))
        return { ad, comments: adComments }
      })

      setInteractions(grouped)
    } catch (e) {
      console.error('Error fetching questions page data:', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchMyQuestions()
      } else {
        setLoading(false)
      }
    }
  }, [user, authLoading, fetchMyQuestions])

  const handleOpenAd = useCallback((adId) => {
    navigate(`/ad/${adId}`)
  }, [navigate])

  const handleShowAuth = useCallback((mode = 'login') => {
    setAuthModal({ open: true, mode })
  }, [])

  return (
    <div className="ad-detail-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onShowAuth={handleShowAuth}
        onOpenAd={handleOpenAd}
      />

      <main style={{ flex: 1, padding: '3rem 0' }}>
        <div className="container">
          {/* Back button */}
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>

          {/* Page Header */}
          <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', width: 'fit-content' }}>
              <i className="fas fa-comments" style={{ marginRight: '0.75rem', color: 'var(--primary)' }}></i>
              Mis Consultas
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Seguí las preguntas que hiciste en las publicaciones y las respuestas de los vendedores.
            </p>
          </div>

          {authLoading || loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <LoadingSpinner />
            </div>
          ) : !user ? (
            /* Not authenticated view */
            <div style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-light)',
              maxWidth: '600px',
              margin: '2rem auto'
            }}>
              <i className="fas fa-user-lock" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '1.5rem', opacity: 0.8 }}></i>
              <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>Iniciá sesión para ver tus preguntas</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Necesitamos que te identifiques para poder mostrarte el listado de las publicaciones en las que has realizado preguntas.
              </p>
              <button className="btn-submit" style={{ maxWidth: '250px', margin: '0 auto' }} onClick={() => handleShowAuth('login')}>
                Iniciar Sesión <i className="fas fa-sign-in-alt"></i>
              </button>
            </div>
          ) : interactions.length === 0 ? (
            /* Empty state */
            <div style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-light)',
              maxWidth: '650px',
              margin: '2rem auto'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                fontSize: '2.5rem'
              }}>
                <i className="far fa-comment-dots"></i>
              </div>
              <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>Aún no has hecho ninguna pregunta</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Cuando tengas dudas sobre un producto o servicio, podés dejarle una consulta al vendedor en la sección de preguntas de su publicación. ¡Aparecerá aquí mismo!
              </p>
              <button className="btn-submit" style={{ maxWidth: '250px', margin: '0 auto' }} onClick={() => navigate('/')}>
                Explorar Publicaciones <i className="fas fa-search"></i>
              </button>
            </div>
          ) : (
            /* Content grid */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {interactions.map(({ ad, comments }) => (
                <div 
                  key={ad.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    transition: 'var(--transition)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  className="question-interaction-card"
                >
                  {/* Ad Header Info */}
                  <div 
                    onClick={() => handleOpenAd(ad.id)}
                    style={{
                      padding: '1.5rem',
                      background: 'var(--primary-light)',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <img 
                        src={ad.imagen || getCategoryImage(ad.categorias?.nombre, ad.categorias?.icono)} 
                        alt={ad.titulo}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          border: '1px solid var(--border-light)'
                        }}
                      />
                      <div>
                        <span className="badge" style={{ marginBottom: '0.35rem' }}>{ad.categorias?.nombre}</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          {sanitize(ad.titulo)}
                        </h3>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatPrice(ad.precio, ad.moneda)}
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        Ver Publicación <i className="fas fa-chevron-right" style={{ fontSize: '0.8rem' }}></i>
                      </span>
                    </div>
                  </div>

                  {/* Comments list for this ad */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {comments.map((comment) => (
                      <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* User Question */}
                        <div style={{
                          background: 'var(--background)',
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: '4px solid var(--primary-dark)',
                          borderTop: '1px solid var(--border-light)',
                          borderRight: '1px solid var(--border-light)',
                          borderBottom: '1px solid var(--border-light)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                              <i className="far fa-question-circle" style={{ marginRight: '0.4rem', color: 'var(--primary)' }}></i>
                              Tu pregunta
                            </span>
                            <span style={{ color: 'var(--text-light)' }}>
                              {new Date(comment.fecha_creacion).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                            {sanitize(comment.contenido)}
                          </p>
                        </div>

                        {/* Seller Answer */}
                        {comment.respuesta ? (
                          <div style={{
                            marginLeft: '2rem',
                            background: 'var(--surface)',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--success)',
                            borderTop: '1px solid var(--border-light)',
                            borderRight: '1px solid var(--border-light)',
                            borderBottom: '1px solid var(--border-light)',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <i className="fas fa-check-circle"></i>
                                Respuesta del vendedor
                              </span>
                              {comment.fecha_respuesta && (
                                <span style={{ color: 'var(--text-light)' }}>
                                  {new Date(comment.fecha_respuesta).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                              {sanitize(comment.respuesta)}
                            </p>
                          </div>
                        ) : (
                          <div style={{
                            marginLeft: '2rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px dashed rgba(245, 158, 11, 0.3)',
                            color: '#d97706',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: 'fit-content'
                          }}>
                            <i className="fas fa-clock"></i> Pendiente de respuesta
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, mode: 'login' })}
        initialMode={authModal.mode}
      />
    </div>
  )
}
