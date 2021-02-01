import {
	Client,
	ClientOptions,
	Collection,
	MessageEmbedOptions,
	Message,
	MessageEmbed,
	MessageReaction,
	User,
	ColorResolvable,
} from 'discord.js';
import { loadDir } from '../utils/functions';
import { Command, Logger } from '../utils/interfaces';
import { Event } from '../utils/types';
import { sep } from 'path';
import SyLogger from '../utils/logger';

class SyClient extends Client {
	protected _commands: Collection<string, Command> = new Collection();
	protected _events: Collection<string, Event> = new Collection();
	protected _aliases: Collection<string, string> = new Collection();

	public logger: Logger = new SyLogger();
	public defaultEmbedColor: ColorResolvable = 'AQUA';
  public developers: string[] = ['804406341271289907'];
  
	public get commands(): Collection<string, Command> {
		return this._commands;
	}

	public get events(): Collection<string, Event> {
		return this._events;
	}
	public get aliases(): Collection<string, string> {
		return this._aliases;
	}
	constructor(options?: ClientOptions) {
		super(options);
	}
	public async getEmbedColor(
		message: Message,
		isError: boolean = false
	): Promise<ColorResolvable> {
		let color: ColorResolvable =
			message.guild?.me?.displayHexColor !== '#000000'
				? (message.guild?.me?.displayHexColor as string)
				: this.defaultEmbedColor;
		if (isError) color = '#FF0000';
		return color;
	}
	public async createEmbed(
		data: MessageEmbedOptions,
		message: Message,
		isError: boolean = false
	): Promise<MessageEmbed> {
		if (!data.author) {
			data.author = {
				name: message.guild?.name || this.user?.username,
				iconURL: message.guild?.iconURL({ dynamic: true, format: 'png' }) as
					| string
					| undefined,
			};
		}
		if (!data.color) {
			data.color = await this.getEmbedColor(message, isError);
		}

		if (!data.footer) {
			data.footer = {
				text: message.member?.displayName,
				iconURL: message.author.displayAvatarURL({
					dynamic: true,
					format: 'png',
				}),
			};
		}
		if (!data.timestamp) {
			data.timestamp = new Date();
		}
		const embed = new MessageEmbed(data);

		return embed;
	}
	public async sendEmbed(
		data: MessageEmbedOptions,
		message: Message,
		isError: boolean = false
	): Promise<Message> {
		const embed = await this.createEmbed(data, message, isError);
		const msg = await message.channel.send(embed);
		return msg;
	}
	/**
	 * Produces a simple pagination feature.
	 * @param message The message object.
	 * @param pages Pages for the pagination
	 * @param options Optional options.
	 *
	 */

	public async paginate(
		message: Message,
		pages: MessageEmbed[],
		options?: {
			startingPage?: number;
			time?: number;
			fastForwardAndRewind?: {
				time?: number;
				rewindPrompt?: string;
				fastForwardPrompt?: string;
			};
			goTo?: {
				time?: number;
				prompt?: string;
			};
		}
	) {
		if (options) {
			if (options.startingPage) {
				if (
					typeof options.startingPage !== 'number' ||
					!Number.isInteger(options.startingPage)
				)
					throw new TypeError('Starting page index must be an integer.');
				if (options.startingPage < 0)
					throw new TypeError(
						'Starting page index must be non-negative or zero.'
					);
				if (options.startingPage > pages.length - 1)
					throw new TypeError(
						'Starting page index is greater than the length of the pages.'
					);
			}

			if (options.time) {
				if (typeof options.startingPage !== 'number')
					throw new Error('Starting page index must be a non-negative number.');
				if (options.time < 0) throw new Error('Time must be non-negative.');
			}

			if (options.fastForwardAndRewind) {
				if (typeof options.fastForwardAndRewind !== 'object')
					throw new Error(
						"The 'fastForwardAndRewind' option should be an object."
					);

				if (options.fastForwardAndRewind.time) {
					if (typeof options.startingPage !== 'number')
						throw new Error(
							'Fast forward and rewind time must be a non-negative number.'
						);
					if (options.fastForwardAndRewind.time < 0)
						throw new Error(
							'Fast forward and rewind time must be non-negative.'
						);
				}

				if (options.fastForwardAndRewind.fastForwardPrompt) {
					if (
						typeof options.fastForwardAndRewind.fastForwardPrompt !==
							'string' ||
						!options.fastForwardAndRewind.fastForwardPrompt.length
					)
						throw new TypeError('Prompt should be a string that is not empty.');
				}

				if (options.fastForwardAndRewind.rewindPrompt) {
					if (
						typeof options.fastForwardAndRewind.rewindPrompt !== 'string' ||
						!options.fastForwardAndRewind.rewindPrompt.length
					)
						throw new TypeError('Prompt should be a string that is not empty.');
				}
			}

			if (options.goTo) {
				if (options.goTo.prompt) {
					if (
						typeof options.goTo.prompt !== 'string' ||
						!options.goTo.prompt.length
					)
						throw new TypeError('Prompt should be a string that is not empty.');

					if (typeof options.goTo.time !== 'number' || options.goTo.time < 0)
						throw new TypeError('Time must be non-negative number.');
				}
			}
		}

		let pageNumber = options?.startingPage || 0;

		let page = pages[pageNumber];

		const pagination = await message.channel.send(page);

		const emojis = options?.fastForwardAndRewind
			? ['⏪', '◀️', '⏹', '▶️', '⏩']
			: ['◀️', '⏹', '▶️'];

		if (options?.goTo) emojis.push('🔢');

		if (pagination.deleted) return;

		if (pages.length > 1) Promise.all(emojis.map((e) => pagination.react(e)));
		pagination.react(emojis[options?.fastForwardAndRewind ? 2 : 1]);

		const collector = pagination.createReactionCollector(
			(reaction: MessageReaction, user: User) =>
				emojis.includes(reaction.emoji.name) && user.id === message.author.id,
			{
				dispose: true,
				time: options?.time || 60000,
			}
		);

		const handleReaction = async (reaction: MessageReaction) => {
			if (pagination.deleted) return;
			switch (reaction.emoji.name) {
				case '⏪':
					if (!options?.fastForwardAndRewind) return;
					const rwp = await message.channel.send(
						options.fastForwardAndRewind.rewindPrompt ||
							'How many pages would you like to go back?'
					);
					const rw = parseInt(
						(
							await message.channel.awaitMessages(
								(msg: Message) => {
									if (msg.author.id === message.author.id) msg.delete();
									return msg.author.id === message.author.id;
								},
								{
									max: 1,
									time: options.fastForwardAndRewind.time || 10000,
								}
							)
						).first()?.content || ''
					);

					if (rw) {
						pageNumber -= rw;
						if (pageNumber < 0) pageNumber = 0;
					}
					rwp.delete();
					return await pagination.edit(pages[pageNumber]);
				case '◀️':
					pageNumber--;
					if (pageNumber < 1) {
						pageNumber = 1;
						return;
					}
					return await pagination.edit(pages[pageNumber]);
				case '⏹':
					return collector.stop();
				case '▶️':
					pageNumber++;
					if (pageNumber > pages.length) {
						pageNumber = pages.length;
						return;
					}
					return await pagination.edit(pages[pageNumber]);
				case '⏩':
					if (!options?.fastForwardAndRewind) return;
					const ffp = await message.channel.send(
						options.fastForwardAndRewind.fastForwardPrompt ||
							'How many pages would you like to go forward?'
					);
					const ff = parseInt(
						(
							await message.channel.awaitMessages(
								(msg: Message) => {
									if (msg.author.id === message.author.id) msg.delete();
									return msg.author.id === message.author.id;
								},
								{
									max: 1,
									time: options.fastForwardAndRewind.time || 10000,
								}
							)
						).first()?.content || ''
					);

					if (ff) {
						pageNumber += ff;
						if (pageNumber > pages.length - 1) pageNumber = pages.length - 1;
					}
					ffp.delete();
					return await pagination.edit(pages[pageNumber]);
				case '🔢':
					if (!options?.goTo) return;

					const gtp = await message.channel.send(
						options.goTo.prompt || 'Which page would you like to go to?'
					);

					const gt = parseInt(
						(
							await message.channel.awaitMessages(
								(msg: Message) => {
									if (msg.author.id === message.author.id) msg.delete();
									return msg.author.id === message.author.id;
								},
								{
									max: 1,
									time: options.goTo.time || 10000,
								}
							)
						).first()?.content || ''
					);

					if (gt) {
						pageNumber = gt - 1;
						if (pageNumber > pages.length - 1) pageNumber = pages.length - 1;
						if (pageNumber < 0) pageNumber = 0;
					}
					gtp.delete();
					return await pagination.edit(pages[pageNumber]);
			}
		};

		collector.on('collect', handleReaction);
		collector.on('remove', handleReaction);

		collector.on('end', () => {
			pagination.delete();
		});
	}

	public async loadCommands(commandsDir: string = './src/commands') {
		loadDir(commandsDir, async (err, paths) => {
			if (err) this.logger.error(err.message);

			for (const path of paths) {
				let executeCounter: number = 0;
				let syntaxCounter: number = 0;

				let missing: string[] = [];
				let names: string[] = [];
				let perms: string[] = [];

				const commandFile: Command =
					(await import(path)).default || (await import(path));

				const commandFileName = path.split(sep).pop()!.split('.')[0];

				if (!commandFile.name) commandFile.name = commandFileName;

				if (commandFile.aliases) names.concat(commandFile.aliases);

				if (commandFile.commands) names.concat(commandFile.commands);

				if (commandFile.names) names.concat(commandFile.names);

				names.concat(commandFile.name);

				if (commandFile.callback) {
					executeCounter++;
					commandFile._execute = commandFile.callback;
				}

				if (commandFile.execute) {
					executeCounter++;
					commandFile._execute = commandFile.execute;
				}

				if (commandFile.run) {
					executeCounter++;
					commandFile._execute = commandFile.run;
				}

				if (executeCounter > 1) {
					this.logger.warn(
						`The command "${commandFileName}" have multiple execute functions (callback | run | execute)`
					);
					return;
				}

				if (!commandFile._execute) {
					missing.push('Execute method (callback | run | execute)');
				}

				if (commandFile.usage) {
					syntaxCounter++;
					commandFile._syntax = commandFile.usage;
				}

				if (commandFile.expectedArgs) {
					syntaxCounter++;
					commandFile._syntax = commandFile.expectedArgs;
				}

				if (commandFile.syntax) {
					syntaxCounter++;
					commandFile._syntax = commandFile.syntax;
				}

				if (syntaxCounter > 1) {
					this.logger.warn(
						`The command "${commandFileName}" have multiple syntax strings (usage | syntax | expected args)`
					);
					return;
				}

				if (!commandFile._syntax) {
					missing.push('Syntax (usage | syntax | expected args)');
				}

				if (missing.length) {
					this.logger.warn(
						`The command "${commandFileName}" is missing the following propert${
							missing.length === 1 ? 'y' : 'ies'
						}: ${missing.join(', ')}`
					);
				}

				for (const name of names) {
					this._aliases.set(name, commandFile.name);
				}
				this._commands.set(commandFile.name, commandFile);
			}
		});
	}
	public async loadEvents(eventsDir: string = './src/events') {
		loadDir(eventsDir, async (err, paths) => {
			if (err) this.logger.error(err.message);

			for (const path of paths) {
				const eventFile: Event =
					(await import(path)).default || (await import(path));
				const eventFileName = path.split(sep).pop()!.split('.')[0];

				this.on(eventFileName, eventFile.bind(null, this));
			}
		});
	}
}

export default SyClient;
