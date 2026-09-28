export function addDays(isoDate: string, days: number): string {
	const date = new Date(`${isoDate}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

export function overdueDaysBetween(expectedISO: string, actualISO: string): number {
	const expected = new Date(`${expectedISO}T00:00:00Z`).getTime();
	const actual = new Date(`${actualISO}T00:00:00Z`).getTime();
	return Math.floor((actual - expected) / 86_400_000);
}