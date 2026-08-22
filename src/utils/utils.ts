import type { PathLike } from 'node:fs';
import { copyFile, mkdir, opendir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ValidTemplates } from '../@types/types.ts';

export function genGitIgnore(template: ValidTemplates)
{
	const lines = [
		'# node modules',
		'node_modules/',
		...(template === 'node' ? ['.pnpm-store/'] : []),
		'',

		'# temporal files',
		'dist/',
		'*.tsbuildinfo',

		'',
	];

	return {
		filename: '.gitignore',
		content: lines.join('\n'),
	};
}

export function genMITLicense(holder: string, year?: number)
{
	const content = `
			MIT License

			Copyright (c) ${year ?? new Date().getFullYear()} ${holder}

			Permission is hereby granted, free of charge, to any person obtaining a copy
			of this software and associated documentation files (the "Software"), to deal
			in the Software without restriction, including without limitation the rights
			to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
			copies of the Software, and to permit persons to whom the Software is
			furnished to do so, subject to the following conditions:

			The above copyright notice and this permission notice shall be included in all
			copies or substantial portions of the Software.

			THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
			AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
			SOFTWARE.
			`.replaceAll('\t', '').trimStart();

	return {
		filename: 'LICENSE',
		content,
		spdx: 'MIT', // https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license
	};
}

export async function copyFileRecursive(srcPath: string, destPath: string)
{
	await mkdir(dirname(destPath), { recursive: true });
	await copyFile(srcPath, destPath);
}

export async function isFolderEmpty(path: PathLike): Promise<
	| { readonly ok: true; readonly isEmpty: boolean; }
	| { readonly ok: false; readonly exists: boolean; readonly code: string; }
>
{
	try
	{
		const dir = await opendir(path);
		const firstItem = await dir.read();
		await dir.close();

		return {
			ok: true,
			isEmpty: firstItem === null,
		} as const;
	}
	catch (error: unknown)
	{
		if (typeof error === 'object' && error !== null && 'code' in error)
		{
			const err = error as { code: string; };

			// if it is not a folder (i.e. it's a file)
			if (err.code === 'ENOTDIR')
			{
				return {
					ok: false,
					exists: true,
					code: err.code,
				} as const;
			}

			// if it does not exist
			if (err.code === 'ENOENT')
			{
				return {
					ok: false,
					exists: false,
					code: err.code,
				} as const;
			}
		}

		throw error;
	}
}
