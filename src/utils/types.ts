import {
	BitFieldResolvable,
	PermissionString,
	Message,
	Snowflake,
} from 'discord.js';

import SyClient from '../client';

export declare type permissions = BitFieldResolvable<PermissionString>[];

export declare type Event = (
	client: SyClient,
	...args: any[]
) => Promise<void | any> | void | any;

export declare type cmdRunFn = (
	message: Message,
	args: string[],
	client: SyClient
) => Promise<void | any> | void | any;
export declare type GuildInfo = {
	/** This guilds prefix for the bot */
	prefix: string;

	/** Array with all disabled command names */
	disabledCommands?: string[];

	/** Array with all channel ID's that are disabled */
	disabledChannels?: Snowflake[];

	/** Contains all the custom command permissions for a command */
	commandPerms?: { [name: string]: PermissionString[] };

	/** Contains all custom role cooldowns for a command */
	commandCooldowns?: {
		[nameOfTheCommand: string]: { [id: string]: number };
	};

	/** Contains all custom command aliases */
	commandAlias?: { [alias: string]: string };

	/** Welcome channel id */
	welcomeChannelID?: string;

	/** Member role id */
	memberRoleID?: string;
};
