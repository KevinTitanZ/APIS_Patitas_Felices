const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { verificarToken } = require('../utils/jwt');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = { "Access-Control-Allow-Origin": "*" };

module.exports.eliminarMascota = async (event) => {
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
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'No tienes permiso para eliminar esta mascota' }) };
    }

    await ddbDocClient.send(new DeleteCommand({
      TableName: 'MascotasTable',
      Key: { id }
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Mascota eliminada' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al eliminar la mascota', details: error.message }) };
  }
};
