import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "~/env";

async function runMigrations() {
	const connection = postgres(env.DB_URL, { max: 1 });
	const db = drizzle(connection);

	await migrate(db, { migrationsFolder: "drizzle" });

	console.log("📚 Migrations applied successfully!");

	await connection.end();

	process.exit();
}

runMigrations().catch((error) => {
	console.error("❌ Error applying migrations:", error);

	process.exit(1);
});
