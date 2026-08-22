import { join, relative } from 'node:path';
import { glob } from 'tinyglobby';
import type { ValidTemplates } from '../@types/types.ts';
import { paths } from './paths.ts';
import { copyFileRecursive } from './utils.ts';

export class TemplateManager
{
	static async getMergedFiles(template: ValidTemplates)
	{
		const { base, overrides, overridesCwd } = await this.getFiles(template);

		// map to keep track of files by their relative path from paths.root
		// key: relative path (e.g., '.vscode/settings.json')
		// value: actual resolved file path
		const mergedFilesMap = new Map<string, string>();

		// add base template files
		for (const file of base)
		{
			// file is already relative to paths.root
			mergedFilesMap.set(file, file);
		}

		// process overrides (if any)
		for (const overrideFile of overrides)
		{
			// construct the full absolute path using overridesCwd
			const fullOverridePath = join(overridesCwd, overrideFile);

			// get the path relative to paths.root so it matches the keys from 'base'
			// e.g., 'overrides/bun/.vscode/settings.json' -> '.vscode/settings.json'
			const relativeToRoot = relative(paths.root, fullOverridePath);

			// calculate relative path inside the template directory
			// e.g., '/app/overrides/bun/.vscode/settings.json' inside '/app/overrides/bun' -> '.vscode/settings.json'
			const normalizedKey = relative(overridesCwd, fullOverridePath);

			// overwrite base file entry if key matches, or add new file from overrides
			mergedFilesMap.set(normalizedKey, relativeToRoot);
		}

		// return merged array of paths relative to paths.root
		return Array.from(mergedFilesMap.values());
	}

	static async getFiles(template: ValidTemplates)
	{
		const overridesCwd = paths.overrides(template);

		const [base, overrides] = await Promise.all([
			glob(
				[
					'.devcontainer/**/*',
					'.vscode/settings.json',
					'eslint.config.mjs',
					'tsconfig*.json',
				],
				{
					cwd: paths.root,
					dot: true,
				}
			),

			glob('**/*', { cwd: overridesCwd, dot: true }),
		]);

		return {
			base,
			overrides,
			overridesCwd,
		};
	}

	static async copyRecursive(fileRelPath: string, template: ValidTemplates, outPath: string)
	{
		const srcPath = join(paths.root, fileRelPath);

		// calculate the base directory where this file originates
		const overridesPrefix = paths.overrides(template, true);
		const baseDir = fileRelPath.startsWith(overridesPrefix)
			? overridesPrefix
			: ''; // Empty string means root

		// extract the clean relative path by stripping the base path
		// example A: relative('', 'eslint.config.mjs') -> 'eslint.config.mjs'
		// example B: relative('overrides/bun', 'overrides/bun/.vscode/settings.json') -> '.vscode/settings.json'
		const cleanRelPath = relative(baseDir, fileRelPath);

		// resolve the final destination path
		const destPath = join(outPath, cleanRelPath);

		// ensure destination parent folder exists, then copy
		await copyFileRecursive(srcPath, destPath);
	}
}
