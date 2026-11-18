/** True if a database error is a UNIQUE violation (PostgreSQL code 23505). Drizzle may wrap the driver error in `cause`. */
export function isUniqueViolation(e: unknown): boolean {
	const err = e as { code?: string; cause?: { code?: string } } | null;
	return err?.code === '23505' || err?.cause?.code === '23505';
}
