// Servicio para llamadas a la API del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  }
}

// ── Productos públicos ──
export async function getProductos() {
  const res = await fetch(`${API_URL}/api/productos`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error obteniendo productos')
  return data.productos
}

export async function getProducto(id) {
  const res = await fetch(`${API_URL}/api/productos/${id}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Producto no encontrado')
  return data.producto
}

// ── IA - Gemini ──
export async function describirImagenIA(formData) {
  const res = await fetch(`${API_URL}/api/ai/describe`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al describir la imagen')
  return data
}

// ── Admin: todos los productos ──
export async function getProductosAdmin() {
  const res = await fetch(`${API_URL}/api/productos/admin`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error obteniendo productos')
  return data.productos
}

// ── Crear producto (FormData para imágenes) ──
export async function crearProducto(formData) {
  const res = await fetch(`${API_URL}/api/productos`, {
    method: 'POST',
    headers: authHeaders(), // NO poner Content-Type, multer lo maneja
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error creando producto')
  return data.producto
}

// ── Editar producto ──
export async function editarProducto(id, formData) {
  const res = await fetch(`${API_URL}/api/productos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error editando producto')
  return data.producto
}

// ── Eliminar producto ──
export async function eliminarProducto(id) {
  const res = await fetch(`${API_URL}/api/productos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error eliminando producto')
  return data
}

// ── Registro inicial del admin ──
export async function registrarAdmin(nombre, email, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en registro')
  return data
}
