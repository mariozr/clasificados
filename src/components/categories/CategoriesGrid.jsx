import CategoryCard from './CategoryCard'

export default function CategoriesGrid({ categories, onSelect }) {
  return (
    <div className="categories-grid" id="mainCategoriesGrid">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          icon={cat.icono}
          name={cat.nombre}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </div>
  )
}
