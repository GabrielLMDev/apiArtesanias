const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const { db } = require('../firebase/firebase');
const verifyToken = require('../middleware/verifyToken'); // o ajusta ruta


// 👉 Crear producto
router.post('/', verifyToken, async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.price || !data.price.retail) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    data.views = 1;
    const ref = await db.collection('products').add(data);
    res.status(201).json({ id: ref.id, message: 'Producto creado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// 👉 Leer todos los productos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const productos = [];
    snapshot.forEach(doc => {
      productos.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 👉 Leer producto por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// 👉 Incrementar vistas del producto
router.patch('/:id/view', async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);

    await productRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });

    res.status(200).json({ success: true, message: 'Vista registrada correctamente' });

  } catch (error) {
    console.error('❌ Error al registrar vista:', error);
    res.status(500).json({ error: 'Error al registrar vista' });
  }
});

// 👉 Actualizar producto
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = req.body;
    await db.collection('products').doc(req.params.id).update(data);
    res.status(200).json({ message: 'Producto actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// 👉 Eliminar producto
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
