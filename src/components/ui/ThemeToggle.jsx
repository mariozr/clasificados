import { memo } from 'react'
import { useTheme } from '../../context/ThemeContext'

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      id="themeToggle"
      aria-label="Cambiar modo"
      onClick={toggleTheme}
    >
      <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  )
}

export default memo(ThemeToggle)
