import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$app/env/private';
import * as schema from './schema.ts';

// The Supabase transaction pooler does not support prepared statements.
export const db = drizzle(postgres(DATABASE_URL, { prepare: false }), { schema });
export * from './schema.ts';
