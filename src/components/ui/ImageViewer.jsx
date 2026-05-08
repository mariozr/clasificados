import { useState, useCallback, useEffect } from 'react'

export default function ImageViewer({ src, alt, isOpen, onClose }) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleWheel = useCallback((e) => {
    if (!isOpen) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 4))
  }, [isOpen])

  const handleMouseDown = (e) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="image-viewer-overlay" 
      onClick={onClose}
      onWheel={handleWheel}
    >
      <div className="image-viewer-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setZoom(prev => Math.min(prev + 0.5, 4))} aria-label="Aumentar zoom">
          <i className="fas fa-search-plus"></i>
        </button>
        <button onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))} aria-label="Disminuir zoom">
          <i className="fas fa-search-minus"></i>
        </button>
        <button onClick={onClose} aria-label="Cerrar">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div 
        className="image-viewer-container"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          draggable="false"
        />
      </div>
      
      <div className="image-viewer-hint">
        {zoom > 1 ? 'Arrastra para mover • Usa la rueda para zoom' : 'Usa la rueda o los botones para zoom'}
      </div>
    </div>
  )
}
