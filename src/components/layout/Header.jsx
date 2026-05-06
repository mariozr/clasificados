import { useState, useCallback, memo } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'
import SearchBar from '../ui/SearchBar'
import NotificationBell from '../notifications/NotificationBell'

function Header({ onSearch, onShowAuth, onShowCategories, onExplore, onShowMyAds, onShowPublish, onOpenAd }) {
  const { user, signOut, getUserName } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const handleExplore = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    onExplore()
  }, [closeMenu, onExplore])

  const handleCategories = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    onShowCategories()
  }, [closeMenu, onShowCategories])

  const handleMyAds = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    onShowMyAds()
  }, [closeMenu, onShowMyAds])

  const handlePublish = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    if (!user) {
      onShowAuth('login')
      return
    }
    onShowPublish()
  }, [closeMenu, user, onShowAuth, onShowPublish])

  const handleLogin = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    onShowAuth('login')
  }, [closeMenu, onShowAuth])

  const handleRegister = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    onShowAuth('register')
  }, [closeMenu, onShowAuth])

  const handleLogout = useCallback((e) => {
    e.preventDefault()
    closeMenu()
    signOut()
  }, [closeMenu, signOut])

  const handleMobileSearch = useCallback((val) => {
    closeMenu()
    onSearch(val)
  }, [closeMenu, onSearch])

  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <div className="logo">
            <i className="fas fa-rocket"></i>
            <span>Clasi<span className="highlight">Form</span></span>
          </div>

          <div className="header__actions">
            <ThemeToggle />

            {user && (
              <NotificationBell userId={user.id} onOpenAd={onOpenAd} />
            )}

            <button
              className="mobile-menu-btn"
              aria-label="Menu"
              onClick={toggleMenu}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i>
            </button>
          </div>

          <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`} id="mainNav">
            {/* Mobile Search */}
            <div className="search-bar hide-desktop">
              <SearchBar onSearch={handleMobileSearch} placeholder="Buscar anuncios..." />
            </div>

            {/* User Greeting */}
            {user && (
              <div className="nav__item-greeting">
                <i className="fas fa-hand-sparkles"></i>
                <span id="userGreetingText">¡Hola, {getUserName()}!</span>
              </div>
            )}

            {/* My Account Dropdown */}
            {user && (
              <div className={`nav__item-dropdown ${dropdownOpen ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav__link dropdown-trigger"
                  onClick={(e) => {
                    e.preventDefault()
                    if (window.innerWidth <= 768) {
                      setDropdownOpen((prev) => !prev)
                    }
                  }}
                >
                  Mi cuenta <i className="fas fa-chevron-down"></i>
                </a>
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); alert('Próximamente: Podrás editar tus datos de perfil aquí.') }}>
                    <i className="fas fa-user-circle"></i> Mis datos
                  </a>
                  <a href="#" className="dropdown-item" onClick={handleMyAds}>
                    <i className="fas fa-layer-group"></i> Mis publicaciones
                  </a>
                </div>
              </div>
            )}

            <a href="#" className="nav__link active" onClick={handleExplore}>
              Explorar
            </a>
            <a href="#" className="nav__link" onClick={handleCategories}>
              Categorías
            </a>

            {/* Publish button */}
            {user && (
              <a href="#" className="nav__link btn-outline btn-publish" onClick={handlePublish}>
                Publicar <i className="fas fa-plus"></i>
              </a>
            )}

            {/* Auth links */}
            {!user ? (
              <div className="nav__group">
                <a href="#" className="nav__link" onClick={handleLogin}>
                  Iniciar Sesión
                </a>
                <a href="#" className="nav__link btn-outline" onClick={handleRegister}>
                  Registrarse
                </a>
              </div>
            ) : (
              <div className="nav__group">
                <a href="#" className="nav__link" onClick={handleLogout}>
                  Salir <i className="fas fa-sign-out-alt"></i>
                </a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
