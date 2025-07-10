const { db } = require('../firebase/firebase');

function verifyRole(requiredRole) {
  return async function (req, res, next) {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Token inválido o sin email' });

    try {
      const snapshot = await db.collection('admins')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) return res.status(403).json({ error: 'Usuario no encontrado' });

      const user = snapshot.docs[0].data();

      if (user.role !== requiredRole) {
        return res.status(403).json({ error: 'Permiso denegado. Rol insuficiente' });
      }

      next();

    } catch (err) {
      console.error('❌ Error en verifyRole:', err);
      res.status(500).json({ error: 'Error interno en validación de rol' });
    }
  }
}

module.exports = verifyRole;
