import { MongoClient } from "mongodb";
import fs from "fs";

const uri = ""; // Ang iyong MongoDB connection URI
const client = new MongoClient(uri);
exports.migrate = async () => {
  try {
    await client.connect();
    const database = client.db("Enrollment");
    const collections = await database.listCollections().toArray();

    // I-convert ang mga pangalan ng collections sa isang array ng strings
    const collectionNames = collections.map((collection) => collection.name);

    // I-save ang resulta sa isang file
    const fileName = "collections.txt";
    fs.writeFileSync(fileName, collectionNames.join("\n"));
    console.log(`Successfully saved collection names to ${fileName}`);
  } finally {
    await client.close();
  }
};
