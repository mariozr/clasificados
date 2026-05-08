import { useState, useCallback, memo } from 'react'

function FilterSection({ categories, provinces, cities, loadingCities, filters, onFilterChange, onProvinceChange }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleChange = useCallback((key, value) => {
    const updated = { ...filters, [key]: value }

    if (key === 'provincia') {
      updated.ubicacion = 'all'
      onProvinceChange(value)
    }

    onFilterChange(updated)
    
    // Auto-collapse on mobile
    if (window.innerWidth <= 768) {
      setMobileOpen(false)
    }
  }, [filters, onFilterChange, onProvinceChange])

  return (
    <section className="filters-section" id="filtersSection">
      <div className="container">
        <button
          className={`mobile-filters-trigger ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <i className="fas fa-sliders"></i>
          <span>Filtros y Ordenar</span>
          <i className="fas fa-chevron-down arrow"></i>
        </button>

        <div className={`filters-wrapper ${mobileOpen ? 'active' : ''}`}>
          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={filters.categoria_id}
              onChange={(e) => handleChange('categoria_id', e.target.value)}
            >
              <option value="all">Todos</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Provincia</label>
            <select
              value={filters.provincia}
              onChange={(e) => handleChange('provincia', e.target.value)}
            >
              <option value="all">Todas</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ciudad</label>
            <select
              value={filters.ubicacion}
              disabled={filters.provincia === 'all' || loadingCities}
              onChange={(e) => handleChange('ubicacion', e.target.value)}
            >
              <option value="all">
                {loadingCities ? 'Cargando...' : 'Todas'}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por</label>
            <select
              value={filters.sort}
              onChange={(e) => handleChange('sort', e.target.value)}
            >
              <option value="recent">Más recientes</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(FilterSection)
