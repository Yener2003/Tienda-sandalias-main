import { Router } from 'express';
import pool from '../db.js';
import { verificarToken } from '../middleware/auth.js';
import { upload } from '../cloudinary.js';
import cloudinary from '../cloudinary.js';

const router = Router();

// ──────────────────────────────────────────
// GET /api/productos — Listar todos (público)
// ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, descripcion, precio, categoria, tipo_suela,
              material, tallas, imagen_principal, imagenes_carrusel, activo, created_at
       FROM productos
       WHERE activo = true
       ORDER BY created_at DESC`
    );
    res.json({ productos: rows });
  } catch (error) {
    console.error('Error listando productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────
// GET /api/productos/admin — Listar TODOS incluyendo inactivos (privado)
// ──────────────────────────────────────────
router.get('/admin', verificarToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM productos ORDER BY created_at DESC`
    );
    res.json({ productos: rows });
  } catch (error) {
    console.error('Error listando productos admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────
// GET /api/productos/:id — Detalle (público)
// ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM productos WHERE id = $1 AND activo = true',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ producto: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────
// POST /api/productos — Crear producto (privado)
// Acepta: imagen_principal (file) + imagenesCarrusel (files) + campos de texto
// ──────────────────────────────────────────
router.post(
  '/',
  verificarToken,
  upload.fields([
    { name: 'imagen_principal', maxCount: 1 },
    { name: 'imagenes_carrusel', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        nombre,
        descripcion = '',
        precio = 40000,
        categoria = 'sandalias',
        tipo_suela = 'baja',
        material = 'Sintético',
        tallas = 'Disponibilidad de todas las tallas',
      } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre del producto es requerido' });
      }

      // URLs de imágenes subidas a Cloudinary
      const imagen_principal = req.files?.imagen_principal?.[0]?.path || null;
      const imagenesCarruselFiles = req.files?.imagenes_carrusel || [];
      const imagenes_carrusel = imagenesCarruselFiles.map(f => f.path);

      // Si hay imagen principal, agregarla al inicio del carrusel también
      if (imagen_principal && !imagenes_carrusel.includes(imagen_principal)) {
        imagenes_carrusel.unshift(imagen_principal);
      }

      const { rows } = await pool.query(
        `INSERT INTO productos
           (nombre, descripcion, precio, categoria, tipo_suela, material, tallas,
            imagen_principal, imagenes_carrusel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          nombre,
          descripcion,
          parseInt(precio),
          categoria,
          tipo_suela,
          material,
          tallas,
          imagen_principal,
          JSON.stringify(imagenes_carrusel),
        ]
      );

      res.status(201).json({ mensaje: '✅ Producto creado', producto: rows[0] });
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ──────────────────────────────────────────
// PUT /api/productos/:id — Editar producto (privado)
// ──────────────────────────────────────────
router.put(
  '/:id',
  verificarToken,
  upload.fields([
    { name: 'imagen_principal', maxCount: 1 },
    { name: 'imagenes_carrusel', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el producto existe
      const { rows: existing } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const actual = existing[0];

      const {
        nombre = actual.nombre,
        descripcion = actual.descripcion,
        precio = actual.precio,
        categoria = actual.categoria,
        tipo_suela = actual.tipo_suela,
        material = actual.material,
        tallas = actual.tallas,
        activo = actual.activo,
      } = req.body;

      // Imagen principal: usar la nueva si se subió, sino conservar la actual
      let imagen_principal = actual.imagen_principal;
      if (req.files?.imagen_principal?.[0]) {
        // Eliminar imagen anterior de Cloudinary si existe
        if (actual.imagen_principal) {
          const publicId = actual.imagen_principal.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`lia-boutique/${publicId}`).catch(() => {});
        }
        imagen_principal = req.files.imagen_principal[0].path;
      }

      // Imágenes carrusel: nuevas o conservar las actuales
      let imagenes_carrusel = actual.imagenes_carrusel || [];
      if (req.files?.imagenes_carrusel?.length > 0) {
        imagenes_carrusel = req.files.imagenes_carrusel.map(f => f.path);
        if (imagen_principal && !imagenes_carrusel.includes(imagen_principal)) {
          imagenes_carrusel.unshift(imagen_principal);
        }
      }

      const { rows } = await pool.query(
        `UPDATE productos
         SET nombre = $1, descripcion = $2, precio = $3, categoria = $4,
             tipo_suela = $5, material = $6, tallas = $7, imagen_principal = $8,
             imagenes_carrusel = $9, activo = $10, updated_at = NOW()
         WHERE id = $11
         RETURNING *`,
        [
          nombre,
          descripcion,
          parseInt(precio),
          categoria,
          tipo_suela,
          material,
          tallas,
          imagen_principal,
          JSON.stringify(imagenes_carrusel),
          activo === 'true' || activo === true,
          id,
        ]
      );

      res.json({ mensaje: '✅ Producto actualizado', producto: rows[0] });
    } catch (error) {
      console.error('Error actualizando producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ──────────────────────────────────────────
// DELETE /api/productos/:id — Eliminar producto (privado)
// ──────────────────────────────────────────
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      'DELETE FROM productos WHERE id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: '✅ Producto eliminado' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
