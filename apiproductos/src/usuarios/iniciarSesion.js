const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { generarToken } = require('../utils/jwt');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

// ✅ Headers CORS globales para toda la función
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*"
};

module.exports.iniciarSesion = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Validación básica
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email y password son requeridos' }),
      };
    }

    // Buscar usuario por email usando el índice secundario
    const params = {
      TableName: 'UsuariosTable',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :e',
      ExpressionAttributeValues: {
        ':e': email
      }
    };

    let result;
    try {
      result = await ddbDocClient.send(new QueryCommand(params));
    } catch (dbError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Error consultando la base de datos',
          details: dbError.message
        }),
      };
    }

    if (!result || !result.Items || result.Items.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Usuario no encontrado' }),
      };
    }

    const usuario = result.Items[0];

    // Validación de contraseña (sin hash)
    if (usuario.password !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Contraseña incorrecta' }),
      };
    }

    // Generar token
    let token;
    try {
      token = generarToken({ id: usuario.id, email: usuario.email });
    } catch (jwtError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Error generando token',
          details: jwtError.message
        }),
      };
    }

    // Éxito
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Login exitoso', token }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno en login',
        details: error.message
      }),
    };
  }
};
