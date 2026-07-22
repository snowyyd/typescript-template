import { join, resolve } from 'node:path';
import type { ValidTemplates } from '../@types/types.ts';

const binDir = resolve(join(import.meta.dirname, '..')); // 'src/' on dev, 'bin/' on build;
const rootDir = resolve(join(binDir, '..'));

export const paths = {
	bin: binDir,
	root: rootDir,
	overrides: (template?: ValidTemplates, noRoot = false) => (template ? join(noRoot ? '' : rootDir, 'overrides', template) : join(noRoot ? '' : rootDir, 'overrides')),
} as const;
