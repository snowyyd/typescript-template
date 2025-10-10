// @ts-check

/* eslint-disable import-x/no-extraneous-dependencies */
import { configs } from '@snowyyd/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(
	configs.recommended,
	configs.esm,
	{
		ignores: ['dist/**'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
);
