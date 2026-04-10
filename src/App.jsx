import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Historia from './pages/Historia.jsx'
import Mision from './pages/Mision.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/mision" element={<Mision />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
