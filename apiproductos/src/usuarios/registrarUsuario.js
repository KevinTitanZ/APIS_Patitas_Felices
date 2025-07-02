const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);
// Inicio de la Api
module.exports.registrarUsuario = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const id = uuidv4();

    const item = {
      id,
      nombre: body.nombre,
      email: body.email,
      password: body.password
    };

    console.log('Intentando registrar usuario:', item);

    await ddbDocClient.send(new PutCommand({
      TableName: 'UsuariosTable',
      Item: item
    }));

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ message: 'Usuario registrado', id })
    };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: 'No se pudo registrar el usuario', details: error.message })
    };
  }
};
