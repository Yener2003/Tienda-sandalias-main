import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import productosRoutes from './routes/productos.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsers ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ──
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ai', aiRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: '🚀 Servidor Lia Boutique funcionando', timestamp: new Date() });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Error global ──
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Inicializar DB y arrancar servidor ──
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 API disponible:`);
      console.log(`   POST  /api/auth/register`);
      console.log(`   POST  /api/auth/login`);
      console.log(`   GET   /api/auth/me`);
      console.log(`   GET   /api/productos`);
      console.log(`   POST  /api/productos   (admin)`);
      console.log(`   PUT   /api/productos/:id (admin)`);
      console.log(`   DELETE /api/productos/:id (admin)\n`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
