import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs outside Vite, so it reads .env itself (Node 20.12+).
try {
	process.loadEnvFile();
} catch {
	// No .env file: DATABASE_URL must come from the environment.
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL ?? '' }
});
