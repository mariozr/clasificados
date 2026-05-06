import { memo } from 'react'

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Cargando...
    </div>
  )
}

export default memo(LoadingSpinner)
