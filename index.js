require('dotenv').config();
const express = require('express');
const cors = require('cors'); //Api restringida
const helmet = require('helmet'); //Cabeceras seguras
const rateLimit = require('express-rate-limit'); //Bloquea spam y ataques
const { db } = require('./firebase/firebase');
const productosRoute = require('./routes/products');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const uploadsRoute = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad básica
app.use(helmet());

//CORS solo desde frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://127.0.0.1:5501', 'https://tusitio.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

//Rate limit: max 50 peticiones por IP por 10 minutos
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    message: 'Demasiadas peticiones desde esta IP, espera unos minutos.'
});
app.use(limiter);

// Asegúrate que sea JSON válido
app.use(express.json({
    limit: '10kb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            throw new Error('JSON inválido');
        }
    }
}));

app.use('/api/productos', productosRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/upload', uploadsRoute);




// 🚫 Solo permitir rutas explícitas
app.disable('x-powered-by');

app.get('/', async (req, res) => {
    try {
        // Prueba de conexión: obtener timestamp del servidor
        const serverTime = await db.collection('test').doc('test').get();
        res.status(200).json({
            success: true,
            message: 'Conexión a Firestore exitosa ✅',
            timestamp: serverTime.exists ? serverTime.updateTime.toDate() : null
        });
    } catch (error) {
        console.error('❌ Error de conexión a Firestore:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    const url = process.env.RAILWAY_STATIC_URL
        ? `https://${process.env.RAILWAY_STATIC_URL}`
        : `http://localhost:${PORT}`;

    console.log(`Servidor corriendo en ${url}`);
});