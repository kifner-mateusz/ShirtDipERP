import "dotenv/config";
import * as schema from "@/server/db/schemas";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  console.log("⏳ Running migrations...");
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const migrationDb = drizzle(migrationClient, { schema, logger: true });

  // This will run migrations on the database, skipping the ones already applied
  await migrate(migrationDb, { migrationsFolder: "./src/db/migration" });

  // Don't forget to close the connection, otherwise the script will hang
  await migrationClient.end();

  console.log("✅ Migration completed");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Migration failed");
  console.log(error);
  process.exit(1);
});
