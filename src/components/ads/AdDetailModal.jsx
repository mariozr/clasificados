import { useState, useCallback, useMemo } from 'react'
import Modal from '../ui/Modal'
import CommentSection from './CommentSection'
import { formatPrice, formatDate } from '../../utils/formatters'
import { sanitize } from '../../utils/sanitize'

export default function AdDetailModal({ ad, isOpen, onClose, onRequestAuth }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = useMemo(() => {
    if (!ad) return []
    return ad.imagenes || (ad.imagen ? [ad.imagen] : [])
  }, [ad])

  const changeImage = useCallback((step) => {
    setCurrentImageIndex((prev) =>
      (prev + step + images.length) % images.length
    )
  }, [images.length])

  const handleThumbClick = useCallback((index) => {
    setCurrentImageIndex(index)
  }, [])

  if (!ad) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="900px" noPadding>
      <div className="detail-container">
        <button className="modal__close detail-close" onClick={onClose}>
          &times;
        </button>
        <div className="detail-grid">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="gallery-main">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={sanitize(ad.titulo)}
                    loading="lazy"
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
                </>
              ) : (
                <div className="placeholder-icon">
                  <i className="fas fa-image"></i>
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

            <div className="detail-footer">
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
      </div>
    </Modal>
  )
}
