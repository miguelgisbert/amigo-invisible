import { readFile } from "node:fs/promises";
import postgres from "postgres";

const connectionString =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5433/amigo_test";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connect() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const sql = postgres(connectionString, {
      ssl: process.env.TEST_DATABASE_SSL === "require" ? "require" : false,
      max: 1,
      connect_timeout: 5,
      onnotice: () => undefined,
    });

    try {
      await sql`select 1`;
      return sql;
    } catch {
      await sql.end().catch(() => undefined);
      if (attempt === 30) {
        throw new Error(
          `No s'ha pogut connectar a la base de dades de test: ${connectionString}`,
        );
      }
      await sleep(1000);
    }
  }

  throw new Error("No s'ha pogut connectar a la base de dades de test.");
}

const sql = await connect();

try {
  const schema = await readFile(
    new URL("../db/schema.sql", import.meta.url),
    "utf8",
  );
  await sql.unsafe(schema);
  await sql`
    truncate table feedback, exclusions, participants, draws, sessions, users
    restart identity cascade
  `;
  console.log("Base de dades de test preparada.");
} finally {
  await sql.end();
}
