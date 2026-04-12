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

// ── Clientes ──
export async function getClientes() {
  const res = await fetch(`${API_URL}/api/clientes`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error obteniendo clientes')
  return data.clientes
}

export async function crearCliente(cliente) {
  const res = await fetch(`${API_URL}/api/clientes`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error creando cliente')
  return data.cliente
}

export async function editarCliente(id, cliente) {
  const res = await fetch(`${API_URL}/api/clientes/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error editando cliente')
  return data.cliente
}

export async function eliminarCliente(id) {
  const res = await fetch(`${API_URL}/api/clientes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error eliminando cliente')
  return data
}

// ── Ventas ──
export async function getVentas() {
  const res = await fetch(`${API_URL}/api/ventas`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error obteniendo ventas')
  return data.ventas
}

export async function crearVenta(venta) {
  const res = await fetch(`${API_URL}/api/ventas`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(venta),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error creando venta')
  return data.venta
}

export async function cambiarEstadoVenta(id, estado) {
  const res = await fetch(`${API_URL}/api/ventas/${id}/estado`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error actualizando estado')
  return data.venta
}

export async function cambiarEstadoPagoVenta(id, estado_pago) {
  const res = await fetch(`${API_URL}/api/ventas/${id}/pago`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado_pago }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error actualizando estado de pago')
  return data.venta
}
export async function registrarPagoVenta(id, paymentData) {
  const res = await fetch(`${API_URL}/api/ventas/${id}/registrar-pago`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error registrando pago')
  return data.venta
}

export async function eliminarVenta(id) {

  const res = await fetch(`${API_URL}/api/ventas/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error eliminando venta')
  return data
}
