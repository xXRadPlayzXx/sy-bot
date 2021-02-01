import chalk from 'chalk';

import { format } from 'date-fns';
import { Logger } from './interfaces';

const symbols = {
	info: '\u001b[34mi\u001b[39m',
	success: '\u001b[32m√\u001b[39m',
	warning: '\u001b[33mWARN\u001b[39m',
	error: '\u001b[31m×\u001b[39m',
};

class SyLogger implements Logger {
	async log(message: string) {
		const text = `[${chalk.white.bold('Logger')}]: ${chalk.gray.bold(
			format(Date.now(), 'hh:mm:ss aa')
		)} ${chalk.cyanBright.bold('|')} ${message}`;
		console.log(text);
		return text;
	}

	async error(message: string | Error) {
		let text = `[${symbols.error}]: ${chalk.gray.bold(
			format(Date.now(), 'hh:mm:ss aa')
		)} ${chalk.cyanBright.bold('|')} ${message}`;
		if ((message as Error).message) {
			const err = message as Error;
			text = `[${symbols.error}]: ${chalk.gray.bold(
				format(Date.now(), 'hh:mm:ss aa')
			)} ${chalk.cyanBright.bold('|')} ${err.name}${chalk.cyanBright.bold(
				':'
			)} ${err.message}`;
		}
		console.log(text);
		return text;
	}

	async success(message: string) {
		const text = `[${symbols.success}]: ${chalk.gray.bold(
			format(Date.now(), 'hh:mm:ss aa')
		)} ${chalk.cyanBright.bold('|')} ${message}`;
		console.log(text);
		return text;
	}

	async info(message: string) {
		const text = `[${symbols.info}]: ${chalk.gray.bold(
			format(Date.now(), 'hh:mm:ss aa')
		)} ${chalk.cyanBright.bold('|')} ${message}`;
		console.log(text);
		return text;
	}

	async warn(message: string) {
		const text = `[${symbols.warning}]: ${chalk.gray.bold(
			format(Date.now(), 'hh:mm:ss aa')
		)} ${chalk.cyanBright.bold('|')} ${message}`;
		console.log(text);
		return text;
	}
}

export default SyLogger;
