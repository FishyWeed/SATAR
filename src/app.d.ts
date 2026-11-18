import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from '#lib/rules.ts';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			/** Signed-in, active user from USER_T, or null. */
			user: { id: string; firstName: string; lastName: string; email: string; role: Role; depId: number } | null;
		}
		interface PageData {
			user?: App.Locals['user'];
		}
	}
}

export {};
