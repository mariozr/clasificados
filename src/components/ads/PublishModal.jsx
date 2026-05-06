import { useState, useEffect, useCallback, useRef } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'

export default function PublishModal({
  isOpen,
  onClose,
  categories,
  provinces,
  cities,
  loadingCities,
  onPublish,
  onProvinceChange,
  editingAd,
}) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    title: '',
    price: '',
    currency: 'USD',
    category_id: '',
    province: '',
    city: '',
    contact: '',
    description: '',
  })

  // Populate form when editing
  useEffect(() => {
    if (editingAd) {
      setForm({
        title: editingAd.titulo || '',
        price: editingAd.precio || '',
        currency: editingAd.moneda || 'USD',
        category_id: editingAd.categoria_id || '',
        province: editingAd.provincia || '',
        city: editingAd.ubicacion || '',
        contact: editingAd.contacto || '',
        description: editingAd.descripcion || '',
      })

      // Load province cities
      if (editingAd.provincia) {
        onProvinceChange(editingAd.provincia)
      }

      // Show existing image previews
      const imgs = editingAd.imagenes || (editingAd.imagen ? [editingAd.imagen] : [])
      setPreviews(imgs)
    } else {
      resetForm()
    }
  }, [editingAd, onProvinceChange])

  const resetForm = useCallback(() => {
    setForm({
      title: '',
      price: '',
      currency: 'USD',
      category_id: '',
      province: '',
      city: '',
      contact: '',
      description: '',
    })
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'province') {
      setForm((prev) => ({ ...prev, city: '' }))
      onProvinceChange(value)
    }
  }, [onProvinceChange])

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files)
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!user) return alert('Debes iniciar sesión para publicar.')
    setSubmitting(true)

    try {
      const files = fileInputRef.current?.files
        ? Array.from(fileInputRef.current.files)
        : []

      const adData = {
        titulo: form.title,
        descripcion: form.description,
        precio: parseFloat(form.price),
        moneda: form.currency,
        categoria_id: parseInt(form.category_id),
        provincia: form.province,
        ubicacion: form.city,
        contacto: form.contact,
        user_id: user.id,
      }

      await onPublish(adData, files, editingAd?.id || null)
      alert(editingAd ? '✅ Anuncio actualizado!' : '✅ ¡Anuncio publicado con éxito!')
      resetForm()
      onClose()
    } catch (e) {
      console.error('Error al publicar:', e)
      alert('❌ Error al publicar: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }, [user, form, editingAd, onPublish, onClose, resetForm])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal__header">
        <h3>{editingAd ? 'Editar Anuncio' : 'Publicar Anuncio'}</h3>
        <button className="modal__close" onClick={handleClose}>
          &times;
        </button>
      </div>
      <form className="publish-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título del anuncio</label>
          <input
            type="text"
            id="title"
            required
            placeholder="Ej: Vendo Toyota Corolla 2020"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="price">Precio</label>
            <input
              type="number"
              id="price"
              required
              placeholder="0.00"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="currency">Moneda</label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value="USD">USD (U$S)</option>
              <option value="ARS">ARS ($)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              required
              value={form.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
            >
              <option value="">Selecciona una...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="province">Provincia</label>
            <select
              id="province"
              required
              value={form.province}
              onChange={(e) => handleChange('province', e.target.value)}
            >
              <option value="">Selecciona una...</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="city">Ciudad</label>
            <select
              id="city"
              required
              disabled={!form.province || loadingCities}
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
            >
              <option value="">
                {loadingCities ? 'Cargando...' : form.province ? 'Selecciona ciudad...' : 'Elegir provincia...'}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact">WhatsApp de contacto</label>
          <input
            type="tel"
            id="contact"
            required
            placeholder="Ej: 5493704123456"
            value={form.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Imágenes del producto (Puedes seleccionar varias)</label>
          <div className="file-upload-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="file-input"
              multiple
              onChange={handleFileChange}
            />
            <div className="file-upload-design">
              <i className="fas fa-images"></i>
              <span>Seleccionar imágenes</span>
            </div>
          </div>
          {previews.length > 0 && (
            <div className="multi-image-preview">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="preview-item"
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            rows="4"
            required
            placeholder="Describe tu producto o servicio..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? (
            'Publicando...'
          ) : editingAd ? (
            <>Guardar Cambios <i className="fas fa-save"></i></>
          ) : (
            <>Publicar Ahora <i className="fas fa-paper-plane"></i></>
          )}
        </button>
      </form>
    </Modal>
  )
}
