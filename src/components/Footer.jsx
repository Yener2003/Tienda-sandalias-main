function Footer() {
  return (
    <footer id="footer" className="footer dark-background">
      <div className="footer-top">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="row gy-4">
            <div className="col-lg-4 col-md-6 footer-about">
              <a href="/" className="logo d-flex align-items-center" style={{ textDecoration: 'none' }}>
                <span className="sitename">Lia</span>
              </a>
              <div className="footer-contact pt-3">
                <p className="mt-3">
                  <strong>Teléfono:</strong> <span>+57 3157832101</span>
                </p>
              </div>
              <div className="social-links">
                <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              </div>
            </div>

            <div className="col-lg-4 col-md-12 footer-newsletter">
              <h4>Lia boutique</h4>
              <p>Comodidad y estilo garantizados.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright">
        <div className="container text-center">
          <p>
            <span>Yener Arismendi</span>{' '}
            <span>Todos los derechos reservados</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
