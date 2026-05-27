import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import CommentSection from './CommentSection'
import ImageViewer from '../ui/ImageViewer'
import { formatPrice, formatDate } from '../../utils/formatters'
import { sanitize } from '../../utils/sanitize'
import { getCategoryImage } from '../../utils/categoryImages'

export default function AdDetailView({ ad, onRequestAuth }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const footerSentinelRef = useRef(null)

  const images = useMemo(() => {
    if (!ad) return []
    const imgs = ad.imagenes || (ad.imagen ? [ad.imagen] : [])
    return imgs.length > 0 ? imgs : [getCategoryImage(ad.categorias?.nombre, ad.categorias?.icono)]
  }, [ad])

  const changeImage = useCallback((step) => {
    setCurrentImageIndex((prev) =>
      (prev + step + images.length) % images.length
    )
  }, [images.length])

  const handleThumbClick = useCallback((index) => {
    setCurrentImageIndex(index)
  }, [])

  // Intersection Observer to show WhatsApp button at the end of the content
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowWhatsApp(true)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 50px 0px' }
    )

    const currentSentinel = footerSentinelRef.current
    if (currentSentinel) {
      observer.observe(currentSentinel)
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel)
      }
    }
  }, [ad?.id])

  const handleNativeShare = useCallback(async () => {
    const shareUrl = window.location.origin + '/ad/' + ad.id
    const shareData = {
      title: ad.titulo,
      text: `Mira este anuncio en Clasificados Formosa: ${ad.titulo}`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }, [ad])

  if (!ad) return null

  return (
    <div className="detail-container">
      <div className="detail-grid">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="gallery-main">
            <img
              src={images[currentImageIndex]}
              alt={sanitize(ad.titulo)}
              loading="lazy"
              onClick={() => setViewerOpen(true)}
              style={{ cursor: 'zoom-in' }}
            />
            {images.length > 1 && (
              <div className="gallery-nav">
                <button onClick={() => changeImage(-1)} aria-label="Imagen anterior">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button onClick={() => changeImage(1)} aria-label="Siguiente imagen">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumb-item ${index === currentImageIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  onClick={() => handleThumbClick(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <div className="detail-header">
            <span className="badge">{ad.categorias?.nombre || 'General'}</span>
            <h2>{sanitize(ad.titulo)}</h2>
            <div className="detail-price">
              {formatPrice(ad.precio, ad.moneda)}
            </div>
          </div>

          <div className="detail-meta">
            <div className="meta-item">
              <i className="fas fa-location-dot"></i>
              <span>{ad.ubicacion}</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-calendar-alt"></i>
              <span>{formatDate(ad.fecha_publicacion)}</span>
            </div>
          </div>

          <div className="detail-body">
            <h3>Descripción</h3>
            <p>{sanitize(ad.descripcion)}</p>
          </div>

          <CommentSection
            anuncioId={ad.id}
            adOwnerId={ad.user_id}
            adTitle={ad.titulo}
            onRequestAuth={onRequestAuth}
          />

          <div className="detail-share">
            <span>Compartir</span>
            <div className="share-buttons">
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="btn-share btn-share--native"
                  aria-label="Compartir"
                >
                  <i className="fas fa-share-nodes"></i>
                </button>
              )}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/ad/' + ad.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-share btn-share--facebook"
                aria-label="Compartir en Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Mira este anuncio en Clasificados Formosa: ' + ad.titulo + ' - ' + window.location.origin + '/ad/' + ad.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-share btn-share--whatsapp"
                aria-label="Compartir en WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Sentinel for WhatsApp button visibility */}
          <div ref={footerSentinelRef} className="footer-sentinel" style={{ height: '1px', marginTop: '-1px' }} />

          <div className={`detail-footer ${showWhatsApp ? 'visible' : ''}`}>
            <a
              href={`https://wa.me/${ad.contacto}?text=Hola, estoy interesado en tu anuncio: ${sanitize(ad.titulo)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-large"
            >
              <i className="fab fa-whatsapp"></i> Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
      <ImageViewer 
        src={images[currentImageIndex]} 
        alt={ad.titulo} 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
      />
    </div>
  )
}
