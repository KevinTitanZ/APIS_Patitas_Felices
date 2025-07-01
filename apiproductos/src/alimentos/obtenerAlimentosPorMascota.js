module.exports.obtenerAlimentosPorMascota = async (event) => {
  try {
    const mascotaId = event.pathParameters.mascotaId;

    const result = await ddbDocClient.send(new QueryCommand({
      TableName: 'AlimentosTable',
      IndexName: 'mascotaId-index',
      KeyConditionExpression: 'mascotaId = :m',
      ExpressionAttributeValues: {
        ':m': mascotaId
      }
    }));

    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(result.Items) };
  } catch (error) {
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'Error obteniendo alimentos' }) };
  }
};
