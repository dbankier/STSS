/**
 * Convertor for SCSS structured markup to CSS markup.
 *
 * This utilizes the libsass library, made available via the node-sass project.
 * 
 * @class 	renderer.scss2css
 * @author  ronaldtreur <ronald@lostparticle.net>
 */

var sass = require('node-sass');

/**
 * Convert the supplied SCSS structured markup into CSS.
 *
 * This function executes synchronously.
 *
 * @constructor
 * @param 	{String}	scss 		SCSS structured markup
 * @param 	{Object}	options		Dictionary containing additional instructions
 * @return 	{String}				CSS structured markup
 */
module.exports = function(scss, options) {
	try {
		var result = sass.renderSync({
			data: scss,
			include_paths: options.includePaths
		});
		options.stats = result.stats;
		return result.css;
	} catch (errMsg) {
		return parseError(errMsg, scss, options);
	}
};

/**
 * Parse the error string into a new Error object.
 * 
 * @param	{String}	msg  		Error message (as generated by node-sass)
 * @param	{String}	scss 		SCSS source (that potentially contains the error if it is source-based)
 * @param	{Object}	options		Dictionary containing additional instructions
 * @return	{Error}					Error instance
 */
function parseError(msg, scss, options) {
	var match = msg.match(/([\w\s]+):(\d+): error: ([\s\S]+)/),
		prefix = 'An error occurred while parsing the (generated) SCSS',
		newMsg, err, line, lineNr;

	if (!match || !match.length || match[1] !== 'source string') {
		return new Error(msg);
	}

	newMsg = match[3].trim();
	line = getLine(scss, match[2]);
	lineNr = match[2];

	if (options.filename) {
		prefix += ' for ' + options.filename;
	}
	prefix += ' (line: ' + lineNr + '):';

	err = new Error(prefix + '\n\t' + line + '\n' + newMsg);
	err.original = msg;
	err.processed = newMsg;
	err.title = prefix;
	err.line = line;
	err.lineNr = lineNr;
	err.file = options.filename || '';

	return err;
}

/**
 * Extract a line from the text.
 * 
 * @param  {String} text   Source text
 * @param  {Number} lineNr Line number
 * @return {String}        Line
 */
function getLine(text, lineNr) {
	var lines = text.split(/\r\n|\n|\r|\f/);
	return lines[lineNr-1].trim();
}