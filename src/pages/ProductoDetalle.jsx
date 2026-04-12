import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { getProducto } from '../services/api'
import { formatearPrecio, generarMensajeWhatsApp } from '../data/productos.js'

function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [imagenActiva, setImagenActiva] = useState(0)

  // Scroll al top y cargar producto
  useEffect(() => {
    window.scrollTo(0, 0)
    cargarProducto()
  }, [id])

  const cargarProducto = async () => {
    try {
      const p = await getProducto(id)
      setProducto(p)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return (
    <>
      <Navbar />
      <LoadingSpinner />
      <Footer />
    </>
  )

  if (!producto) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Producto no encontrado</h2>
        <Link to="/" style={{ color: '#c9a84c' }}>← Volver al inicio</Link>
      </div>
    )
  }

  // Mapear campos del backend a los esperados por el helper
  const productoParaWhatsApp = {
    ...producto,
    tipoSuela: producto.tipo_suela,
  }

  const precio = formatearPrecio(producto.precio)
  const mensaje = generarMensajeWhatsApp(productoParaWhatsApp)
  const whatsappUrl = `https://wa.me/+573157832101?text=${encodeURIComponent(mensaje)}`

  // Las imágenes del carrusel vienen como JSON string o array
  const carrusel = Array.isArray(producto.imagenes_carrusel) 
    ? producto.imagenes_carrusel 
    : JSON.parse(producto.imagenes_carrusel || '[]')

  return (
    <>
      <Navbar />
      <main className="main">
        <div className="premium-detail-container">
          {/* Lado Visual (Selector de Colores) */}
          <section className="premium-detail-visual fade-in-up">
            <div className="main-image-display">
               <img
                  key={imagenActiva}
                  src={carrusel[imagenActiva] || producto.imagen_principal}
                  alt={producto.nombre}
                  className="fade-in"
                />
            </div>
            
            {carrusel.length > 1 && (
              <div className="variant-selector">
                {carrusel.map((img, index) => (
                  <div 
                    key={index} 
                    className={`variant-dot ${imagenActiva === index ? 'active' : ''}`}
                    onClick={() => setImagenActiva(index)}
                  >
                    <img src={img} alt={`Color ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Lado de Contenido */}
          <section className="premium-detail-content fade-in-up" style={{ animationDelay: '0.2s' }}>
            <nav className="breadcrumbs mb-4" style={{ background: 'none', padding: 0 }}>
              <ol style={{ fontSize: '0.85rem' }}>
                <li><Link to="/">✨ Inicio</Link></li>
                <li className="current">Ver Sandalia</li>
              </ol>
            </nav>

            <span className="category-badge">👡 {producto.categoria}</span>
            <h2 style={{ fontFamily: '"Playfair Display", serif' }}>{producto.nombre}</h2>
            <div className="price-tag">{precio} <span style={{ fontSize: '0.9rem', color: '#999', fontWeight: '400' }}>COP</span></div>
            
            <p className="description-text">
              {producto.descripcion ? `${producto.descripcion} ✨` : 'Déjate cautivar por la elegancia de este diseño único, creado para resaltar tu belleza natural en cada paso. 💖'}
            </p>

            <div className="premium-detail-specs">
              <div className="spec-item">
                <span className="label">💎 Material</span>
                <span className="value">{producto.material}</span>
              </div>
              <div className="spec-item">
                <span className="label">☁️ Comodidad</span>
                <span className="value">{producto.tipo_suela === 'alta' ? 'Suela Alta' : 'Suela Baja'}</span>
              </div>
              <div className="spec-item">
                <span className="label">🔢 Referencia</span>
                <span className="value">#{producto.id.toString().slice(-4)}</span>
              </div>
              <div className="spec-item">
                <span className="label">📏 Tallas</span>
                <span className="value">{producto.tallas}</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
              style={{ padding: '1.2rem 2rem' }}
            >
              <i className="bi bi-whatsapp"></i>
              Realizar Pedido
            </a>

            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="bi bi-arrow-left"></i> Volver a la galería
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ProductoDetalle
