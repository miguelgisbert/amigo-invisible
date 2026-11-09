import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultLocale, hasLocale } from "./i18n/config";
import type { Database } from "./types";

const dataDirectory = process.env.AMIGO_DATA_DIR
  ? path.resolve(process.env.AMIGO_DATA_DIR)
  : path.join(process.cwd(), "data");

const dataFile = path.join(dataDirectory, "draws.json");

const globalForStore = globalThis as typeof globalThis & {
  __amigoInvisibleQueue?: Promise<unknown>;
};

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const previous = globalForStore.__amigoInvisibleQueue ?? Promise.resolve();
  const current = previous.then(operation, operation);
  globalForStore.__amigoInvisibleQueue = current.catch(() => undefined);
  return current;
}

function emptyDatabase(): Database {
  return { version: 1, draws: [] };
}

async function readFromDisk(): Promise<Database> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Database;

    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.draws)) {
      throw new Error("El fitxer de dades no té el format esperat.");
    }

    for (const draw of parsed.draws) {
      if (!hasLocale(draw.locale)) {
        draw.locale = defaultLocale;
      }
    }

    return parsed;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return emptyDatabase();
    }

    throw error;
  }
}

async function persist(database: Database): Promise<void> {
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });

  const temporaryFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(database, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryFile, dataFile);
}

export function readDatabase<T>(reader: (database: Database) => T): Promise<T> {
  return enqueue(async () => reader(await readFromDisk()));
}

export function writeDatabase<T>(
  writer: (database: Database) => T | Promise<T>,
): Promise<T> {
  return enqueue(async () => {
    const database = await readFromDisk();
    const result = await writer(database);
    await persist(database);
    return result;
  });
}
