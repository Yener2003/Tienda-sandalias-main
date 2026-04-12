import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProductosAdmin, eliminarProducto } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'

function ProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) { navigate('/admin/login'); return }
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
    <AdminLayout>
      <LoadingSpinner />
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.5rem' }}>Inventario</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>{productos.length} productos registrados</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/producto/nuevo" className="btn btn-sm" style={{ background: '#2d6a4f', color: '#fff' }}>
              + Nuevo
            </Link>
            <Link to="/" className="btn btn-outline-secondary btn-sm d-none d-md-block">Ver Tienda</Link>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="table-responsive admin-card p-2 d-none d-md-block">
          <table className="table table-hover align-middle table-compact mb-0" style={{ color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--primary-color)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ width: 60 }}>Img</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Suela</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
               {productos.map(p => (
                <tr key={p.id} style={!p.activo ? { opacity: 0.6 } : {}}>
                  <td>
                    <img src={p.imagen_principal} alt={p.nombre} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  </td>
                  <td>
                    <div className="fw-bold">{p.nombre}</div>
                  </td>
                  <td className="fw-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.precio)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{p.tipo_suela === 'alta' ? 'Plataforma' : 'Baja'}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <Link to={`/admin/producto/${p.id}/editar`} className="btn btn-outline-primary"><i className="bi bi-pencil"></i></Link>
                      <button onClick={() => handleEliminar(p.id)} className="btn btn-outline-danger"><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Compact List */}
        <div className="d-md-none">
          {productos.map(p => (
            <div key={p.id} className="compact-item" style={!p.activo ? { opacity: 0.6 } : {}}>
              <img src={p.imagen_principal} alt={p.nombre} className="compact-item-img" />
              <div className="compact-item-info">
                <div className="compact-item-title">{p.nombre}</div>
                <div className="compact-item-sub">
                  <span className="fw-bold" style={{ color: 'var(--primary-color)' }}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.precio)}</span>
                  <span className="mx-1">·</span>
                  <span>{p.tipo_suela === 'alta' ? 'Alta' : 'Baja'}</span>
                </div>
              </div>
              <div className="d-flex flex-column gap-1 align-items-end">
                <div className="btn-group btn-group-sm">
                  <Link to={`/admin/producto/${p.id}/editar`} className="btn btn-outline-primary btn-sm px-2"><i className="bi bi-pencil" style={{ fontSize: '0.8rem' }}></i></Link>
                  <button onClick={() => handleEliminar(p.id)} className="btn btn-outline-danger btn-sm px-2"><i className="bi bi-trash" style={{ fontSize: '0.8rem' }}></i></button>
                </div>
                <span className={`badge ${p.activo ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.55rem', padding: '0.2rem 0.4rem' }}>{p.activo ? 'A' : 'I'}</span>
              </div>
            </div>
          ))}
        </div>

        {productos.length === 0 && !cargando && (
          <div className="admin-card text-center py-5">
            <i className="bi bi-box-seam d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}></i>
            <p style={{ color: 'var(--text-muted)' }}>No hay productos registrados.</p>
          </div>
        )}
      </main>
    </AdminLayout>
  )
}

export default ProductosAdmin
