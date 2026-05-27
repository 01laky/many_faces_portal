import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('portal perf baseline artifact (PT-RP17)', () => {
	it('PT-RP17-U1: perf-baseline.json parseable when dist exists', () => {
		const baselinePath = path.join(process.cwd(), 'dist', 'perf-baseline.json');
		if (!fs.existsSync(baselinePath)) {
			expect(true).toBe(true);
			return;
		}
		const body = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as {
			totalGzipBytes: number;
			chunks: Array<{ file: string; gzipBytes: number }>;
		};
		expect(body.totalGzipBytes).toBeGreaterThan(0);
		expect(Array.isArray(body.chunks)).toBe(true);
		expect(body.chunks.every((c) => c.gzipBytes >= 0)).toBe(true);
	});
});
