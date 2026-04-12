import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import AdminSidebar from './AdminSidebar'
import AdminBottomNav from './AdminBottomNav'
import LoadingSpinner from './LoadingSpinner'
import Footer from './Footer'

function AdminLayout({ children }) {
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cargando && !usuario) {
      navigate('/admin/login')
    }
    document.body.classList.add('admin-body')
    return () => document.body.classList.remove('admin-body')
  }, [usuario, cargando, navigate])

  if (cargando) return <LoadingSpinner />
  if (!usuario) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <Navbar />
        {children}
        <Footer />
      </div>
      <AdminBottomNav />
    </div>
  )
}

export default AdminLayout
