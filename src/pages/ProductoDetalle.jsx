import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
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

  // Mapear campos del backend a los esperados por el helper (si es necesario)
  const productoParaWhatsApp = {
    ...producto,
    tipoSuela: producto.tipo_suela, // El helper usa camelCase en el código original de productos.js
  }

  const precio = formatearPrecio(producto.precio)
  const mensaje = generarMensajeWhatsApp(productoParaWhatsApp)
  const whatsappUrl = `https://wa.me/+573157832101?text=${encodeURIComponent(mensaje)}`

  // Las imágenes del carrusel vienen como JSON string o array dependiendo del driver de pg
  const carrusel = Array.isArray(producto.imagenes_carrusel) 
    ? producto.imagenes_carrusel 
    : JSON.parse(producto.imagenes_carrusel || '[]')

  return (
    <>
      <Navbar />
      <main className="main">
        <div className="premium-detail-container">
          {/* Lado Visual (Carrusel) */}
          <section className="premium-detail-visual fade-in-up">
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              loop={true}
              speed={1000}
              className="premium-swiper"
            >
              {carrusel.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt={`${producto.nombre} - imagen ${index + 1}`}
                    onLoad={() => console.log('Imagen cargada')}
                    onError={(e) => {
                      e.target.src = producto.imagen_principal
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* Lado de Contenido */}
          <section className="premium-detail-content fade-in-up" style={{ animationDelay: '0.2s' }}>
            <nav className="breadcrumbs mb-4" style={{ background: 'none', padding: 0 }}>
              <ol style={{ fontSize: '0.85rem' }}>
                <li><Link to="/">Inicio</Link></li>
                <li className="current">{producto.nombre}</li>
              </ol>
            </nav>

            <span className="category-badge">{producto.categoria}</span>
            <h2>{producto.nombre}</h2>
            <div className="price-tag">{precio}</div>
            
            <p className="description-text">
              {producto.descripcion || 'Sin descripción disponible para este modelo premium.'}
            </p>

            <div className="premium-detail-specs">
              <div className="spec-item">
                <span className="label">Material</span>
                <span className="value">{producto.material}</span>
              </div>
              <div className="spec-item">
                <span className="label">Suela</span>
                <span className="value">{producto.tipo_suela === 'alta' ? 'Alta' : 'Baja'}</span>
              </div>
              <div className="spec-item">
                <span className="label">Referencia</span>
                <span className="value">#{producto.id.toString().slice(-4)}</span>
              </div>
              <div className="spec-item">
                <span className="label">Disponibilidad</span>
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
