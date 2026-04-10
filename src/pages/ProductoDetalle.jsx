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
        {/* Page Title */}
        <div className="page-title">
          <div className="heading">
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
              <div className="row d-flex justify-content-center text-center">
                <div className="col-lg-8">
                  <h1>Detalles del producto.</h1>
                  <p className="mb-0">{producto.descripcion}</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="breadcrumbs">
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
              <ol>
                <li><Link to="/">Inicio</Link></li>
                <li className="current">Detalles producto</li>
              </ol>
            </div>
          </nav>
        </div>

        {/* Detalle */}
        <section className="portfolio-details" style={{ padding: '4rem 0' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div className="row gy-4">
              {/* Carrusel */}
              <div className="col-lg-8">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000 }}
                  loop={true}
                  speed={600}
                  style={{ borderRadius: '16px', overflow: 'hidden' }}
                >
                  {carrusel.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        alt={`${producto.nombre} - imagen ${index + 1}`}
                        style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', backgroundColor: 'var(--bg-secondary)' }}
                        onError={(e) => {
                          e.target.src = producto.imagen_principal
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Info del producto */}
              <div className="col-lg-4">
                <div className="portfolio-info">
                  <h3>Detalles</h3>
                  <ul>
                    <li><strong>Nombre</strong>: {producto.nombre}</li>
                    <li><strong>Material</strong>: {producto.material}</li>
                    <li>
                      <strong>Precio</strong>:{' '}
                      <span style={{ color: '#c9a84c', fontWeight: '700', fontSize: '1.1rem' }}>
                        {precio}
                      </span>
                    </li>
                    <li><strong>Tallas</strong>: {producto.tallas}</li>
                    <li>
                      <strong>Tipo de suela</strong>:{' '}
                      {producto.tipo_suela === 'alta' ? 'Alta' : 'Baja'}
                    </li>
                  </ul>
                </div>

                {/* Botón WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <i className="bi bi-whatsapp"></i>
                  Contactar por WhatsApp
                </a>

                {/* Volver */}
                <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                  <button
                    onClick={() => navigate(-1)}
                    style={{
                      background: 'none',
                      border: '2px solid #c9a84c',
                      color: '#c9a84c',
                      borderRadius: '30px',
                      padding: '0.5rem 1.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      width: '100%',
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = '#c9a84c'
                      e.target.style.color = '#fff'
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'none'
                      e.target.style.color = '#c9a84c'
                    }}
                  >
                    ← Volver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ProductoDetalle
