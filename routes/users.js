const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase/firebase');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

// 👉 Crear nuevo usuario (solo para admin)
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const snapshot = await db.collection('admins').where('email', '==', email).get();
        if (!snapshot.empty) return res.status(400).json({ error: 'El usuario ya existe' });

        const passwordHash = await bcrypt.hash(password, 10);

        await db.collection('admins').add({
            email: email,
            password: passwordHash,
            name: name,
            role: role,
        });

        res.status(201).json({ message: 'Usuario creado correctamente' });

    } catch (err) {
        console.error('❌ Error al crear usuario:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// GET /api/users
router.get('/', verifyToken, verifyRole('admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('admins').get();
        const users = snapshot.docs.map(doc => doc.data());
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// 👉 Actualizar Usuario
router.put('/:email', verifyToken, verifyRole('admin'), async (req, res) => {
    try {
        const { email } = req.params;

        const snapshot = await db.collection('admins').where('email', '==', email).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ error: 'Usuario no encontrado' });
        const docId = snapshot.docs[0].id;

        await db.collection('users').doc(docId).update(req.body);
        res.status(200).json({ message: 'Usuario actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// 👉 Eliminar Usuario
router.delete('/:email', verifyToken, verifyRole('admin'), async (req, res) => {
    try {
        const { email } = req.params;
        const snapshot = await db.collection('admins').where('email', '==', email).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ error: 'Usuario no encontrado' });

        const docId = snapshot.docs[0].id;
        await db.collection('admins').doc(docId).delete();
        res.status(200).json({ message: 'Usuario eliminado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;