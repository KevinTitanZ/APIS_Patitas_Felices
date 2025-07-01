module.exports.eliminarMascota = async (event) => {
  try {
    const id = event.pathParameters.id;

    await ddbDocClient.send(new DeleteCommand({
      TableName: 'MascotasTable',
      Key: { id }
    }));

    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: 'Mascota eliminada' }) };
  } catch (error) {
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: 'Error al eliminar la mascota' }) };
  }
};
