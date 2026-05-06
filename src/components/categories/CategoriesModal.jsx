import Modal from '../ui/Modal'
import CategoriesGrid from './CategoriesGrid'

export default function CategoriesModal({ isOpen, onClose, categories, onSelect }) {
  const handleSelect = (id) => {
    onSelect(id)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="800px">
      <div className="modal__header">
        <h3>Explorar Categorías</h3>
        <button className="modal__close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <CategoriesGrid categories={categories} onSelect={handleSelect} />
      </div>
    </Modal>
  )
}
