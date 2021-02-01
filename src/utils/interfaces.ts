import { permissions, cmdRunFn } from './types';

export declare interface Logger {
	log(message: string): Promise<string>;
	success(message: string): Promise<string>;
	error(message: string | Error): Promise<string>;
	warn(message: string): Promise<string>;
	info(message: string): Promise<string>;
}

export declare interface Command {
	name?: string;

	description?: string;

	usage?: string;
	syntax?: string;
	expectedArgs?: string;

	cooldown?: number;
	globalCooldown?: number;

	names?: string[];
	aliases?: string[];
	commands?: string[];

	perms?: permissions;
	permissions?: permissions;
	requiredPermissions?: permissions;
	requiredPerms?: permissions;

	devOnly?: boolean;
	guildOwnerOnly?: boolean;
	guildOnly?: boolean;

	callback?: cmdRunFn;
	execute?: cmdRunFn;
	run?: cmdRunFn;

	minArgs?: number;
	maxArgs?: number;

	_reqPerms?: permissions;
	_execute?: cmdRunFn;
	_syntax?: string;
}
