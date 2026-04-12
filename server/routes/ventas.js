import { Router } from 'express';
import pool from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// GET /api/ventas — Listar todas (con cliente e items)
router.get('/', verificarToken, async (req, res) => {
  try {
    const { rows: ventas } = await pool.query(`
      SELECT v.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono
      FROM ventas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      ORDER BY v.created_at DESC
    `);

    // Para cada venta, obtener sus items
    const ventasConItems = await Promise.all(
      ventas.map(async (v) => {
        const { rows: items } = await pool.query(
          `SELECT vi.*, p.imagen_principal
           FROM venta_items vi
           LEFT JOIN productos p ON p.id = vi.producto_id
           WHERE vi.venta_id = $1`,
          [v.id]
        );
        return { ...v, items };
      })
    );

    res.json({ ventas: ventasConItems });
  } catch (err) {
    console.error('Error listando ventas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/ventas — Crear nueva venta
router.post('/', verificarToken, async (req, res) => {
  const { cliente_id, items, notas = '', tipo_pago = 'contado', num_cuotas = 1, fecha_vencimiento = null } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const total = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

    // estado_pago inicial: contado => 'pagado', credito => 'pendiente'
    const estado_pago = tipo_pago === 'contado' ? 'pagado' : 'pendiente';

    const { rows: ventaRows } = await client.query(
      `INSERT INTO ventas (cliente_id, total, notas, estado, estado_pago, tipo_pago, num_cuotas, fecha_vencimiento)
       VALUES ($1, $2, $3, 'pendiente', $4, $5, $6, $7) RETURNING *`,
      [cliente_id || null, total, notas, estado_pago, tipo_pago, parseInt(num_cuotas), fecha_vencimiento || null]
    );
    const venta = ventaRows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO venta_items (venta_id, producto_id, nombre_producto, precio_unitario, cantidad)
         VALUES ($1, $2, $3, $4, $5)`,
        [venta.id, item.producto_id, item.nombre_producto, item.precio_unitario, item.cantidad]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: '✅ Venta registrada', venta });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creando venta:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// PATCH /api/ventas/:id/estado — Cambiar estado de entrega
router.patch('/:id/estado', verificarToken, async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'enviado', 'entregado', 'cancelado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE ventas SET estado=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [estado, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ mensaje: '✅ Estado actualizado', venta: rows[0] });
  } catch (err) {
    console.error('Error actualizando estado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/ventas/:id/pago — Cambiar estado de pago
router.patch('/:id/pago', verificarToken, async (req, res) => {
  const { estado_pago } = req.body;
  if (!['pagado', 'pendiente'].includes(estado_pago)) {
    return res.status(400).json({ error: 'Estado de pago inválido' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE ventas SET estado_pago=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [estado_pago, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ mensaje: '✅ Estado de pago actualizado', venta: rows[0] });
  } catch (err) {
    console.error('Error actualizando estado de pago:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// DELETE /api/ventas/:id — Eliminar venta
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM ventas WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ mensaje: '✅ Venta eliminada' });
  } catch (err) {
    console.error('Error eliminando venta:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
