// @ts-check

/* eslint-disable import-x/no-extraneous-dependencies */
import { configs } from '@snowyyd/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
	globalIgnores([
		'dist/*',
	]),
	configs.recommended,
	configs.esm,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
);
