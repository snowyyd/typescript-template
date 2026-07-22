import type { ValidTemplates } from '../@types/types.ts';
import { ObjectBuilder } from './object-builder.ts';

interface GeneratorOptions
{
	name: string;
	description: string;
	version?: string;

	license: string;

	homepage?: string;
	repository?: string;
	bugs?: string;

	template?: ValidTemplates;
	ts6compat?: boolean;
}

type ResolvedOptions = GeneratorOptions & Required<Pick<GeneratorOptions, 'version' | 'template' | 'ts6compat'>>;

export class PackageJsonGen
{
	readonly filename = 'package.json';

	private options: ResolvedOptions;

	private defaultOptions = {
		version: '1.0.0',
		template: 'node',
		ts6compat: true,
	} satisfies Partial<GeneratorOptions>;

	constructor(options: GeneratorOptions)
	{
		this.options = {
			...this.defaultOptions,
			...options,
		} satisfies ResolvedOptions;
	}

	generate()
	{
		const pkgJson = {
			name: this.options.name,
			description: this.options.description,
			version: this.options.version,
			private: true,
			type: 'module',
			...(this.options.homepage && this.options.homepage.length > 0 ? { homepage: this.options.homepage } : undefined),
			...(this.options.repository && this.options.repository.length > 0 ? { repository: this.options.repository } : undefined),
			...(this.options.bugs && this.options.bugs.length > 0 ? { bugs: this.options.bugs } : undefined),
			license: this.options.license,
			scripts: this.getScripts(),
			devDependencies: this.getDevDependencies(),
			dependencies: {},
		};

		return JSON.stringify(pkgJson, null, 2) + '\n';
	}

	private getDevDependencies()
	{
		const isBun = this.options.template === 'bun';
		const isNode = this.options.template === 'node';

		return new ObjectBuilder()
			.add('@snowyyd/eslint-config', '^2.2.7')
			.add('eslint', '^10.7.0')
			.add('typescript-eslint', '^8.65.0')
			.add('typescript', '^7.0.2')

			// node specific
			.add('@types/node', '^26.1.1', isNode)
			.add('tsx', '^4.23.1', isNode)

			// bun specific
			.add('@types/bun', '^1.3.14', isBun)

			// ts6 compat
			// https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0
			.add('typescript', 'npm:@typescript/typescript6@^6.0.2', this.options.ts6compat)
			.add('@typescript/native', 'npm:typescript@^7.0.2', this.options.ts6compat)

			.buildSorted();
	}

	private getScripts()
	{
		const isBun = this.options.template === 'bun';
		const isNode = this.options.template === 'node';

		return new ObjectBuilder()
			.add('lint', 'eslint src/ eslint.config.mjs')
			.add('check', 'tsc')
			.add('build', 'tsc -p tsconfig.build.json')
			.add('dev', `${isBun ? 'bun' : 'node'} src/main.ts`)

			// node specific
			.add('dev:tsx', 'tsx src/main.ts', isNode)

			// bun specific
			.add('dev:node', 'node src/main.ts', isBun)

			.build();
	}
}
