var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');
var path = require('path');
var _ = require('underscore');

var config = require(__dirname + '/../../config').logging;

var logPath = path.resolve(config.path + '/' + config.filename + '.' + config.extension);
var logLevel = config.level;

var levelMap = {
    'DEGBUG': 1,
    'STAGE': 2,
    'PRODUCTION': 3
};

// generate formatter function
var formatter = compile(config.messageFormat);

var stream;

// create log directory if it doesn't exist
mkdirp(config.path, {}, function(err, made) {
    if (err) {
        console.log('[LOGGER] ' + err);
        module.exports.prod('[LOGGER] ' + err);
    }

    if (made) {
        module.exports.prod('[LOGGER] Created log directory ' + made);
        module.exports.prod('[LOGGER] Log file created.');
    }
});

// create writeStream to log
stream = fs.createWriteStream(logPath, {encoding: 'utf8', flags: 'a'});

stream.on('error', function (err) {
    console.log('stream error');
    console.error(err);
});

stream.on('finish', function () {
    console.log('stream finish');
    console.log(arguments);
});

/**
 * Log string to file system
 *
 * @param {String} message
 * @param {Function} [done]
 * @return undefined
 * @api private
 */
module.exports._log = function (message, done) {
    if (stream) {
        stream.write(message);
    }
    done && done();
};

/**
 * Format Object to a string
 *
 * @param {Object} data
 * @return String
 * @api public
 */
module.exports.format = function (data) {

    // add default info
    data.date = moment().format(config.dateFormat);
    data.label = config.level;
    return formatter(data) + '\n';
};

/**
 * Log debug message if running at debug level
 *
 * @param {String} message
 * @return undefined
 * @api public
 */
module.exports.debug = function (message, done) {
    if (levelMap[config.level.toUpperCase()] < levelMap['DEBUG']) return;
    module.exports._log(this.format({message: message}), done);
};

/**
 * Log debug message if running at debug level
 *
 * @param {String} message
 * @return undefined
 * @api public
 */
module.exports.stage = function (message, done) {
    if (levelMap[config.level.toUpperCase()] < levelMap['STAGE']) return;
    module.exports._log(this.format({message: message}), done);
};

/**
 * Log debug message if running at debug level
 *
 * @param {String} message
 * @return undefined
 * @api public
 */
module.exports.prod = function (message, done) {
    if (levelMap[config.level.toUpperCase()] < levelMap['PROD']) return;
    module.exports._log(this.format({message: message}), done);
};

/**
 * Compile `fmt` into a function.
 *
 * @param {String} fmt
 * @return {Function}
 * @api private
 */
function compile(fmt) {
    return _.template(fmt);
}
