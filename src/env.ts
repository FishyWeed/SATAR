import { defineEnvVars } from '@sveltejs/kit/env';

// Values come from .env in development and from the Netlify site settings in production (see .env.example).
export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: { public: true, description: 'URL of the Supabase project' },
	PUBLIC_SUPABASE_ANON_KEY: { public: true, description: 'Anon (public) key of the Supabase project' },
	SUPABASE_SERVICE_ROLE_KEY: { description: 'Service role key: lets the Administrator invite users. Server only.' },
	DATABASE_URL: { description: 'Connection string of the Supabase database (transaction pooler)' }
});
