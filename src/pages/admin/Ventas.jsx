import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getVentas, cambiarEstadoVenta, cambiarEstadoPagoVenta, eliminarVenta } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: '#f4a261' },
  { value: 'enviado',   label: 'Enviado',   color: '#4895ef' },
  { value: 'entregado', label: 'Entregado', color: '#2d6a4f' },
  { value: 'cancelado', label: 'Cancelado', color: '#e63946' },
]

const ESTADOS_PAGO = [
  { value: 'pendiente', label: '⏳ Pendiente', color: '#f4a261' },
  { value: 'abonado',   label: '💰 Abonado',   color: '#4895ef' },
  { value: 'pagado',    label: '✅ Pagado',    color: '#2d6a4f' },
]

const estadoInfo = (val) => ESTADOS.find(e => e.value === val) || ESTADOS[0]
const pagoInfo = (val) => ESTADOS_PAGO.find(e => e.value === val) || ESTADOS_PAGO[0]

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

const formatFecha = (str) =>
  new Date(str).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

function Ventas() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [expandida, setExpandida] = useState(null)

  useEffect(() => {
    if (!usuario) { navigate('/admin/login'); return }
    cargar()
  }, [usuario, navigate])

  const cargar = async () => {
    setCargando(true)
    try { setVentas(await getVentas()) } catch (e) { console.error(e) }
    setCargando(false)
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoVenta(id, estado)
      setVentas(ventas.map(v => v.id === id ? { ...v, estado } : v))
    } catch (err) { alert(err.message) }
  }

  const cambiarPago = async (id, estado_pago) => {
    try {
      await cambiarEstadoPagoVenta(id, estado_pago)
      setVentas(ventas.map(v => v.id === id ? { ...v, estado_pago } : v))
    } catch (err) { alert(err.message) }
  }

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar esta venta?')) return
    try { await eliminarVenta(id); setVentas(ventas.filter(v => v.id !== id)) }
    catch (err) { alert(err.message) }
  }

  const totalVentas = ventas.reduce((s, v) => s + v.total, 0)
  const cobrado = ventas.filter(v => v.estado_pago === 'pagado').reduce((s, v) => s + v.total, 0)
  const porCobrar = totalVentas - cobrado
  const pendientes = ventas.filter(v => v.estado === 'pendiente').length

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
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Ventas</h2>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/clientes" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-people me-1"></i>Clientes
            </Link>
            <Link to="/admin/ventas/nueva" className="btn btn-sm" style={{ background: '#2d6a4f', color: '#fff' }}>
              + Nueva Venta
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Ventas', value: formatCOP(totalVentas), icon: 'bi-bag-check', color: 'var(--primary-color)', big: true },
            { label: 'Cobrado', value: formatCOP(cobrado), icon: 'bi-cash-stack', color: '#2d6a4f', big: true },
            { label: 'Por Cobrar', value: formatCOP(porCobrar), icon: 'bi-clock-history', color: '#f4a261', big: true },
            { label: 'Pend. Entrega', value: pendientes, icon: 'bi-truck', color: '#4895ef' },
          ].map((s, i) => (
            <div key={i} className="col-6 col-lg-3">
              <div className="admin-card stats-card">
                <i className={`bi ${s.icon}`} style={{ fontSize: '1.4rem', color: s.color }}></i>
                <div className="stats-value" style={{ fontSize: s.big ? '0.95rem' : '1.5rem', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista */}
        {cargando ? (
          <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Cargando ventas...</p>
        ) : ventas.length === 0 ? (
          <div className="admin-card text-center py-5">
            <i className="bi bi-bag" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No hay ventas registradas aún.</p>
            <Link to="/admin/ventas/nueva" className="btn btn-sm" style={{ background: '#2d6a4f', color: '#fff' }}>+ Registrar primera venta</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {ventas.map(v => {
              const est = estadoInfo(v.estado)
              const pInfo = pagoInfo(v.estado_pago)
              const abierta = expandida === v.id
              return (
                <div key={v.id} className="admin-card p-0" style={{ overflow: 'hidden' }}>
                  {/* Fila principal */}
                  <div
                    className="d-flex align-items-center gap-3 flex-wrap p-3"
                    style={{ cursor: 'pointer', borderBottom: abierta ? '1px solid var(--border-color)' : 'none' }}
                    onClick={() => setExpandida(abierta ? null : v.id)}
                  >
                    {/* ID + fecha */}
                    <div style={{ minWidth: 80 }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.85rem' }}>#{v.id}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatFecha(v.created_at)}</div>
                    </div>

                    {/* Cliente */}
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{v.cliente_nombre || <span style={{ color: 'var(--text-muted)' }}>Sin cliente</span>}</div>
                      <div className="d-flex gap-2 align-items-center">
                         <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: 4, background: v.tipo_pago === 'credito' ? 'rgba(244,162,97,0.15)' : 'rgba(45,106,79,0.15)', color: v.tipo_pago === 'credito' ? '#f4a261' : '#2d6a4f', fontWeight: 700, textTransform: 'uppercase' }}>
                          {v.tipo_pago}
                        </span>
                        {v.cliente_telefono && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{v.cliente_telefono}</span>}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-end" style={{ minWidth: 100 }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatCOP(v.total)}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{v.items?.length || 0} items</div>
                    </div>

                    {/* Estado Entrega */}
                    <div onClick={e => e.stopPropagation()} style={{ minWidth: 130 }} className="flex-fill flex-md-grow-0">
                      <select
                        className="form-select form-select-sm"
                        value={v.estado}
                        onChange={e => cambiarEstado(v.id, e.target.value)}
                        style={{ background: est.color + '22', color: est.color, border: `1px solid ${est.color}44`, fontWeight: 700, borderRadius: 20 }}
                      >
                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </div>

                    {/* Estado Pago */}
                    <div onClick={e => e.stopPropagation()} style={{ minWidth: 130 }} className="flex-fill flex-md-grow-0">
                      <select
                        className="form-select form-select-sm"
                        value={v.estado_pago}
                        onChange={e => cambiarPago(v.id, e.target.value)}
                        style={{ background: pInfo.color + '22', color: pInfo.color, border: `1px solid ${pInfo.color}44`, fontWeight: 700, borderRadius: 20 }}
                      >
                        {ESTADOS_PAGO.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </div>

                    {/* Acciones */}
                    <div onClick={e => e.stopPropagation()} className="d-none d-md-block">
                      <button onClick={() => borrar(v.id)} className="btn btn-sm btn-outline-danger" title="Eliminar">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                    <i className={`bi bi-chevron-${abierta ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)' }}></i>
                  </div>

                  {/* Detalle expandible */}
                  {abierta && (
                    <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-color)' }}>
                      <div className="row g-3">
                        <div className="col-md-7">
                          <p style={{ color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, marginBottom: '0.5rem' }}>Productos</p>
                          {v.items?.map((it, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center py-1" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {it.imagen_principal && <img src={it.imagen_principal} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                                <span style={{ color: 'var(--text-main)' }}>{it.nombre_producto}</span>
                                <span style={{ color: 'var(--text-muted)' }}>×{it.cantidad}</span>
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCOP(it.precio_unitario * it.cantidad)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="col-md-5">
                           {v.tipo_pago === 'credito' && (
                            <div className="mb-3 p-2 rounded" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid var(--border-color)' }}>
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Abono inicial:</span>
                                <span style={{ fontWeight: 600, color: '#2d6a4f' }}>{formatCOP(v.abono_inicial || 0)}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Saldo pendiente:</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCOP(v.total - (v.abono_inicial || 0))}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Valor cuota:</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{v.num_cuotas > 0 ? formatCOP(Math.ceil((v.total - (v.abono_inicial || 0)) / v.num_cuotas)) : '—'}</span>
                              </div>
                              <div className="d-flex justify-content-between" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Vencimiento:</span>
                                <span style={{ fontWeight: 700, color: '#e63946' }}>{v.fecha_vencimiento ? formatFecha(v.fecha_vencimiento) : 'No definida'}</span>
                              </div>
                            </div>
                          )}
                          {v.notas && (
                            <>
                              <p style={{ color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, marginBottom: '0.5rem' }}>Notas</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{v.notas}</p>
                            </>
                          )}
                          <div className="mt-3 d-md-none">
                            <button onClick={() => borrar(v.id)} className="btn btn-sm btn-outline-danger w-100">
                                <i className="bi bi-trash me-1"></i> Eliminar Venta
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </AdminLayout>
  )
}

export default Ventas


