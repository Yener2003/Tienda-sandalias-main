import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getClientes, crearCliente, editarCliente, eliminarCliente } from '../../services/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import AdminBottomNav from '../../components/AdminBottomNav'

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

  useEffect(() => {
    if (!usuario) { navigate('/admin/login'); return }
    document.body.classList.add('admin-body')
    cargar()
    return () => document.body.classList.remove('admin-body')
  }, [usuario, navigate])

  const cargar = async () => {
    setCargando(true)
    try { setClientes(await getClientes()) } catch { setError('Error cargando clientes') }
    setCargando(false)
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

  return (
    <>
      <Navbar />
      <main className="main container py-5" style={{ minHeight: '80vh' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Clientes</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gestión de clientes registrados</p>
          </div>
          <div className="d-flex gap-2 d-none d-md-flex">
            <button onClick={() => navigate('/admin/dashboard')} className="btn btn-outline-secondary btn-sm">← Dashboard</button>
            <button onClick={abrirNuevo} className="btn btn-sm" style={{ background: '#2d6a4f', color: '#fff' }}>+ Nuevo Cliente</button>
          </div>
        </div>

        {/* Tabla */}
        <div className="admin-card p-0" style={{ overflowX: 'auto' }}>
          {cargando ? (
            <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
          ) : clientes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
              <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No hay clientes registrados aún.</p>
              <button onClick={abrirNuevo} className="btn btn-sm" style={{ background: '#2d6a4f', color: '#fff' }}>+ Crear primer cliente</button>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-main)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--primary-color)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th className="ps-3">Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th className="pe-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="ps-3 fw-bold">{c.nombre}</td>
                    <td>{c.telefono || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{c.email || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.direccion || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td className="pe-3">
                      <div className="btn-group btn-group-sm">
                        <button onClick={() => abrirEditar(c)} className="btn btn-outline-primary"><i className="bi bi-pencil"></i></button>
                        <button onClick={() => borrar(c.id)} className="btn btn-outline-danger"><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

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
      <AdminBottomNav />
      <Footer />
    </>
  )
}

export default Clientes
