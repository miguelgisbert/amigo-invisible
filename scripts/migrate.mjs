import { readFile } from "node:fs/promises";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  console.error(
    "Falta DATABASE_URL (o POSTGRES_URL). Defineix-la a .env.local o a l'entorn.",
  );
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: process.env.DATABASE_SSL === "disable" ? false : "require",
  max: 1,
  connect_timeout: 15,
});

try {
  const schema = await readFile(
    new URL("../db/schema.sql", import.meta.url),
    "utf8",
  );
  await sql.unsafe(schema);
  console.log("Base de dades migrada correctament.");
} catch (error) {
  console.error("No s'ha pogut migrar la base de dades.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
