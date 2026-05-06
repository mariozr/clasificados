import AdCard from './AdCard'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function AdGrid({ ads, loading, onlyMine, onOpenDetail, onEdit, onDelete }) {
  return (
    <main className="main-content">
      <div className="container">
        <div className="results-info">
          <span id="resultsCount">
            {onlyMine ? 'Tus anuncios: ' : ''}
            {loading ? 'Buscando...' : `${ads.length} encontrado(s)`}
          </span>
        </div>
        <div className="classifieds-grid" id="classifiedsGrid">
          {loading ? (
            <LoadingSpinner />
          ) : ads.length === 0 ? (
            <div className="loading-spinner">
              <i className="fas fa-search" style={{ opacity: 0.3 }}></i>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                No se encontraron anuncios
              </p>
            </div>
          ) : (
            ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onOpenDetail={onOpenDetail}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}
