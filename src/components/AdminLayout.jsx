import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import AdminSidebar from './AdminSidebar'
import AdminBottomNav from './AdminBottomNav'
import Footer from './Footer'

function AdminLayout({ children }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/admin/login')
      return
    }
    document.body.classList.add('admin-body')
    return () => document.body.classList.remove('admin-body')
  }, [usuario, navigate])

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
