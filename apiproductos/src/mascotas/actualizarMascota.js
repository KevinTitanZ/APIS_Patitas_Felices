const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { verificarToken } = require('../utils/jwt');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = { "Access-Control-Allow-Origin": "*" };

module.exports.actualizarMascota = async (event) => {
  try {
    // Autenticación JWT
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

    const id = event.pathParameters.id;
    // Verificar que la mascota pertenezca al usuario autenticado
    const result = await ddbDocClient.send(new GetCommand({
      TableName: 'MascotasTable',
      Key: { id }
    }));
    if (!result.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mascota no encontrada' }) };
    }
    if (result.Item.userId !== payload.id) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'No tienes permiso para actualizar esta mascota' }) };
    }

    const body = JSON.parse(event.body);
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'MascotasTable',
      Key: { id },
      UpdateExpression: 'set nombre = :n, tipo = :t, edad = :e, genero = :g',
      ExpressionAttributeValues: {
        ':n': body.nombre,
        ':t': body.tipo,
        ':e': body.edad,
        ':g': body.genero
      }
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Mascota actualizada' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al actualizar la mascota', details: error.message }) };
  }
};
