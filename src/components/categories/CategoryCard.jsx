import { memo } from 'react'

function CategoryCard({ icon, name, onClick }) {
  return (
    <div className="category-card" onClick={onClick} role="button" tabIndex={0}>
      <i className={`fas ${icon || 'fa-tag'}`}></i>
      <span>{name}</span>
    </div>
  )
}

export default memo(CategoryCard)
