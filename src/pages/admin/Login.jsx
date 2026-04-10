import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
        <div className="page-title">
          <div className="container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#f9f9f9', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
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
