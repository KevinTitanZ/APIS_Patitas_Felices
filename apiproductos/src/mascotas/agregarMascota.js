// === src/mascotas/agregarMascota.js ===
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { verificarToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const client = require('@aws-sdk/client-dynamodb');
const ddbDocClient = require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from(new client.DynamoDBClient({ region: 'us-east-1' }));

module.exports.agregarMascota = async (event) => {
  try {
    // Obtener token del header Authorization
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return { statusCode: 401, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'No autorizado: token faltante' }) };
    }
    const token = authHeader.replace('Bearer ', '');
    const payload = verificarToken(token);
    if (!payload) {
      return { statusCode: 401, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'Token inválido' }) };
    }

    
    const body = JSON.parse(event.body);
    const id = uuidv4();

    const item = {
      id,
      userId: payload.id,
      nombre: body.nombre,
      tipo: body.tipo,
      edad: body.edad,
      genero: body.genero
    };

    await ddbDocClient.send(new PutCommand({
      TableName: 'MascotasTable',
      Item: item
    }));

    return { statusCode: 201, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: 'Mascota agregada', id }) };
  } catch (error) {
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'No se pudo agregar la mascota', details: error.message }) };
  }
};
