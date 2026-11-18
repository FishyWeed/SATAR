import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '#lib/rules.ts';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			/**
			 * Signed-in, active user from USER_T, or null. orgId, depId and role are null for a person who has
			 * not created or joined an organization yet; the Owner has the role 'Owner' and no organization.
			 */
			user: {
				id: string; firstName: string; lastName: string; email: string;
				role: UserRole | null; depId: number | null; orgId: number | null; orgName: string | null;
			} | null;
		}
		interface PageData {
			user?: App.Locals['user'];
		}
	}
}

export {};
