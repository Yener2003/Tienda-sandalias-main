import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getClientes, getProductosAdmin, crearVenta } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import ReceiptModal from '../../components/ReceiptModal'

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
  const [abonoInicial, setAbonoInicial] = useState(0)
  const [tipoAbono, setTipoAbono] = useState('ninguno') // ninguno | parcial | total
  const [frecuenciaPago, setFrecuenciaPago] = useState('unico') // unico | semanal | quincenal | mensual
  const [ventaCreada, setVentaCreada] = useState(null)
  const [verTirillaFinal, setVerTirillaFinal] = useState(false)
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

  const montoAbonoEfectivo = tipoAbono === 'total' ? total : (tipoAbono === 'parcial' ? abonoInicial : 0)
  const saldoPendiente = Math.max(0, total - montoAbonoEfectivo)
  const valorCuota = tipoPago === 'credito' && numCuotas > 0 ? Math.ceil(saldoPendiente / numCuotas) : 0
  
  const calcularFechaSiguiente = (fecha, freq) => {
    if (!fecha) return null
    const date = new Date(fecha + 'T12:00:00') // Usar mediodía para evitar problemas de zona horaria
    if (freq === 'semanal') date.setDate(date.getDate() + 7)
    else if (freq === 'quincenal') date.setDate(date.getDate() + 15)
    else if (freq === 'mensual') date.setMonth(date.getMonth() + 1)
    else return null
    return date
  }

  const fechaSegundaCuota = numCuotas > 1 ? calcularFechaSiguiente(fechaVencimiento, frecuenciaPago) : null

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
      frecuencia_pago: tipoPago === 'credito' ? frecuenciaPago : 'unico',
      abono_inicial: tipoPago === 'credito' ? montoAbonoEfectivo : total,
      estado_pago: tipoPago === 'contado' || tipoAbono === 'total' ? 'pagado' : (tipoAbono === 'parcial' && abonoInicial > 0 ? 'abonado' : 'pendiente'),
      items: itemsValidos.map(it => {
        const p = getProducto(it.producto_id)
        return { producto_id: p.id, nombre_producto: p.nombre, precio_unitario: p.precio, cantidad: parseInt(it.cantidad) }
      })
    }
    setGuardando(true)
    try { 
      const res = await crearVenta(payload)
      setVentaCreada(res.venta)
    }
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
            <div className="col-lg-8 order-1">

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
                    <div key={idx} className="d-flex gap-2 align-items-center mb-3 flex-wrap" style={{ background: 'var(--bg-color)', borderRadius: 12, padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: '100%', marginBottom: '0.5rem' }}>
                        {prod?.imagen_principal && (
                          <img src={prod.imagen_principal} alt={prod.nombre} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <select className="form-select form-select-sm" value={it.producto_id} onChange={e => actualizarItem(idx, 'producto_id', e.target.value)}>
                            <option value="">— Selecciona producto —</option>
                            {productos.filter(p => p.activo).map(p => (
                              <option key={p.id} value={p.id}>{p.nombre} · {formatCOP(p.precio)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between w-100 mt-1">
                        <div className="d-flex align-items-center gap-2" style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 8 }}>
                          <button type="button" onClick={() => actualizarItem(idx, 'cantidad', Math.max(1, parseInt(it.cantidad || 1) - 1))}
                            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 800 }}>−</button>
                          <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, color: 'var(--text-main)' }}>{it.cantidad}</span>
                          <button type="button" onClick={() => actualizarItem(idx, 'cantidad', parseInt(it.cantidad || 1) + 1)}
                            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 800 }}>+</button>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                            {prod ? formatCOP(prod.precio * it.cantidad) : '$0'}
                          </div>

                          {items.length > 1 && (
                            <button type="button" onClick={() => quitarItem(idx)} style={{ background: 'rgba(230,57,70,0.1)', border: 'none', color: '#e63946', cursor: 'pointer', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          )}
                        </div>
                      </div>
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
                <div className="row g-3">
                  {[
                    { val: 'contado', label: '💵 Contado', desc: 'Pago inmediato' },
                    { val: 'credito', label: '📋 Crédito', desc: 'Pago diferido' },
                  ].map(opt => (
                    <div key={opt.val} className="col-6">
                      <div
                        onClick={() => setTipoPago(opt.val)}
                        style={{
                          padding: '0.6rem 0.8rem', borderRadius: 12, cursor: 'pointer',
                          border: `2px solid ${tipoPago === opt.val ? 'var(--primary-color)' : 'var(--border-color)'}`,
                          background: tipoPago === opt.val ? 'rgba(201,168,76,0.08)' : 'var(--bg-color)',
                          transition: 'all 0.2s',
                          height: '100%'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: tipoPago === opt.val ? 'var(--primary-color)' : 'var(--text-main)', fontSize: '0.85rem' }}>{opt.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>


                {/* Opciones de crédito */}
                {tipoPago === 'credito' && (
                  <div style={{ background: 'var(--bg-color)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Abono Inicial (Hoy)
                        </label>
                        <div className="d-flex flex-wrap gap-2" style={{ maxWidth: '100%' }}>
                          {[
                            { val: 'ninguno', label: 'Sin abono' },
                            { val: 'parcial', label: 'Parcial' },
                          ].map(opt => (
                            <button
                              key={opt.val}
                              type="button"
                              className={`btn btn-sm flex-fill ${tipoAbono === opt.val ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setTipoAbono(opt.val)}
                              style={tipoAbono === opt.val ? { 
                                background: 'var(--primary-color)', 
                                borderColor: 'var(--primary-color)',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              } : { fontSize: '0.75rem' }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {tipoAbono === 'parcial' && (
                          <div className="mt-2">
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="¿Cuánto abonó?"
                                value={abonoInicial}
                                onChange={e => setAbonoInicial(Math.min(total, parseInt(e.target.value || 0)))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="col-sm-6">
                        <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Número de cuotas *
                        </label>
                        <div className="d-flex align-items-center gap-2" style={{ maxWidth: 220 }}>
                          <button type="button" onClick={() => setNumCuotas(Math.max(1, numCuotas - 1))}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>−</button>
                          <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>{numCuotas}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>cuotas</div>
                          </div>
                          <button type="button" onClick={() => setNumCuotas(numCuotas + 1)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>+</button>
                        </div>

                        {saldoPendiente > 0 && (
                          <div style={{ textAlign: 'center', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            ≈ {formatCOP(valorCuota)} / cuota
                          </div>
                        )}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Fecha del primer pago *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={fechaVencimiento}
                          onChange={e => setFechaVencimiento(e.target.value)}
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Día que el cliente debe pagar</small>
                      </div>

                      <div className="col-12 mt-3">
                        <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Frecuencia de cobro *
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {[
                            { val: 'unico', label: 'Pago Único' },
                            { val: 'semanal', label: 'Semanal' },
                            { val: 'quincenal', label: 'Quincenal' },
                            { val: 'mensual', label: 'Mensual' },
                          ].map(f => (
                            <button
                              key={f.val}
                              type="button"
                              className={`btn btn-sm ${frecuenciaPago === f.val ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setFrecuenciaPago(f.val)}
                              style={frecuenciaPago === f.val ? { 
                                background: 'var(--primary-color)', 
                                borderColor: 'var(--primary-color)',
                                fontWeight: 700
                              } : {}}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
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
            <div className="col-lg-4 order-2">
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
                            <div className="d-flex justify-content-between mb-1">
                              <span style={{ color: 'var(--text-muted)' }}>{frecuenciaPago === 'unico' ? 'Vence' : 'Primer pago'}</span>
                              <span style={{ fontWeight: 700, color: '#e63946' }}>
                                {new Date(fechaVencimiento + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                          {fechaSegundaCuota && (
                            <div className="d-flex justify-content-between mb-1">
                              <span style={{ color: 'var(--text-muted)' }}>Segundo pago</span>
                              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                                {fechaSegundaCuota.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className="d-flex justify-content-between">
                            <span style={{ color: 'var(--text-muted)' }}>Frecuencia</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                              {frecuenciaPago}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: 'var(--text-muted)' }}>Estado pago</span>
                        <span style={{ fontWeight: 700, color: tipoPago === 'contado' || tipoAbono === 'total' ? '#2d6a4f' : (tipoAbono === 'parcial' ? '#f4a261' : '#f4a261') }}>
                          {tipoPago === 'contado' || tipoAbono === 'total' ? '✅ Pagado' : (tipoAbono === 'parcial' ? '⏳ Abonado' : '⏳ Pendiente')}
                        </span>
                      </div>
                      {tipoPago === 'credito' && montoAbonoEfectivo > 0 && (
                        <div className="d-flex justify-content-between mt-1" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Saldo restante</span>
                          <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCOP(saldoPendiente)}</span>
                        </div>
                      )}
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
        {ventaCreada && (
           <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
             <div className="modal-dialog modal-dialog-centered">
               <div className="modal-content border-0 p-4 text-center" style={{ borderRadius: 20 }}>
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 style={{ fontWeight: 800 }}>¡Venta Exitosa!</h3>
                  <p className="text-muted">La venta se ha registrado correctamente en el sistema.</p>
                  <div className="d-grid gap-2 mt-4">
                     <button 
                       className="btn btn-primary rounded-pill p-3 border-0" 
                       style={{ background: 'var(--primary-color)', fontWeight: 700 }}
                       onClick={() => {
                          const itemsDetallados = items.filter(it => it.producto_id).map(it => {
                             const p = getProducto(it.producto_id);
                             return { ...it, nombre_producto: p.nombre, precio_unitario: p.precio }
                          });
                          setVentaCreada({ ...ventaCreada, items: itemsDetallados });
                          setVerTirillaFinal(true);
                       }}
                     >
                       <i className="bi bi-receipt me-2"></i> Ver Tirilla de Venta
                     </button>
                     <button className="btn btn-outline-secondary rounded-pill p-3" onClick={() => navigate('/admin/ventas')}>
                       Volver al Listado
                     </button>
                  </div>
               </div>
             </div>
           </div>
        )}

        {verTirillaFinal && (
          <ReceiptModal venta={ventaCreada} onClose={() => navigate('/admin/ventas')} />
        )}
      </main>
    </AdminLayout>
  )
}

export default NuevaVenta
