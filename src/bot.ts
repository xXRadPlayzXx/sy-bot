import { Intents } from 'discord.js';
import { config as loadEnv } from 'dotenv';

loadEnv();

import Client from './client';

const client = new Client({ ws: { intents: Intents.ALL } });
const token: string = process.env.BOT_TOKEN as string;

(async () => {
	await client.login(token);
	await client.loadCommands();
	await client.loadEvents();
})();
