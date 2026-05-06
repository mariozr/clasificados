import { memo, useRef, useCallback } from 'react'

function SearchBar({ onSearch, className = '', placeholder = 'Buscar por título, descripción o categoría...' }) {
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const handleInput = useCallback((e) => {
    const val = e.target.value
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(val)
    }, 300)
  }, [onSearch])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current)
      onSearch(e.target.value)
    }
  }, [onSearch])

  return (
    <div className={`search-bar ${className}`}>
      <i className="fas fa-search"></i>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export default memo(SearchBar)
