module.exports.actualizarMascota = async (event) => {
  try {
    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);

    await ddbDocClient.send(new UpdateCommand({
      TableName: 'MascotasTable',
      Key: { id },
      UpdateExpression: 'set nombre = :n, tipo = :t, edad = :e, genero = :g',
      ExpressionAttributeValues: {
        ':n': body.nombre,
        ':t': body.tipo,
        ':e': body.edad,
        ':g': body.genero
      }
    }));

    return { statusCode: 200, body: JSON.stringify({ message: 'Mascota actualizada' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Error al actualizar la mascota' }) };
  }
};
