const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = { "Access-Control-Allow-Origin": "*" };

module.exports.eliminarVacuna = async (event) => {
  try {
    const id = event.pathParameters.id;

    // Verifica que la vacuna exista
    const result = await ddbDocClient.send(new GetCommand({
      TableName: 'VacunasTable',
      Key: { id }
    }));
    if (!result.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Vacuna no encontrada' }) };
    }

    await ddbDocClient.send(new DeleteCommand({
      TableName: 'VacunasTable',
      Key: { id }
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Vacuna eliminada' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al eliminar la vacuna', details: error.message }) };
  }
};
