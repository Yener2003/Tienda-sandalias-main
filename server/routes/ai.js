import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verificarToken } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/describe', verificarToken, upload.single('imagen'), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Configuración de IA faltante (GEMINI_API_KEY)' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Debes subir una imagen para analizar' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    // Preparar la imagen para Gemini
    const imageData = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    const prompt = `Analiza esta imagen de una sandalia y genera un nombre comercial elegante y una descripción creativa y vendedora en español. 
    Responde ÚNICAMENTE con un objeto JSON válido con este formato:
    {
      "nombre": "Nombre de la sandalia",
      "descripcion": "Descripción detallada y persuasiva"
    }`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    console.log('Respuesta de Gemini:', text);

    // Limpiar el texto si Gemini devuelve markdown o texto extra
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró un JSON válido en la respuesta de la IA');
    }
    const data = JSON.parse(jsonMatch[0]);

    res.json(data);
  } catch (error) {
    console.error('Error con Gemini AI:', error);
    res.status(500).json({ error: `Error de IA: ${error.message}` });
  }
});

export default router;
