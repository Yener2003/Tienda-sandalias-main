import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login, usuario, cargando: authCargando } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authCargando && usuario) {
      navigate('/admin/dashboard')
    }
  }, [usuario, authCargando, navigate])

  if (authCargando) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="main">
        <div className="page-title" style={{ background: 'var(--bg-color)' }}>
          <div className="container admin-card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <h2 className="text-center mb-4">Admin Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn w-100"
                style={{ background: '#c9a84c', color: '#fff', fontWeight: 'bold', borderRadius: '30px' }}
                disabled={cargando}
              >
                {cargando ? 'Iniciando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Login
