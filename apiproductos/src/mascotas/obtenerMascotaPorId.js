module.exports.obtenerMascotaPorId = async (event) => {
  try {
    const id = event.pathParameters.id;

    const result = await ddbDocClient.send(new GetCommand({
      TableName: 'MascotasTable',
      Key: { id }
    }));

    if (!result.Item) {
      return { statusCode: 404, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'Mascota no encontrada' }) };
    }

    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(result.Item) };
  } catch (error) {
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'Error al obtener la mascota' }) };
  }
};