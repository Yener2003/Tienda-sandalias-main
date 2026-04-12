import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getVentas, cambiarEstadoVenta, cambiarEstadoPagoVenta, eliminarVenta, registrarPagoVenta } from '../../services/api'

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
  const [ventaPago, setVentaPago] = useState(null) // Venta seleccionada para pagar
  const [montoPago, setMontoPago] = useState(0)
  const [medioPago, setMedioPago] = useState('efectivo')
  const [tipoPagoModal, setTipoPagoModal] = useState('total') // total | abono
  const [procesandoPago, setProcesandoPago] = useState(false)


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
  const confirmarPago = async () => {
    if (montoPago <= 0) return alert('Ingrese un monto válido')
    setProcesandoPago(true)
    try {
      const saldoRestante = ventaPago.total - (ventaPago.abono_inicial || 0)
      const nuevoEstadoPago = (tipoPagoModal === 'total' || montoPago >= saldoRestante) ? 'pagado' : 'abonado'
      
      const ventaAct = await registrarPagoVenta(ventaPago.id, {
        monto: montoPago,
        medio_pago: medioPago,
        estado_pago: nuevoEstadoPago
      })
      
      setVentas(ventas.map(v => v.id === ventaPago.id ? { ...v, ...ventaAct } : v))
      setVentaPago(null)
    } catch (err) { alert(err.message) }
    setProcesandoPago(false)
  }

  const abrirModalPago = (venta) => {
    setVentaPago(venta)
    const saldo = venta.total - (venta.abono_inicial || 0)
    setMontoPago(saldo)
    setTipoPagoModal('total')
    setMedioPago('efectivo')
  }

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar esta venta?')) return
    try { await eliminarVenta(id); setVentas(ventas.filter(v => v.id !== id)) }
    catch (err) { alert(err.message) }
  }


  const totalVentas = ventas.reduce((s, v) => s + v.total, 0)
  const cobrado = ventas.reduce((s, v) => s + (v.abono_inicial || 0), 0)
  const porCobrar = Math.max(0, totalVentas - cobrado)
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
                    style={{ cursor: 'pointer', borderBottom: abierta ? '1px solid var(--border-color)' : 'none', padding: '0.75rem 1rem' }}
                    onClick={() => setExpandida(abierta ? null : v.id)}
                  >
                    {/* Fila 1: ID + Cliente + Total + Chevron */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      {/* ID + fecha */}
                      <div style={{ minWidth: 60 }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.82rem' }}>#{v.id}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{formatFecha(v.created_at)}</div>
                      </div>

                      {/* Cliente */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.cliente_nombre || <span style={{ color: 'var(--text-muted)' }}>Sin cliente</span>}
                        </div>
                        <div className="d-flex gap-1 align-items-center">
                          <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: v.tipo_pago === 'credito' ? 'rgba(244,162,97,0.15)' : 'rgba(45,106,79,0.15)', color: v.tipo_pago === 'credito' ? '#f4a261' : '#2d6a4f', fontWeight: 700, textTransform: 'uppercase' }}>
                            {v.tipo_pago}
                          </span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-end" style={{ flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>{formatCOP(v.total)}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{v.items?.length || 0} items</div>
                      </div>

                      <i className={`bi bi-chevron-${abierta ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', flexShrink: 0 }}></i>
                    </div>

                    {/* Fila 2: Selectores + Acciones */}
                    <div className="d-flex align-items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                      {/* Estado Entrega */}
                      <select
                        className="form-select form-select-sm"
                        value={v.estado}
                        onChange={e => cambiarEstado(v.id, e.target.value)}
                        style={{ background: est.color + '22', color: est.color, border: `1px solid ${est.color}44`, fontWeight: 700, borderRadius: 20, width: 'auto', flex: '1 1 auto', minWidth: 110, maxWidth: 150 }}
                      >
                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>

                      {/* Estado Pago */}
                      <select
                        className="form-select form-select-sm"
                        value={v.estado_pago}
                        onChange={e => cambiarPago(v.id, e.target.value)}
                        style={{ background: pInfo.color + '22', color: pInfo.color, border: `1px solid ${pInfo.color}44`, fontWeight: 700, borderRadius: 20, width: 'auto', flex: '1 1 auto', minWidth: 120, maxWidth: 160 }}
                      >
                        {ESTADOS_PAGO.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>

                      {/* Acciones */}
                      <div className="d-flex gap-2 align-items-center ms-auto">
                        {(v.estado_pago === 'pendiente' || v.estado_pago === 'abonado') && (
                          <button 
                            onClick={() => abrirModalPago(v)} 
                            className="btn btn-sm" 
                            style={{ background: '#2d6a4f', color: '#fff', borderRadius: 20, fontSize: '0.75rem', padding: '0.2rem 0.75rem', fontWeight: 600, flexShrink: 0 }}
                          >
                            💸 Pagar
                          </button>
                        )}
                        <div className="d-none d-md-block">
                          <button onClick={() => borrar(v.id)} className="btn btn-sm btn-outline-danger" title="Eliminar">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
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
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Frecuencia:</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{v.frecuencia_pago || 'unico'}</span>
                              </div>
                              {v.medio_pago && (
                                <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.82rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Medio de pago:</span>
                                  <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{v.medio_pago}</span>
                                </div>
                              )}
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


      {/* Modal de Pago */}
      {ventaPago && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setVentaPago(null)}>
          <div className="admin-card" style={{ maxWidth: 400, width: '100%', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h5 className="mb-3" style={{ fontWeight: 800 }}>Registrar Pago #{ventaPago.id}</h5>
            
            <div className="mb-4 p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--text-muted)' }}>Total Venta:</span>
                <span style={{ fontWeight: 700 }}>{formatCOP(ventaPago.total)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--text-muted)' }}>Abonado:</span>
                <span style={{ fontWeight: 700, color: '#2d6a4f' }}>{formatCOP(ventaPago.abono_inicial || 0)}</span>
              </div>
              <div className="d-flex justify-content-between" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 8 }}>
                <span style={{ fontWeight: 700 }}>Saldo Pendiente:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{formatCOP(ventaPago.total - (ventaPago.abono_inicial || 0))}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tipo de Pago</label>
              <div className="d-flex gap-2">
                <button 
                  className={`btn btn-sm flex-fill ${tipoPagoModal === 'total' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={tipoPagoModal === 'total' ? { background: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
                  onClick={() => { setTipoPagoModal('total'); setMontoPago(ventaPago.total - (ventaPago.abono_inicial || 0)) }}
                >Pago Total</button>
                <button 
                   className={`btn btn-sm flex-fill ${tipoPagoModal === 'abono' ? 'btn-primary' : 'btn-outline-secondary'}`}
                   style={tipoPagoModal === 'abono' ? { background: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
                   onClick={() => setTipoPagoModal('abono')}
                >Abono Parcial</button>
              </div>
            </div>

            {tipoPagoModal === 'abono' && (
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Monto a pagar</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={montoPago} 
                    onChange={e => setMontoPago(Math.min(ventaPago.total - (ventaPago.abono_inicial || 0), parseInt(e.target.value || 0)))}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Medio de Pago</label>
              <select className="form-select" value={medioPago} onChange={e => setMedioPago(e.target.value)}>
                <option value="efectivo">💵 Efectivo</option>
                <option value="transferencia">📱 Transferencia</option>
                <option value="bancolombia">🏦 Bancolombia / Nequi</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary flex-fill" 
                onClick={() => setVentaPago(null)}
                disabled={procesandoPago}
              >Cancelar</button>
              <button 
                className="btn flex-fill" 
                style={{ background: '#2d6a4f', color: '#fff', fontWeight: 700 }}
                onClick={confirmarPago}
                disabled={procesandoPago}
              >
                {procesandoPago ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>

  )
}

export default Ventas


