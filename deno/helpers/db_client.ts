import { MongoClient, Database } from "https://deno.land/x/mongo@v0.13.0/mod.ts";

const DB_URL = 'mongodb+srv://node_toturial_1:WNct0GPpfk1rQfrv@cluster0.q4mpc.mongodb.net?retryWrites=true&w=majority'
let db: Database;

export function connect() {
  const client = new MongoClient();
  client.connectWithUri(DB_URL);
  
  db = client.database('deno_todos');
}

export function getDb() {
  return db;
}