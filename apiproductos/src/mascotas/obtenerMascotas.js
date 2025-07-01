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

module.exports.obtenerMascotas = async (event) => {
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

    // Query por userId
    const params = {
      TableName: 'MascotasTable',
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: {
        ':u': payload.id
      }
    };

    const result = await ddbDocClient.send(new QueryCommand(params));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items)
    };

  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno al obtener mascotas', details: error.message })
    };
  }
};
