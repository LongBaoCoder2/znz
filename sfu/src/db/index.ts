import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas"


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type DB_TYPE = NodePgDatabase<typeof schema> & {
    $client: Pool;
}

export const db: DB_TYPE = drizzle(pool, { schema });
export const schemas = schema;
