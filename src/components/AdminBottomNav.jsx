import { Link, useLocation } from 'react-router-dom'

function AdminBottomNav() {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin/dashboard' },
    { label: 'Ventas', icon: 'bi-bag-check', path: '/admin/ventas' },
    { label: 'Nueva', icon: 'bi-plus-lg', path: '/admin/ventas/nueva', center: true },
    { label: 'Clientes', icon: 'bi-people', path: '/admin/clientes' },
    { label: 'Productos', icon: 'bi-box-seam', path: '/admin/dashboard' }, // Links to dashboard which has product list
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
