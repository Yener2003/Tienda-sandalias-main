import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Historia from './pages/Historia.jsx'
import Mision from './pages/Mision.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import FormProducto from './pages/admin/FormProducto.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/mision" element={<Mision />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          
          {/* Rutas de Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/producto/nuevo" element={<FormProducto />} />
          <Route path="/admin/producto/:id/editar" element={<FormProducto />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
