import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getClientes, getProductosAdmin, crearVenta } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

function NuevaVenta() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState([{ producto_id: '', cantidad: 1 }])
  // Pago
  const [tipoPago, setTipoPago] = useState('contado')
  const [numCuotas, setNumCuotas] = useState(2)
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) { navigate('/admin/login'); return }
    Promise.all([getClientes(), getProductosAdmin()])
      .then(([cls, prods]) => { setClientes(cls); setProductos(prods) })
      .catch(() => setError('Error cargando datos'))
  }, [usuario, navigate])

  const agregarItem = () => setItems([...items, { producto_id: '', cantidad: 1 }])
  const actualizarItem = (idx, campo, valor) =>
    setItems(items.map((it, i) => i === idx ? { ...it, [campo]: valor } : it))
  const quitarItem = (idx) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)) }
  const getProducto = (id) => productos.find(p => p.id === parseInt(id))

  const total = items.reduce((sum, it) => {
    const p = getProducto(it.producto_id)
    return sum + (p ? p.precio * parseInt(it.cantidad || 1) : 0)
  }, 0)

  const valorCuota = tipoPago === 'credito' && numCuotas > 0 ? Math.ceil(total / numCuotas) : 0

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    const itemsValidos = items.filter(it => it.producto_id)
    if (itemsValidos.length === 0) { setError('Selecciona al menos un producto'); return }
    if (tipoPago === 'credito' && !fechaVencimiento) { setError('Ingresa la fecha de vencimiento del crédito'); return }

    const payload = {
      cliente_id: clienteId || null,
      notas,
      tipo_pago: tipoPago,
      num_cuotas: tipoPago === 'credito' ? numCuotas : 1,
      fecha_vencimiento: tipoPago === 'credito' ? fechaVencimiento : null,
      items: itemsValidos.map(it => {
        const p = getProducto(it.producto_id)
        return { producto_id: p.id, nombre_producto: p.nombre, precio_unitario: p.precio, cantidad: parseInt(it.cantidad) }
      })
    }
    setGuardando(true)
    try { await crearVenta(payload); navigate('/admin/ventas') }
    catch (err) { setError(err.message) }
    setGuardando(false)
  }

  const formatCOP = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  return (
    <AdminLayout>
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Nueva Venta</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Registra una venta con uno o más productos</p>
          </div>
          <button onClick={() => navigate('/admin/ventas')} className="btn btn-outline-secondary btn-sm d-none d-md-block">← Volver</button>
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <form onSubmit={guardar}>
          <div className="row g-4">
            {/* Columna izquierda */}
            <div className="col-lg-8">

              {/* Cliente */}
              <div className="admin-card mb-4">
                <h6 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1 }}>Cliente</h6>
                <select className="form-select" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                  <option value="">— Sin cliente asignado —</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}{c.telefono ? ` · ${c.telefono}` : ''}</option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)' }}>
                  Opcional — puedes <span style={{ color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => window.open('/admin/clientes', '_blank')}>crear un cliente aquí</span>
                </small>
              </div>

              {/* Productos */}
              <div className="admin-card mb-4">
                <h6 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1 }}>Productos</h6>
                {items.map((it, idx) => {
                  const prod = getProducto(it.producto_id)
                  return (
                    <div key={idx} className="d-flex gap-2 align-items-center mb-3" style={{ background: 'var(--bg-color)', borderRadius: 12, padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                      {prod?.imagen_principal && (
                        <img src={prod.imagen_principal} alt={prod.nombre} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <select className="form-select form-select-sm flex-fill" value={it.producto_id} onChange={e => actualizarItem(idx, 'producto_id', e.target.value)}>
                        <option value="">— Selecciona producto —</option>
                        {productos.filter(p => p.activo).map(p => (
                          <option key={p.id} value={p.id}>{p.nombre} · {formatCOP(p.precio)}</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <button type="button" onClick={() => actualizarItem(idx, 'cantidad', Math.max(1, parseInt(it.cantidad || 1) - 1))}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}>−</button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>{it.cantidad}</span>
                        <button type="button" onClick={() => actualizarItem(idx, 'cantidad', parseInt(it.cantidad || 1) + 1)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}>+</button>
                      </div>
                      {prod && <span style={{ color: 'var(--primary-color)', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>{formatCOP(prod.precio * it.cantidad)}</span>}
                      {items.length > 1 && (
                        <button type="button" onClick={() => quitarItem(idx)} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }}>✕</button>
                      )}
                    </div>
                  )
                })}
                <button type="button" onClick={agregarItem} className="btn btn-sm w-100" style={{ background: 'rgba(201,168,76,0.08)', color: 'var(--primary-color)', border: '1px dashed var(--primary-color)', borderRadius: 10 }}>
                  + Agregar otro producto
                </button>
              </div>

              {/* Tipo de Pago */}
              <div className="admin-card mb-4">
                <h6 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1 }}>Tipo de Pago</h6>
                <div className="d-flex gap-3 mb-3">
                  {[
                    { val: 'contado', label: '💵 Contado', desc: 'Pago inmediato — se marca como pagado automáticamente' },
                    { val: 'credito', label: '📋 Crédito', desc: 'Pago diferido en cuotas — queda como pendiente de pago' },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      onClick={() => setTipoPago(opt.val)}
                      style={{
                        flex: 1, padding: '0.75rem 1rem', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${tipoPago === opt.val ? 'var(--primary-color)' : 'var(--border-color)'}`,
                        background: tipoPago === opt.val ? 'rgba(201,168,76,0.08)' : 'var(--bg-color)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: tipoPago === opt.val ? 'var(--primary-color)' : 'var(--text-main)', fontSize: '0.95rem' }}>{opt.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 3 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Opciones de crédito */}
                {tipoPago === 'credito' && (
                  <div style={{ background: 'var(--bg-color)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Número de cuotas *
                        </label>
                        <div className="d-flex align-items-center gap-2">
                          <button type="button" onClick={() => setNumCuotas(Math.max(2, numCuotas - 1))}
                            style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>−</button>
                          <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>{numCuotas}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>cuotas</div>
                          </div>
                          <button type="button" onClick={() => setNumCuotas(numCuotas + 1)}
                            style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>+</button>
                        </div>
                        {total > 0 && (
                          <div style={{ textAlign: 'center', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            ≈ {formatCOP(valorCuota)} / cuota
                          </div>
                        )}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Fecha de vencimiento *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={fechaVencimiento}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setFechaVencimiento(e.target.value)}
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Fecha límite del último pago</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="admin-card">
                <h6 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1 }}>Notas</h6>
                <textarea className="form-control" rows={3} placeholder="Ej: talla especial, color preferido, dirección de entrega..." value={notas} onChange={e => setNotas(e.target.value)} />
              </div>
            </div>

            {/* Resumen */}
            <div className="col-lg-4">
              <div className="admin-card" style={{ position: 'sticky', top: '6rem' }}>
                <h6 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1 }}>Resumen</h6>
                {items.filter(it => it.producto_id).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aún no hay productos seleccionados.</p>
                ) : (
                  <>
                    {items.filter(it => it.producto_id).map((it, idx) => {
                      const p = getProducto(it.producto_id)
                      if (!p) return null
                      return (
                        <div key={idx} className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <span>{p.nombre} ×{it.cantidad}</span>
                          <span style={{ color: 'var(--text-main)' }}>{formatCOP(p.precio * it.cantidad)}</span>
                        </div>
                      )
                    })}
                    <hr style={{ borderColor: 'var(--border-color)' }} />
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{formatCOP(total)}</span>
                    </div>
                    {/* Info de pago en el resumen */}
                    <div style={{ background: 'var(--bg-color)', borderRadius: 10, padding: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>Tipo de pago</span>
                        <span style={{ fontWeight: 700, color: tipoPago === 'credito' ? '#f4a261' : '#2d6a4f' }}>
                          {tipoPago === 'credito' ? '📋 Crédito' : '💵 Contado'}
                        </span>
                      </div>
                      {tipoPago === 'credito' && (
                        <>
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ color: 'var(--text-muted)' }}>Cuotas</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{numCuotas} · {formatCOP(valorCuota)} c/u</span>
                          </div>
                          {fechaVencimiento && (
                            <div className="d-flex justify-content-between">
                              <span style={{ color: 'var(--text-muted)' }}>Vence</span>
                              <span style={{ fontWeight: 700, color: '#e63946' }}>
                                {new Date(fechaVencimiento + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: 'var(--text-muted)' }}>Estado pago</span>
                        <span style={{ fontWeight: 700, color: tipoPago === 'contado' ? '#2d6a4f' : '#f4a261' }}>
                          {tipoPago === 'contado' ? '✅ Pagado' : '⏳ Pendiente'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <button type="submit" disabled={guardando} className="btn w-100 py-2" style={{ background: '#2d6a4f', color: '#fff', fontWeight: 700, borderRadius: 12, fontSize: '1rem' }}>
                  {guardando ? 'Registrando...' : '✓ Registrar Venta'}
                </button>
                <button type="button" onClick={() => navigate('/admin/ventas')} className="btn btn-outline-secondary w-100 mt-2">Cancelar</button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </AdminLayout>
  )
}

export default NuevaVenta
