import { memo } from 'react'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} ClasiForm - Hecho con{' '}
          <i className="fas fa-heart" style={{ color: '#ff4757' }}></i> en
          Argentina
        </p>
      </div>
    </footer>
  )
}

export default memo(Footer)
