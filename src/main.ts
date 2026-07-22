import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PackageJsonGen } from './classes/packagejson-gen.ts';
import { askQuestions } from './questions.ts';
import { TemplateManager } from './utils/template-manager.ts';
import { genGitIgnore, genMITLicense, isFolderEmpty } from './utils/utils.ts';

async function main()
{
	const controller = new AbortController();
	process.on('SIGINT', () =>
	{
		controller.abort();
	});

	const [outFolder = '.'] = process.argv.slice(2);
	const outDir = resolve(outFolder);

	console.log('Output directory:', outDir);

	const res = await isFolderEmpty(outDir);
	let shouldMkdir = false;

	if (res.ok && res.isEmpty === false) console.warn(`Output directory "${outDir}" is not empty, be careful!`);
	else if (!res.ok)
	{
		if (res.exists)
		{
			console.error(`"${outDir}" exists and is not a directory. Code: ${res.code}`);

			process.exitCode = 1;
			return;
		}

		shouldMkdir = true;
	}

	const answers = await askQuestions(controller);

	const gitIgnore = genGitIgnore(answers.template);
	const license = genMITLicense(answers.holder);
	const templateFiles = await TemplateManager.getMergedFiles(answers.template);

	const pkgJson = new PackageJsonGen({
		name: answers.name,
		description: answers.description,
		version: answers.version,
		template: answers.template,
		ts6compat: answers.ts6compat,
		homepage: answers.homepage,
		repository: answers.repository,
		bugs: answers.bugs,
		license: license.spdx,
	});

	if (shouldMkdir) await mkdir(outDir, { recursive: true });

	console.log('Copying files...');

	await Promise.all([
		writeFile(join(outDir, license.filename), license.content, 'utf8'),
		writeFile(join(outDir, gitIgnore.filename), gitIgnore.content, 'utf8'),
		writeFile(join(outDir, pkgJson.filename), pkgJson.generate(), 'utf8'),

		...templateFiles.map((file) => TemplateManager.copyRecursive(file, answers.template, outDir)),
	]);

	console.log('All done!');
}

void main();
