const express = require('express');
const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Guardar archivos temporalmente
const upload = multer({ dest: 'temp/' });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const bucket = getStorage().bucket();

    const destination = `products/${Date.now()}-${file.originalname}`;
    await bucket.upload(file.path, {
      destination,
      metadata: {
        contentType: file.mimetype,
        cacheControl: 'public,max-age=31536000'
      }
    });

    // Borrar archivo temporal
    fs.unlinkSync(file.path);

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`;

    res.status(200).json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({ success: false, error: 'Error al subir imagen' });
  }
});

module.exports = router;
