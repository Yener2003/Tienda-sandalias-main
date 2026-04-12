import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getClientes, crearCliente, editarCliente, eliminarCliente } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'

const EMPTY = { nombre: '', telefono: '', email: '', direccion: '' }

function Clientes() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const location = useLocation()

  useEffect(() => {
    if (!usuario) { navigate('/admin/login'); return }
    cargar()
  }, [usuario, navigate])

  useEffect(() => {
    // Escuchar cambios en la URL para abrir el modal (botón central mobile)
    const params = new URLSearchParams(location.search)
    if (params.get('new') === 'true') {
      abrirNuevo()
      // Limpiar el parámetro para evitar reaperturas accidentales al recargar
      navigate('/admin/clientes', { replace: true })
    }
  }, [location.search])

  const cargar = async () => {
    try { setClientes(await getClientes()) } catch { setError('Error cargando clientes') }
    finally { setCargando(false) }
  }

  const abrirNuevo = () => { setEditando(null); setForm(EMPTY); setError(''); setModal(true) }
  const abrirEditar = (c) => { setEditando(c); setForm({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' }); setError(''); setModal(true) }
  const cerrar = () => setModal(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setGuardando(true); setError('')
    try {
      if (editando) {
        const updated = await editarCliente(editando.id, form)
        setClientes(clientes.map(c => c.id === editando.id ? updated : c))
      } else {
        const nuevo = await crearCliente(form)
        setClientes([nuevo, ...clientes])
      }
      cerrar()
    } catch (err) { setError(err.message) }
    setGuardando(false)
  }

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return
    try { await eliminarCliente(id); setClientes(clientes.filter(c => c.id !== id)) }
    catch (err) { alert(err.message) }
  }

  if (cargando) return (
    <AdminLayout>
      <LoadingSpinner />
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <main className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.5rem' }}>Clientes</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>{clientes.length} registrados</p>
          </div>
          <div className="d-flex gap-2">
            <button onClick={abrirNuevo} className="btn btn-sm d-none d-md-block" style={{ background: '#2d6a4f', color: '#fff' }}>+ Nuevo</button>
            <button onClick={() => navigate('/admin/dashboard')} className="btn btn-outline-secondary btn-sm d-none d-md-block">← Inicio</button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="table-responsive admin-card p-2 d-none d-md-block">
          <table className="table table-hover align-middle table-compact mb-0" style={{ color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--primary-color)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ paddingLeft: '1rem !important' }}>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th className="text-end" style={{ paddingRight: '1rem !important' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td className="fw-bold" style={{ paddingLeft: '1rem !important' }}>{c.nombre}</td>
                  <td>{c.telefono || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{c.email || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{c.direccion || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td className="text-end" style={{ paddingRight: '1rem !important' }}>
                    <div className="btn-group btn-group-sm">
                      <button onClick={() => abrirEditar(c)} className="btn btn-outline-primary"><i className="bi bi-pencil"></i></button>
                      <button onClick={() => borrar(c.id)} className="btn btn-outline-danger"><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Compact List */}
        <div className="d-md-none">
          {clientes.map(c => (
            <div key={c.id} className="compact-item">
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-color)22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bi bi-person" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
              </div>
              <div className="compact-item-info">
                <div className="compact-item-title" style={{ fontSize: '0.95rem' }}>{c.nombre}</div>
                <div className="compact-item-sub">
                  <i className="bi bi-telephone me-1"></i>{c.telefono || 'Sin tel'}
                  {c.email && <><span className="mx-1">·</span><i className="bi bi-envelope me-1"></i>{c.email.split('@')[0]}</>}
                </div>
              </div>
              <div className="d-flex gap-1 align-items-center">
                <button onClick={() => abrirEditar(c)} className="btn btn-outline-primary btn-sm px-2 py-1"><i className="bi bi-pencil" style={{ fontSize: '0.8rem' }}></i></button>
                <button onClick={() => borrar(c.id)} className="btn btn-outline-danger btn-sm px-2 py-1"><i className="bi bi-trash" style={{ fontSize: '0.8rem' }}></i></button>
              </div>
            </div>
          ))}
        </div>

        {!cargando && clientes.length === 0 && (
          <div className="admin-card text-center py-5">
            <i className="bi bi-people d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}></i>
            <p style={{ color: 'var(--text-muted)' }}>No hay clientes registrados aún.</p>
            <button onClick={abrirNuevo} className="btn btn-sm" style={{ background: '#2d6a4f', color: '#fff' }}>+ Crear primero</button>
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="admin-card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
                <button onClick={cerrar} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
              </div>
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
              <form onSubmit={guardar}>
                {[
                  { label: 'Nombre *', key: 'nombre', type: 'text', required: true },
                  { label: 'Teléfono', key: 'telefono', type: 'tel' },
                  { label: 'Email', key: 'email', type: 'email' },
                ].map(({ label, key, type }) => (
                  <div className="mb-3" key={key}>
                    <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</label>
                    <input type={type} className="form-control" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="mb-4">
                  <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dirección</label>
                  <textarea className="form-control" rows={2} value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
                </div>
                <div className="d-flex gap-2">
                  <button type="button" onClick={cerrar} className="btn btn-outline-secondary flex-fill">Cancelar</button>
                  <button type="submit" disabled={guardando} className="btn flex-fill" style={{ background: '#2d6a4f', color: '#fff' }}>
                    {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear Cliente')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  )
}

export default Clientes
