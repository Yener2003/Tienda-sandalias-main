import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProductosAdmin, eliminarProducto } from '../../services/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import LoadingSpinner from '../../components/LoadingSpinner'

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
    cargarProductos()
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

        <div className="mb-4 d-flex gap-2">
          <Link to="/admin/producto/nuevo" className="btn" style={{ background: '#2d6a4f', color: '#fff' }}>
            + Nuevo Producto
          </Link>
          <Link to="/" className="btn btn-outline-secondary">Ver Tienda Pública</Link>
        </div>

        <div className="table-responsive bg-white p-3 rounded shadow-sm">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
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
                <tr key={p.id}>
                  <td data-label="Imagen">
                    <img src={p.imagen_principal} alt={p.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td data-label="Nombre">{p.nombre}</td>
                  <td data-label="Precio">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.precio)}</td>
                  <td data-label="Suela">{p.tipo_suela === 'alta' ? 'Alta' : 'Baja'}</td>
                  <td data-label="Estado">
                    <span className={`badge ${p.activo ? 'bg-success' : 'bg-secondary'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="btn-group">
                      <Link to={`/admin/producto/${p.id}/editar`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-pencil"></i> Editar
                      </Link>
                      <button onClick={() => handleEliminar(p.id)} className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-trash"></i> Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">No hay productos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Dashboard
