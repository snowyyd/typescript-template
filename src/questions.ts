import { confirm, question, type QuestionOptions, select, validators } from '@topcli/prompts';
import type { ValidTemplates } from './@types/types.ts';
import { consts } from './utils/constants.ts';

async function questionWrapper<T = string>(field: string, options?: { isField?: boolean; required?: boolean; } & Omit<QuestionOptions<T>, 'message'>)
{
	const activeValidators = [
		...(options?.validators ?? []),
		...(options?.required ? [validators.required()] : []),
	];

	const isMessage = options?.isField === false;

	return question(isMessage ? field : `Project ${field}`, {
		...(isMessage ? undefined : { hint: `(package.json's ${field} field)` }),
		...options,
		validators: activeValidators,
	});
}

export async function askQuestions(abortController: AbortController)
{
	const name = await questionWrapper('name', { required: true, signal: abortController.signal });
	const description = await questionWrapper('description', { required: true, signal: abortController.signal });
	const version = await questionWrapper('version', { defaultValue: '1.0.0', signal: abortController.signal });

	const template = await select<ValidTemplates>('Choose a template', {
		choices: [...consts.validTemplates],
		signal: abortController.signal,
	});

	const ts6compat = await confirm('Enable TypeScript 6 Compat ?', {
		initial: true,
		signal: abortController.signal,
	});

	const homepage = await questionWrapper('homepage', { signal: abortController.signal });
	const repository = await questionWrapper('repository', { signal: abortController.signal });
	const bugs = await questionWrapper('bugs', { signal: abortController.signal });

	const holder = await questionWrapper('Copyright holder', {
		isField: false,
		hint: '(for LICENSE file)',
		required: true,
		signal: abortController.signal,
	});

	return {
		name,
		description,
		version,
		template,
		ts6compat,
		homepage,
		repository,
		bugs,
		holder,
	};
}
