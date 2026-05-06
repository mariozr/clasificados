import { useState, useCallback, memo } from 'react'

function FilterSection({ categories, provinces, cities, loadingCities, onFilterChange, onProvinceChange }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    categoria_id: 'all',
    provincia: 'all',
    ubicacion: 'all',
    sort: 'recent',
  })

  const handleChange = useCallback((key, value) => {
    const updated = { ...localFilters, [key]: value }

    if (key === 'provincia') {
      updated.ubicacion = 'all'
      onProvinceChange(value)
    }

    setLocalFilters(updated)
    onFilterChange(updated)
  }, [localFilters, onFilterChange, onProvinceChange])

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
              value={localFilters.categoria_id}
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
              value={localFilters.provincia}
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
              value={localFilters.ubicacion}
              disabled={localFilters.provincia === 'all' || loadingCities}
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
              value={localFilters.sort}
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
