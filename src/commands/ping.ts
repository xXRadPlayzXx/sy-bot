import { Command } from '../utils/interfaces';

const pingCommand: Command = {
	callback: async (message, args, bot) => {
		message.reply('Pong');
	},
};

export default pingCommand;
