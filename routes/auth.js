const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase/firebase');

// 🔐 POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const snapshot = await db.collection('admins').where('email', '==', email).limit(1).get();

        if (snapshot.empty) return res.status(401).json({ error: 'Credenciales inválidas' });

        const admin = snapshot.docs[0].data();
        console.log("ADMIN:", admin); // <-- Aquí deberías ver el objeto completo

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign(
            { email: admin.email, name: admin.name, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES_IN }
        );

        res.json({ token });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ✅ GET /api/auth/verify
router.get('/verify', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ email: decoded.email, name: decoded.name });
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
});

module.exports = router;
