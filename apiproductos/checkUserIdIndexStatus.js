// Script para revisar el estado del índice userId-index en la tabla MascotasTable
// Requiere: npm install @aws-sdk/client-dynamodb

const { DynamoDBClient, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

async function checkIndexStatus() {
  try {
    const data = await client.send(
      new DescribeTableCommand({ TableName: "MascotasTable" })
    );
    const indexes = data.Table.GlobalSecondaryIndexes || [];
    const userIdIndex = indexes.find(idx => idx.IndexName === "userId-index");
    if (userIdIndex) {
      console.log(`Estado de userId-index: ${userIdIndex.IndexStatus}`);
    } else {
      console.log("El índice userId-index no existe en la tabla.");
    }
  } catch (err) {
    console.error("Error al consultar el estado del índice:", err);
  }
}

checkIndexStatus();
