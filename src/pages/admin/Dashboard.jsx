import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProductosAdmin, eliminarProducto } from '../../services/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import LoadingSpinner from '../../components/LoadingSpinner'
import AdminBottomNav from '../../components/AdminBottomNav'

function Dashboard() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/admin/login')
      return
    }
    document.body.classList.add('admin-body')
    cargarProductos()
    return () => document.body.classList.remove('admin-body')
  }, [usuario, navigate])

  const cargarProductos = async () => {
    try {
      const data = await getProductosAdmin()
      setProductos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      await eliminarProducto(id)
      setProductos(productos.filter(p => p.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (cargando) return (
    <>
      <Navbar />
      <LoadingSpinner />
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <main className="main container py-5" style={{ minHeight: '80vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Panel de Administración</h2>
          <div>
            <span className="me-3">Hola, <strong>{usuario?.nombre}</strong></span>
            <button onClick={logout} className="btn btn-outline-danger btn-sm">Cerrar Sesión</button>
          </div>
        </div>

        <div className="mb-4 d-flex gap-2 d-none d-md-flex">
          <Link to="/admin/producto/nuevo" className="btn" style={{ background: '#2d6a4f', color: '#fff' }}>
            + Nuevo Producto
          </Link>
          <Link to="/" className="btn btn-outline-secondary">Ver Tienda Pública</Link>
        </div>

        {/* Módulos rápidos */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Ventas', desc: 'Historial y seguimiento', icon: 'bi-bag-check', path: '/admin/ventas', color: '#2d6a4f' },
            { label: 'Nueva Venta', desc: 'Registrar una venta', icon: 'bi-plus-circle', path: '/admin/ventas/nueva', color: 'var(--primary-color)' },
            { label: 'Clientes', desc: 'Gestión de clientes', icon: 'bi-people', path: '/admin/clientes', color: '#4895ef' },
          ].map(m => (
            <div key={m.path} className="col-md-4">
              <Link to={m.path} style={{ textDecoration: 'none' }}>
                <div className="admin-card d-flex align-items-center gap-3 py-3" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: m.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bi ${m.icon}`} style={{ color: m.color, fontSize: '1.3rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{m.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.desc}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="table-responsive admin-card p-3">
          <table className="table table-hover align-middle" style={{ color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-main)' }}>
                <th>Img</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Tipo Suela</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
               {productos.map(p => (
                <tr key={p.id} style={!p.activo ? { opacity: 0.6, background: 'var(--bg-color)' } : { borderBottom: '1px solid var(--border-color)' }}>
                  <td data-label="Imagen">
                    <img src={p.imagen_principal} alt={p.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </td>
                  <td data-label="Nombre">
                    <div className="fw-bold" style={{ color: 'var(--text-main)' }}>{p.nombre}</div>
                    {!p.activo && <span className="badge bg-secondary ms-1" style={{ fontSize: '0.65rem' }}>Oculto</span>}
                  </td>
                  <td data-label="Precio" style={{ color: 'var(--text-main)' }}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.precio)}</td>
                  <td data-label="Suela" style={{ color: 'var(--text-main)' }}>{p.tipo_suela === 'alta' ? 'Alta' : 'Baja'}</td>
                  <td data-label="Estado">
                    <span className={`badge ${p.activo ? 'bg-success' : 'bg-secondary'}`} style={{ borderRadius: '20px', padding: '0.4rem 0.8rem' }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="btn-group">
                      <Link to={`/admin/producto/${p.id}/editar`} className="btn btn-sm btn-outline-primary" title="Editar">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => handleEliminar(p.id)} className="btn btn-sm btn-outline-danger" title="Borrar">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No hay productos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <AdminBottomNav />
      <Footer />
    </>
  )
}

export default Dashboard
