const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

module.exports.agregarVacuna = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const id = uuidv4();

    const item = {
      id,
      mascotaId: body.mascotaId,
      nombre: body.nombre,
      fecha: body.fecha || '',
      observaciones: body.observaciones || ''
    };

    const params = {
      TableName: 'VacunasTable',
      Item: item
    };

    await ddbDocClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Vacuna agregada', id }),
    };

  } catch (error) {
    console.error('Error agregando vacuna:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: 'No se pudo agregar la vacuna', details: error.message }),
    };
  }
};
