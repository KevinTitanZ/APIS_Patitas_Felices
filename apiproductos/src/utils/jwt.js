const jwt = require('jsonwebtoken');

// 👇 Usa una clave segura en producción y guárdala como variable de entorno
const SECRET_KEY = 'patitasfelices-secret-key';

function generarToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // expira en 1 hora
}

function verificarToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = {
  generarToken,
  verificarToken
};
