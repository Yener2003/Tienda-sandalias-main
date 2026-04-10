import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <header id="header" className="header">
      <div className="container-fluid">
        <Link to="/" className="logo">
          <h1 className="sitename">Lia</h1>
          <span>.</span>
        </Link>

        {/* Agregado el toggle de modo noche */}
        <div className="d-flex align-items-center">
          <ThemeToggle />
          
          <nav id="navmenu" className={`navmenu ${menuOpen ? 'open' : ''} ms-3`}>
            <ul>
              <li>
                <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/#productos" className="" onClick={() => setMenuOpen(false)}>
                  Productos
                </Link>
              </li>
            </ul>
          </nav>

          <button
            className="mobile-nav-toggle ms-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`bi ${menuOpen ? 'bi-x' : 'bi-list'}`}></i>
          </button>

          <Link className="btn-getstarted d-none d-md-block ms-3" to="/" onClick={() => setMenuOpen(false)}>
            Inicio
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
