import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function AdminBottomNav() {
  const location = useLocation()
  const { logout } = useAuth()
  const path = location.pathname
  const [mostrarMenu, setMostrarMenu] = useState(false)

  // Dynamic center button based on current module
  const getCenterAction = () => {
    if (path.includes('/admin/productos')) return { icon: 'bi-box-seam', path: '/admin/producto/nuevo' }
    if (path.includes('/admin/clientes')) return { icon: 'bi-person-plus', path: '/admin/clientes?new=true' }
    return { icon: 'bi-plus-lg', path: '/admin/ventas/nueva' }
  }

  const centerAction = getCenterAction()

  const items = [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin/dashboard' },
    { label: 'Ventas', icon: 'bi-bag-check', path: '/admin/ventas' },
    { label: 'Nueva', icon: centerAction.icon, path: centerAction.path, center: true },
    { label: 'Clientes', icon: 'bi-people', path: '/admin/clientes' },
    { label: 'Menú', icon: 'bi-grid-fill', action: () => setMostrarMenu(!mostrarMenu) },
  ]

  return (
    <>
      {mostrarMenu && (
        <div className="bottom-sheet-overlay" onClick={() => setMostrarMenu(false)}>
          <div className="bottom-sheet-content" onClick={e => e.stopPropagation()}>
            <div className="bottom-sheet-header">
              <div className="bottom-sheet-drag-handle"></div>
            </div>
            <div className="bottom-sheet-grid">
              <Link to="/admin/productos" className="bottom-sheet-item" onClick={() => setMostrarMenu(false)}>
                <i className="bi bi-box-seam"></i>
                <span>Productos</span>
              </Link>
              <Link to="/admin/perfil" className="bottom-sheet-item" onClick={() => setMostrarMenu(false)}>
                <i className="bi bi-person-gear"></i>
                <span>Mi Perfil</span>
              </Link>
              <button className="bottom-sheet-item logout w-100 border-0" onClick={logout}>
                <i className="bi bi-box-arrow-left"></i>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="admin-bottom-nav">
        {items.map((item, index) => (
          item.path ? (
            <Link
              key={index}
              to={item.path}
              className={`nav-item ${path === item.path ? 'active' : ''} ${item.center ? 'nav-item-center' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              {!item.center && <span>{item.label}</span>}
            </Link>
          ) : (
            <button
              key={index}
              onClick={item.action}
              className={`nav-item border-0 bg-transparent ${mostrarMenu ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          )
        ))}
      </nav>
    </>
  )
}

export default AdminBottomNav
