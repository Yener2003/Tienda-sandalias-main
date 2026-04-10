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
        <section className="portfolio-details">
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div className="row gy-5">
              {/* Carrusel */}
              <div className="col-lg-7 fade-in-up">
                <div className="swiper-container-wrapper">
                  <Swiper
                    modules={[Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    speed={800}
                  >
                    {carrusel.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={img}
                          alt={`${producto.nombre} - imagen ${index + 1}`}
                          style={{ width: '100%', minHeight: '400px', maxHeight: '600px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = producto.imagen_principal
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Info del producto */}
              <div className="col-lg-5 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="portfolio-info">
                  <h3><i className="bi bi-stars"></i> Detalles Premium</h3>
                  <ul>
                    <li>
                      <strong><i className="bi bi-tag"></i> Nombre</strong>
                      <span>{producto.nombre}</span>
                    </li>
                    <li>
                      <strong><i className="bi bi-gem"></i> Material</strong>
                      <span>{producto.material}</span>
                    </li>
                    <li>
                      <strong><i className="bi bi-cash-stack"></i> Precio</strong>
                      <span style={{ color: '#c9a84c', fontWeight: '800', fontSize: '1.4rem' }}>
                        {precio}
                      </span>
                    </li>
                    <li>
                      <strong><i className="bi bi-rulers"></i> Tallas</strong>
                      <span>{producto.tallas}</span>
                    </li>
                    <li>
                      <strong><i className="bi bi-info-circle"></i> Suela</strong>
                      <span>{producto.tipo_suela === 'alta' ? 'Suela Alta' : 'Suela Baja'}</span>
                    </li>
                  </ul>

                  {/* Botón WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                  >
                    <i className="bi bi-whatsapp"></i>
                    Pedir por WhatsApp
                  </a>

                  {/* Volver */}
                  <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => navigate(-1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      ← Volver a la galería
                    </button>
                  </div>
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
