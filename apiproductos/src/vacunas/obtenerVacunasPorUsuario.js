const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { verificarToken } = require('../utils/jwt');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*"
};

module.exports.obtenerVacunasPorUsuario = async (event) => {
  try {
    // Obtener token del header
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'No autorizado: token faltante' }) };
    }
    const token = authHeader.replace('Bearer ', '');
    let payload;
    try {
      payload = verificarToken(token);
    } catch (err) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token inválido', details: err.message }) };
    }

    // Buscar todas las vacunas de todas las mascotas del usuario
    // Primero, obtener todas las mascotas del usuario
    const mascotasResult = await ddbDocClient.send(new QueryCommand({
      TableName: 'MascotasTable',
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: { ':u': payload.id }
    }));
    const mascotas = mascotasResult.Items || [];
    if (mascotas.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify([]) };
    }
    // Para cada mascota, obtener sus vacunas
    let vacunas = [];
    for (const mascota of mascotas) {
      const vacunasResult = await ddbDocClient.send(new QueryCommand({
        TableName: 'VacunasTable',
        IndexName: 'mascotaId-index',
        KeyConditionExpression: 'mascotaId = :m',
        ExpressionAttributeValues: { ':m': mascota.id }
      }));
      vacunas = vacunas.concat(vacunasResult.Items || []);
    }
    return { statusCode: 200, headers, body: JSON.stringify(vacunas) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno al obtener vacunas', details: error.message }) };
  }
};
