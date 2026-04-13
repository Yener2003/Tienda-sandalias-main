import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';

const router = Router();

// ──────────────────────────────────────────
// POST /api/auth/register — Crear administrador
// Solo funciona si NO existe ningún usuario todavía (primera vez)
// ──────────────────────────────────────────
router.post(
  '/register',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    try {
      // Verificar que no exista ningún usuario (solo se puede crear 1 admin)
      const { rows: existentes } = await pool.query('SELECT id FROM usuarios LIMIT 1');
      if (existentes.length > 0) {
        return res.status(403).json({ error: 'Ya existe un administrador registrado.' });
      }

      const { nombre, email, password } = req.body;

      // Verificar email duplicado
      const { rows: emailExiste } = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );
      if (emailExiste.length > 0) {
        return res.status(400).json({ error: 'El correo ya está registrado.' });
      }

      // Encriptar contraseña
      const password_hash = await bcrypt.hash(password, 12);

      // Insertar usuario
      const { rows } = await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES ($1, $2, $3, 'admin')
         RETURNING id, nombre, email, rol, created_at`,
        [nombre, email, password_hash]
      );

      res.status(201).json({
        mensaje: '✅ Administrador creado correctamente',
        usuario: rows[0],
      });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ──────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    try {
      const { email, password } = req.body;

      // Buscar usuario
      const { rows } = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales incorrectas.' });
      }

      const usuario = rows[0];

      // Verificar contraseña
      const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordCorrecta) {
        return res.status(401).json({ error: 'Credenciales incorrectas.' });
      }

      // Generar JWT (expira en 24 horas)
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ──────────────────────────────────────────
// GET /api/auth/me — Verificar sesión activa
// ──────────────────────────────────────────
import { verificarToken } from '../middleware/auth.js';

router.get('/me', verificarToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ usuario: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────
// PUT /api/auth/profile — Actualizar datos del perfil
// ──────────────────────────────────────────
router.put(
  '/profile',
  verificarToken,
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

    try {
      const { nombre, email } = req.body;
      
      // Verificar si el email ya lo tiene otro usuario
      const { rows: duplicate } = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [email, req.usuario.id]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso por otro administrador.' });
      }

      const { rows } = await pool.query(
        'UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, nombre, email, rol',
        [nombre, email, req.usuario.id]
      );

      res.json({ mensaje: 'Perfil actualizado', usuario: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ──────────────────────────────────────────
// PUT /api/auth/password — Cambiar contraseña
// ──────────────────────────────────────────
router.put(
  '/password',
  verificarToken,
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

    try {
      const { currentPassword, newPassword } = req.body;

      // Obtener hash actual
      const { rows } = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [req.usuario.id]);
      const user = rows[0];

      // Verificar contraseña actual
      const matched = await bcrypt.compare(currentPassword, user.password_hash);
      if (!matched) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
      }

      // Encriptar nueva
      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [newHash, req.usuario.id]);

      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
