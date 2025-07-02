const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = { "Access-Control-Allow-Origin": "*" };

module.exports.actualizarVacuna = async (event) => {
  try {
    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);

    // Verifica que la vacuna exista
    const result = await ddbDocClient.send(new GetCommand({
      TableName: 'VacunasTable',
      Key: { id }
    }));
    if (!result.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Vacuna no encontrada' }) };
    }

    await ddbDocClient.send(new UpdateCommand({
      TableName: 'VacunasTable',
      Key: { id },
      UpdateExpression: 'set nombre = :n, fecha = :f, observaciones = :o',
      ExpressionAttributeValues: {
        ':n': body.nombre,
        ':f': body.fecha,
        ':o': body.observaciones
      }
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Vacuna actualizada' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al actualizar la vacuna', details: error.message }) };
  }
};
