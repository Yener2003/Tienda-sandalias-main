import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { actualizarPerfil, actualizarPassword } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

function Perfil() {
  const { usuario, setUsuario } = useAuth()
  const [cargandoPerfil, setCargandoPerfil] = useState(false)
  const [cargandoPass, setCargandoPass] = useState(false)

  const [perfilForm, setPerfilForm] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || ''
  })

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handlePerfilSubmit = async (e) => {
    e.preventDefault()
    setCargandoPerfil(true)
    try {
      const data = await actualizarPerfil(perfilForm)
      setUsuario(data.usuario) // Actualizar contexto global
      toast.success('Perfil actualizado correctamente')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCargandoPerfil(false)
    }
  }

  const handlePassSubmit = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('Las nuevas contraseñas no coinciden')
    }
    setCargandoPass(true)
    try {
      await actualizarPassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      toast.success('Contraseña actualizada correctamente')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCargandoPass(false)
    }
  }

  return (
    <AdminLayout>
      <main className="container py-4">
        <div className="mb-4">
          <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Mi Perfil</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona tu información personal y seguridad.</p>
        </div>

        <div className="row g-4">
          {/* Información Personal */}
          <div className="col-lg-6">
            <div className="admin-card p-4">
              <h5 className="mb-4" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                <i className="bi bi-person me-2" style={{ color: 'var(--primary-color)' }}></i>
                Información Personal
              </h5>
              <form onSubmit={handlePerfilSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={perfilForm.nombre}
                    onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={perfilForm.email}
                    onChange={e => setPerfilForm({...perfilForm, email: e.target.value})}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn w-100" 
                  style={{ background: 'var(--primary-color)', color: '#fff', fontWeight: 700 }}
                  disabled={cargandoPerfil}
                >
                  {cargandoPerfil ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </div>

          {/* Seguridad */}
          <div className="col-lg-6">
            <div className="admin-card p-4">
              <h5 className="mb-4" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                <i className="bi bi-shield-lock me-2" style={{ color: '#e63946' }}></i>
                Seguridad
              </h5>
              <form onSubmit={handlePassSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contraseña Actual</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passForm.currentPassword}
                    onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nueva Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passForm.newPassword}
                    onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passForm.confirmPassword}
                    onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn w-100 btn-outline-danger" 
                  style={{ fontWeight: 700 }}
                  disabled={cargandoPass}
                >
                  {cargandoPass ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}

export default Perfil
