import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminSidebar() {
  const location = useLocation()
  const { logout } = useAuth()
  const path = location.pathname

  const links = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-speedometer2' },
    { label: 'Ventas', path: '/admin/ventas', icon: 'bi-bag-check' },
    { label: 'Clientes', path: '/admin/clientes', icon: 'bi-people' },
    { label: 'Productos', path: '/admin/productos', icon: 'bi-box-seam' },
    { label: 'Nueva Venta', path: '/admin/ventas/nueva', icon: 'bi-plus-circle' }
  ]

  return (
    <aside className="admin-sidebar shadow-sm">
      <Link to="/admin/dashboard" className="sidebar-logo">
        Lia<span>.</span>Admin
      </Link>
      
      <nav className="sidebar-nav">
        {links.map(link => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`sidebar-link ${path === link.path ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon}`}></i>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-link w-100 border-0 bg-transparent text-danger">
          <i className="bi bi-box-arrow-left"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
