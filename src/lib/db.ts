import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as typeof globalThis & {
  __amigoInvisibleSql?: Sql;
};

export function getSql(): Sql {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (o POSTGRES_URL) no està configurada. Afegeix-la a .env.local i executa npm run db:migrate.",
    );
  }

  if (!globalForDb.__amigoInvisibleSql) {
    globalForDb.__amigoInvisibleSql = postgres(connectionString, {
      ssl: process.env.DATABASE_SSL === "disable" ? false : "require",
      max: process.env.NODE_ENV === "production" ? 3 : 1,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }

  return globalForDb.__amigoInvisibleSql;
}
