import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProductosAdmin, getVentas, getClientes } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import AdminLayout from '../../components/AdminLayout'

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, sales: 0, clients: 0, revenue: 0 })
  const [cargando, setCargando] = useState(true)
  const { usuario, logout } = useAuth()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [prods, ventas, clientes] = await Promise.all([
        getProductosAdmin(),
        getVentas(),
        getClientes()
      ])
      const totalRevenue = ventas.reduce((acc, v) => acc + (v.abono_inicial || 0), 0)
      const totalPending = ventas.reduce((acc, v) => acc + v.total, 0) - totalRevenue
      setStats({
        products: prods.length,
        sales: ventas.length,
        clients: clientes.length,
        revenue: totalRevenue,
        pending: totalPending
      })
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const formatCOP = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  if (cargando) return (
    <AdminLayout>
      <LoadingSpinner />
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <main className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-2">
          <div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Panel Administrativo</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Bienvenido, <strong>{usuario?.nombre}</strong>. Aquí tienes el resumen de hoy.</p>
          </div>
          <div className="d-flex gap-2">
             <Link to="/" className="btn btn-outline-secondary btn-sm d-none d-md-block">Ir a la Web</Link>
             <button onClick={logout} className="btn btn-outline-danger btn-sm d-md-none">Cerrar Sesión</button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="row g-4 mb-5">
            {[
              { label: 'Recaudado Real', value: formatCOP(stats.revenue), icon: 'bi-cash-coin', color: '#2d6a4f', big: true },
              { label: 'Por Cobrar', value: formatCOP(stats.pending), icon: 'bi-clock-history', color: '#f4a261', big: true },
              { label: 'Ventas Realizadas', value: stats.sales, icon: 'bi-bag-check', color: 'var(--primary-color)' },
              { label: 'Clientes', value: stats.clients, icon: 'bi-people', color: '#4895ef' },
            ].map((s, i) => (
             <div key={i} className="col-12 col-md-6 col-lg-3">
               <div className="admin-card stats-card">
                 <div style={{ width: 50, height: 50, borderRadius: '50%', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <i className={`bi ${s.icon}`} style={{ fontSize: '1.5rem', color: s.color }}></i>
                 </div>
                 <div className="stats-value" style={{ fontSize: s.big ? '1.5rem' : '1.8rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>{s.value}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>{s.label}</div>
               </div>
             </div>
           ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="admin-card p-4 h-100">
               <h5 style={{ fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Próximos Pasos Recomendados</h5>
               <div className="d-flex flex-column gap-3">
                  {[
                    { title: 'Revisar ventas pendientes', desc: 'Hay órdenes esperando confirmación de entrega.', path: '/admin/ventas', icon: 'bi-truck' },
                    { title: 'Gestionar nuevos clientes', desc: 'Actualiza la información de tus compradores frecuentes.', path: '/admin/clientes', icon: 'bi-person-plus' },
                    { title: 'Actualizar inventario', desc: 'Revisa si hay productos sin stock o nuevos precios.', path: '/admin/productos', icon: 'bi-pencil-square' },
                  ].map((x, i) => (
                    <Link key={i} to={x.path} style={{ textDecoration: 'none' }}>
                      <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                         <i className={`bi ${x.icon}`} style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                         <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{x.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{x.desc}</div>
                         </div>
                         <i className="bi bi-chevron-right ms-auto" style={{ color: 'var(--text-muted)' }}></i>
                      </div>
                    </Link>
                  ))}
               </div>
            </div>
          </div>
          <div className="col-lg-5">
             <div className="admin-card p-4 h-100 dark-gradient" style={{ background: 'linear-gradient(145deg, var(--bg-secondary) 0%, #000 100%)' }}>
                <h5 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>Estado del Negocio</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lia Boutique sigue creciendo. Aquí tienes algunos consejos para hoy:</p>
                <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingLeft: '1.2rem' }}>
                  <li className="mb-2">Asegúrate de marcar las ventas como "Entregado" para mantener el historial limpio.</li>
                  <li className="mb-2">Utiliza la gestión de créditos para fidelizar clientes recurrentes.</li>
                  <li className="mb-2">Revisa el panel desde tu móvil; la nueva navegación inferior es ideal para uso rápido.</li>
                </ul>
                <div className="mt-auto pt-4">
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: '75%', height: '100%', background: 'var(--primary-color)', borderRadius: 2 }}></div>
                  </div>
                  <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    <span>Meta Mensual</span>
                    <span>75% Completado</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}

export default Dashboard


