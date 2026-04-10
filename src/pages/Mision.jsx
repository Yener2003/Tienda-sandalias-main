import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function Mision() {
  return (
    <>
      <Navbar />
      <main className="main">
        <div className="page-title">
          <div className="heading">
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
              <h1>Misión</h1>
              <br />
              <h5 className="mb-0">
                En <strong>Lia boutique</strong>, nuestra misión es brindarte una experiencia de compra única y
                satisfactoria, donde puedas encontrar sandalias y bolsos que no solo complementen tu estilo,
                sino que también te brinden comodidad y confianza en cada uso.
              </h5>
              <h5 style={{ marginTop: '1.5rem' }}>Nos enfocamos en:</h5>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                <li style={{ padding: '0.4rem 0', color: '#ccc' }}>
                  <i className="bi bi-check-circle" style={{ color: '#c9a84c', marginRight: '0.5rem' }}></i>
                  <span>Ofrecer productos de alta calidad y diseño exclusivo.</span>
                </li>
                <li style={{ padding: '0.4rem 0', color: '#ccc' }}>
                  <i className="bi bi-check-circle" style={{ color: '#c9a84c', marginRight: '0.5rem' }}></i>
                  <span>Garantizar precios accesibles sin comprometer la calidad.</span>
                </li>
                <li style={{ padding: '0.4rem 0', color: '#ccc' }}>
                  <i className="bi bi-check-circle" style={{ color: '#c9a84c', marginRight: '0.5rem' }}></i>
                  <span>Proporcionar un servicio de atención al cliente cercano y eficiente.</span>
                </li>
                <li style={{ padding: '0.4rem 0', color: '#ccc' }}>
                  <i className="bi bi-check-circle" style={{ color: '#c9a84c', marginRight: '0.5rem' }}></i>
                  <span>Facilitar un proceso de compra seguro, rápido y confiable.</span>
                </li>
              </ul>
            </div>
          </div>
          <nav className="breadcrumbs">
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
              <ol>
                <li><Link to="/">Inicio</Link></li>
                <li className="current">Misión</li>
              </ol>
            </div>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Mision
