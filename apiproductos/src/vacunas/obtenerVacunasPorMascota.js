const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*"
};

module.exports.obtenerVacunasPorMascota = async (event) => {
  try {
    console.log("Evento recibido:", JSON.stringify(event));
    const mascotaId = event.pathParameters?.mascotaId;
    console.log("mascotaId extraído:", mascotaId);

    if (!mascotaId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "mascotaId es requerido" }),
      };
    }

    const params = {
      TableName: "VacunasTable",
      IndexName: "mascotaId-index",
      KeyConditionExpression: "mascotaId = :m",
      ExpressionAttributeValues: {
        ":m": mascotaId,
      },
    };
    console.log("Parámetros de consulta:", JSON.stringify(params));

    const data = await ddbDocClient.send(new QueryCommand(params));
    console.log("Respuesta de DynamoDB:", JSON.stringify(data));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error("Error al obtener vacunas:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error interno al obtener vacunas",
        details: error.message,
      }),
    };
  }
};
