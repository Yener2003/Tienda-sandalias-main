import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Historia from './pages/Historia.jsx'
import Mision from './pages/Mision.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import FormProducto from './pages/admin/FormProducto.jsx'
import Clientes from './pages/admin/Clientes.jsx'
import Ventas from './pages/admin/Ventas.jsx'
import NuevaVenta from './pages/admin/NuevaVenta.jsx'
import ProductosAdmin from './pages/admin/ProductosAdmin.jsx'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
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
          <Route path="/admin/clientes" element={<Clientes />} />
          <Route path="/admin/ventas" element={<Ventas />} />
          <Route path="/admin/ventas/nueva" element={<NuevaVenta />} />
          <Route path="/admin/productos" element={<ProductosAdmin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

