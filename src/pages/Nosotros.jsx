import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function Nosotros() {
  return (
    <>
      <Navbar />
      <main className="main">
        <div className="page-title">
          <div className="heading">
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
              <div className="row d-flex justify-content-center text-center">
                <div className="col-lg-8">
                  <h1>Sobre nosotros</h1>
                  <strong><h2>Bienvenidos a Lia boutique</h2></strong>
                  <br />
                  <h5 className="mb-0">
                    En <strong>Lia boutique</strong>, nos apasiona la moda y creemos que cada accesorio tiene el
                    poder de transformar un look y reflejar la personalidad de quien lo usa. Por eso, nos
                    especializamos en la venta de sandalias y bolsos exclusivos, diseñados para mujeres que buscan
                    estilo, comodidad y calidad en cada paso que dan.
                    <br /><br />
                    Sabemos que elegir los accesorios adecuados puede marcar la diferencia en cualquier outfit,
                    por eso trabajamos para ofrecerte productos modernos, versátiles y de excelente calidad,
                    ideales para cualquier ocasión, ya sea un día casual, una salida especial o unas vacaciones
                    soñadas.
                  </h5>
                </div>
              </div>
            </div>
          </div>
          <nav className="breadcrumbs">
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
              <ol>
                <li><Link to="/">Inicio</Link></li>
                <li className="current">Nosotros</li>
              </ol>
            </div>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Nosotros
