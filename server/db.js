import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Crear tablas si no existen
export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        precio INTEGER NOT NULL DEFAULT 40000,
        categoria VARCHAR(50) DEFAULT 'sandalias',
        tipo_suela VARCHAR(20) DEFAULT 'baja',
        material VARCHAR(100) DEFAULT 'Sintético',
        tallas VARCHAR(200) DEFAULT 'Disponibilidad de todas las tallas',
        imagen_principal VARCHAR(500),
        imagenes_carrusel JSONB DEFAULT '[]',
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        telefono VARCHAR(30),
        email VARCHAR(150),
        direccion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
        estado VARCHAR(30) DEFAULT 'pendiente',
        estado_pago VARCHAR(20) DEFAULT 'pendiente',
        tipo_pago VARCHAR(20) DEFAULT 'contado',
        num_cuotas INTEGER DEFAULT 1,
        fecha_vencimiento DATE,
        total INTEGER NOT NULL DEFAULT 0,
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS venta_items (
        id SERIAL PRIMARY KEY,
        venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
        nombre_producto VARCHAR(200),
        precio_unitario INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1
      );
    `);

    // Migraciones: agregar columnas nuevas si no existen (safe for existing DBs)
    await client.query(`
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) DEFAULT 'pendiente';
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(20) DEFAULT 'contado';
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS num_cuotas INTEGER DEFAULT 1;
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS abono_inicial INTEGER DEFAULT 0;
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS medio_pago VARCHAR(50);
      ALTER TABLE ventas ADD COLUMN IF NOT EXISTS frecuencia_pago VARCHAR(50) DEFAULT 'unico';
    `);


    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
