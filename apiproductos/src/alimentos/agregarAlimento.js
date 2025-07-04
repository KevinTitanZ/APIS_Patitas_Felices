const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

module.exports.agregarAlimento = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const id = uuidv4();

    const item = {
      id,
      mascotaId: body.mascotaId,
      tipoAlimento: body.tipoAlimento,
      cantidad: body.cantidad,
      horario: body.horario
    };

    await ddbDocClient.send(new PutCommand({
      TableName: 'AlimentosTable',
      Item: item
    }));

    return { statusCode: 201, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: 'Alimento registrado', id }) };
  } catch (error) {
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'Error al registrar el alimento', details: error.message }) };
  }
};
