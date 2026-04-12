import { Link, useLocation } from 'react-router-dom'

function AdminBottomNav() {
  const location = useLocation()
  const path = location.pathname

  // Dynamic center button based on current module
  const getCenterAction = () => {
    if (path.includes('/admin/productos')) return { icon: 'bi-plus-lg', path: '/admin/producto/nuevo' }
    if (path.includes('/admin/clientes')) return { icon: 'bi-person-plus', path: '/admin/clientes' } // Modal handled in page usually, but we could add a dedicated /nuevo
    return { icon: 'bi-plus-lg', path: '/admin/ventas/nueva' }
  }

  const centerAction = getCenterAction()

  const items = [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin/dashboard' },
    { label: 'Ventas', icon: 'bi-bag-check', path: '/admin/ventas' },
    { label: 'Nueva', icon: centerAction.icon, path: centerAction.path, center: true },
    { label: 'Clientes', icon: 'bi-people', path: '/admin/clientes' },
    { label: 'Productos', icon: 'bi-box-seam', path: '/admin/productos' },
  ]

  return (
    <nav className="admin-bottom-nav">
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={`nav-item ${path === item.path ? 'active' : ''} ${item.center ? 'nav-item-center' : ''}`}
        >
          <i className={`bi ${item.icon}`}></i>
          {!item.center && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  )
}

export default AdminBottomNav
