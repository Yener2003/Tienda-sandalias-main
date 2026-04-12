import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// GET /api/clientes — Listar todos
router.get('/', verificarToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM clientes ORDER BY created_at DESC`
    );
    res.json({ clientes: rows });
  } catch (err) {
    console.error('Error listando clientes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/clientes — Crear
router.post(
  '/',
  verificarToken,
  [body('nombre').trim().notEmpty().withMessage('El nombre es requerido')],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

    const { nombre, telefono = '', email = '', direccion = '' } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO clientes (nombre, telefono, email, direccion)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [nombre, telefono, email, direccion]
      );
      res.status(201).json({ mensaje: '✅ Cliente creado', cliente: rows[0] });
    } catch (err) {
      console.error('Error creando cliente:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// PUT /api/clientes/:id — Editar
router.put(
  '/:id',
  verificarToken,
  [body('nombre').trim().notEmpty().withMessage('El nombre es requerido')],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

    const { nombre, telefono = '', email = '', direccion = '' } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE clientes SET nombre=$1, telefono=$2, email=$3, direccion=$4
         WHERE id=$5 RETURNING *`,
        [nombre, telefono, email, direccion, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json({ mensaje: '✅ Cliente actualizado', cliente: rows[0] });
    } catch (err) {
      console.error('Error actualizando cliente:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// DELETE /api/clientes/:id — Borrar
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM clientes WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: '✅ Cliente eliminado' });
  } catch (err) {
    console.error('Error eliminando cliente:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
