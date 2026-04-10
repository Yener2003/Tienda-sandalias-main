import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function Historia() {
  return (
    <>
      <Navbar />
      <main className="main">
        <div className="page-title">
          <div className="heading">
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
              <div className="row d-flex justify-content-center text-center">
                <div className="col-lg-8">
                  <h1>Nuestra historia</h1>
                  <br />
                  <h5 className="mb-0">
                    La idea de <strong>Lia boutique</strong> nació con un propósito claro: hacer que la moda sea
                    accesible y práctica para todas las mujeres. Nos inspiramos en la belleza, la comodidad y la
                    funcionalidad para crear una tienda donde encontrar sandalias y bolsos perfectos sea una
                    experiencia fácil y placentera.
                    <br /><br />
                    Desde nuestros inicios, hemos trabajado con proveedores cuidadosamente seleccionados,
                    asegurándonos de que cada producto cumpla con altos estándares de calidad. Nos encanta ver
                    cómo nuestros clientes disfrutan de nuestros productos y nos esforzamos por seguir
                    ofreciendo las mejores opciones del mercado.
                  </h5>
                </div>
              </div>
            </div>
          </div>
          <nav className="breadcrumbs">
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
              <ol>
                <li><Link to="/">Inicio</Link></li>
                <li className="current">Nuestra historia</li>
              </ol>
            </div>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Historia
