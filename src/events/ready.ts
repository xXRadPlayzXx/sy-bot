import chalk from 'chalk';
import { Event } from '../utils/types';

const readyEvent: Event = async (client) => {
	await client.logger.success(
		`Successfully logged in as ${chalk.red.bold(client.user?.tag)}`
	);
	await client.logger.info(
		`Loaded ${client.commands.size} command${
			client.commands.size === 1 ? '' : 's'
		}`
	);
	await client.logger.info(
		`Loaded ${client.events.size} event${client.events.size === 1 ? '' : 's'}`
	);
};

export default readyEvent;
