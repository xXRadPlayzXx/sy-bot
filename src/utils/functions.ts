import * as fs from 'fs';
import * as path from 'path';
/**
 *
 * @param str The text that will get capitalized
 * @returns {String} the text capizalized
 */
export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 *
 * @param {String} dirPath The path to the folder you want to load
 * @example "./commands"
 */
export const loadDir = (
	dirPath: string,
	done: (
		err: Error | null,
		filePaths: string[]
	) => Promise<void | any> | void | any
): void => {
	let results: string[] = [];

	fs.readdir(dirPath, function (err, list) {
		if (err) return done(err, results);
		let pending = list.length;
		if (!pending) return done(null, results);
		list.forEach((file) => {
			file = path.resolve(dirPath, file);
			const stat = fs.lstatSync(file);
			if (stat && stat.isDirectory()) {
				loadDir(file, function (err, res) {
					if (err) return done(err, results);
					results = results.concat(res);
					if (!--pending) done(null, results);
				});
			} else {
				results.push(file);
				if (!--pending) done(null, results);
			}
		});
	});
};
