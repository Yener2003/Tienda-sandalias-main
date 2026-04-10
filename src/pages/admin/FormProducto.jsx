import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { crearProducto, editarProducto, getProducto } from '../../services/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

function FormProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const esEdicion = !!id

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 40000,
    categoria: 'sandalias',
    tipo_suela: 'baja',
    material: 'Sintético',
    tallas: 'Disponibilidad de todas las tallas',
    activo: true
  })

  const [imagenPrincipal, setImagenPrincipal] = useState(null)
  const [imagenesCarrusel, setImagenesCarrusel] = useState([])
  const [previewPrincipal, setPreviewPrincipal] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) {
      navigate('/admin/login')
      return
    }
    if (esEdicion) {
      cargarProducto()
    }
  }, [id, usuario, navigate])

  const cargarProducto = async () => {
    try {
      const p = await getProducto(id)
      setFormData({
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        categoria: p.categoria,
        tipo_suela: p.tipo_suela,
        material: p.material,
        tallas: p.tallas,
        activo: p.activo
      })
      setPreviewPrincipal(p.imagen_principal)
    } catch (err) {
      setError('Error al cargar producto')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    if (e.target.name === 'imagen_principal') {
      const file = e.target.files[0]
      setImagenPrincipal(file)
      setPreviewPrincipal(URL.createObjectURL(file))
    } else {
      setImagenesCarrusel(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    
    if (imagenPrincipal) {
      data.append('imagen_principal', imagenPrincipal)
    }
    
    imagenesCarrusel.forEach(file => {
      data.append('imagenes_carrusel', file)
    })

    try {
      if (esEdicion) {
        await editarProducto(id, data)
      } else {
        await crearProducto(data)
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Error al guardar producto')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="main container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 bg-white p-4 rounded shadow-sm">
            <h2 className="mb-4">{esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row gy-3">
                <div className="col-md-8">
                  <label className="form-label">Nombre del Producto</label>
                  <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Precio</label>
                  <input type="number" className="form-control" name="precio" value={formData.precio} onChange={handleChange} required />
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Tipo de Suela</label>
                  <select className="form-select" name="tipo_suela" value={formData.tipo_suela} onChange={handleChange}>
                    <option value="baja">Baja</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Categoría</label>
                  <select className="form-select" name="categoria" value={formData.categoria} onChange={handleChange}>
                    <option value="sandalias">Sandalias</option>
                    <option value="bolsos">Bolsos</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Material</label>
                  <input type="text" className="form-control" name="material" value={formData.material} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <label className="form-label">Tallas</label>
                  <input type="text" className="form-control" name="tallas" value={formData.tallas} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Imagen Principal</label>
                  <input type="file" className="form-control" name="imagen_principal" onChange={handleFileChange} />
                  {previewPrincipal && <img src={previewPrincipal} alt="Preview" className="mt-2" style={{ width: '100px', borderRadius: '8px' }} />}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Imágenes Carrusel (Máx 5)</label>
                  <input type="file" className="form-control" name="imagenes_carrusel" multiple onChange={handleFileChange} />
                </div>

                <div className="col-12 mt-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="activo" id="activo" checked={formData.activo} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="activo">Producto Activo (Visible en tienda)</label>
                  </div>
                </div>

                <div className="col-12 mt-4 d-flex gap-2">
                  <button type="submit" className="btn px-4" style={{ background: '#c9a84c', color: '#fff', fontWeight: 'bold' }} disabled={cargando}>
                    {cargando ? 'Guardando...' : 'Guardar Producto'}
                  </button>
                  <Link to="/admin/dashboard" className="btn btn-outline-secondary px-4">Cancelar</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default FormProducto
