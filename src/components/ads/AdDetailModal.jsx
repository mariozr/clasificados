import Modal from '../ui/Modal'
import AdDetailView from './AdDetailView'

export default function AdDetailModal({ ad, isOpen, onClose, onRequestAuth }) {
  if (!ad) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="900px" noPadding>
      <button 
        className="modal__close detail-close" 
        onClick={onClose}
        style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', zIndex: 100 }}
      >
        &times;
      </button>
      <AdDetailView ad={ad} onRequestAuth={onRequestAuth} />
    </Modal>
  )
}
