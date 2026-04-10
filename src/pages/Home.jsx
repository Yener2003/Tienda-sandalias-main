import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getProductos } from '../services/api'

const ITEMS_PER_PAGE = 10

function Home() {
  const [productos, setProductos] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [scrollTop, setScrollTop] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      const data = await getProductos()
      setProductos(data)
    } catch (err) {
      console.error('Error cargando productos:', err)
    } finally {
      setCargando(false)
    }
  }

  // Filtrar productos
  const productosFiltrados = filtro === 'todos'
    ? productos
    : productos.filter(p => p.categoria === filtro)

  const productosVisibles = productosFiltrados.slice(0, visibleCount)
  const hayMas = visibleCount < productosFiltrados.length

  const handleFiltro = (nuevoFiltro) => {
    setFiltro(nuevoFiltro)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  // Scroll top button
  useEffect(() => {
    const handleScroll = () => setScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const goToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />

      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section dark-background">
          <picture>
            <source media="(max-width: 767px)" srcSet="/assets/img/fondo-telefono.png" />
            <source media="(min-width: 768px)" srcSet="/assets/img/fondo.png" />
            <img className="hero-bg" src="/assets/img/fondo.png" alt="Imagen principal" />
          </picture>

          <div className="container">
            <div style={{ textAlign: 'center', margin: '0 auto', maxWidth: '700px' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Lia boutique<span>.</span></h2>
              <p>Comodidad y estilo garantizados.</p>
            </div>

            <div className="row gy-4 mt-5 justify-content-center">
              <div className="col-xl-2 col-md-4">
                <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                  <div className="icon-box">
                    <i className="bi bi-people"></i>
                    <h3>Nosotros</h3>
                  </div>
                </Link>
              </div>
              <div className="col-xl-2 col-md-4">
                <Link to="/historia" style={{ textDecoration: 'none' }}>
                  <div className="icon-box">
                    <i className="bi bi-book"></i>
                    <h3>Nuestra historia</h3>
                  </div>
                </Link>
              </div>
              <div className="col-xl-2 col-md-4">
                <Link to="/mision" style={{ textDecoration: 'none' }}>
                  <div className="icon-box">
                    <i className="bi bi-trophy"></i>
                    <h3>Misión</h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Galería de Productos */}
        <div id="productos" className="container py-5">
          <div className="section-title">
            <h2>Portafolio</h2>
            <p>Productos</p>
          </div>

          {/* Filtros */}
          <div className="text-center mb-4">
            <button
              className={`filter-btn btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => handleFiltro('todos')}
            >
              Todos
            </button>
            <button
              className={`filter-btn btn ${filtro === 'sandalias' ? 'active' : ''}`}
              onClick={() => handleFiltro('sandalias')}
            >
              Sandalias
            </button>
          </div>

          {/* Grid de productos */}
          <div className="row" id="productGallery">
            {productosVisibles.map((producto) => (
              <div key={producto.id} className="col-md-4 mb-4 producto-item">
                <Link to={`/producto/${producto.id}`} className="producto-card">
                  <div className="card h-100">
                    <img
                      src={producto.imagen_principal}
                      className="card-img-top"
                      alt={producto.nombre}
                      onError={(e) => { e.target.style.background = '#f0f0f0'; e.target.style.minHeight = '200px' }}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title">{producto.nombre}</h5>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Ver más */}
          {hayMas && (
            <div className="text-center mt-4">
              <button id="loadMore" onClick={handleLoadMore}>
                Ver más productos
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Scroll Top */}
      <a
        href="#"
        id="scroll-top"
        className={`scroll-top ${scrollTop ? 'show' : ''}`}
        onClick={goToTop}
      >
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </>
  )
}

export default Home
