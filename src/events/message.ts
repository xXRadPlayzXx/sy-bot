import { Message } from 'discord.js';
import { capitalize } from '../utils/functions';
import { Event } from '../utils/types';

const messageEvent: Event = async (client, message: Message) => {
	const guildPrefix = process.env.BOT_PREFIX as string;
	const mentionRegex = RegExp(`^<@!?${client.user?.id}>$`);
	const mentionRegexPrefix = RegExp(`^<@!?${client.user?.id}>`);
	const prefix = message.content.toLowerCase().match(mentionRegexPrefix)
		? message.content.match(mentionRegexPrefix)![0]
		: guildPrefix;

	if (
		message.author.bot ||
		!message.content.toLowerCase().startsWith(prefix) ||
		!message.guild
	) {
		return;
	}
	const guildName = capitalize(message.guild.name);
	if (message.content.match(mentionRegex)) {
		message.reply('hi');
	}
	const args = message.content
		.toLowerCase()
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const commandName = args.shift()?.toLowerCase() as string;

	const command =
		client.commands.get(commandName) ||
		client.commands.find(
			(cmd) => cmd.aliases! && cmd.aliases.includes(commandName)
		)!;
	if (
		command.guildOwnerOnly &&
		message.member?.id !== message.guild.owner?.id
	) {
		return await client.sendEmbed(
			{
				title: `Access Denied`,
				description: `You must be **${guildName}**'s owner in order to use this command.`,
			},
			message,
			true
		);
	}
	if (command.devOnly && !client.developers.includes(message.author.id)) {
		return await client.sendEmbed(
			{
				title: `Access Denied`,
				description: `You must be one of the developers in order to use this command.`,
			},
			message,
			true
		);
	}
	if (command._reqPerms) {
		for (const perm of command._reqPerms) {
			if (
				!message.member?.hasPermission(perm) ||
				!message.member.permissions.has(perm)
			) {
				return await client.sendEmbed(
					{
						title: `Missing Permissions`,
						description: `In order to use this command you must have the following permission${
							command._reqPerms.length === 1 ? '' : 's'
						}: \`${command._reqPerms.join(', ')}\``,
					},
					message,
					true
				);
			}
		}
	}
	if (
		(command.minArgs && args.length < command.minArgs) ||
		(command.maxArgs !== undefined && args.length > command.maxArgs)
	) {
		await client.sendEmbed(
			{
				title: `Incorrect Syntax`,
				description: `Please consider using \`${prefix}${command.name}${
					command._syntax !== undefined ? ` ${command._syntax}` : ''
				}\``,
			},
			message,
			true
		);
		return;
	}
	try {
		await command._execute!(message, args, client);
	} catch (__) {
		const _err: Error = __ as Error;
		const err: string = `${_err.name} | ${_err.message}`;
		await client.sendEmbed(
			{
				title: `Unknown Error`,
				description: `An unknown error occured, please report this to the developers: ***${err}***`,
			},
			message,
			true
		);
		client.logger.error(err);
	} finally {
		client.logger.info(
			`Executed the command "${command.name}" by ${message.author.username} on ${guildName}`
		);
	}
};

export default messageEvent;
