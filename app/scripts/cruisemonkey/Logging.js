(function() {
	'use strict';

	function StringAppender() {}

	/*global log4javascript: true*/
	StringAppender.prototype = new log4javascript.Appender();
	StringAppender.prototype.layout = new log4javascript.NullLayout();
	StringAppender.prototype.threshold = log4javascript.Level.DEBUG;
	StringAppender.prototype._saLogHistory = "";
	StringAppender.prototype._saIndentLevel = 0;

	StringAppender.prototype._getPrefix = function() {
		var prefix = "";
		for (var i = 0; i < this._saIndentLevel; i++) {
			prefix += " ";
		}
		return prefix;
	};

	StringAppender.prototype._increaseIndentLevel = function() {
		this._saIndentLevel += 2;
	};

	StringAppender.prototype._decreaseIndentLevel = function() {
		this._saIndentLevel -= 2;
		if (this._saIndentLevel < 0) {
			this._saIndentLevel = 0;
		}
	};

	StringAppender.prototype._resetLogHistory = function() {
		this._saLogHistory  = "";
		this._saIndentLevel = 0;
	};

	StringAppender.prototype._addToLogHistory = function(message) {
		if (this._saLogHistory === undefined) {
			this._saLogHistory = this._getPrefix() + message + "\n";
		} else {
			this._saLogHistory += this._getPrefix() + message + "\n";
		}
	};

	StringAppender.prototype.getLogHistory = function() {
		return this._saLogHistory || "";
	};

	StringAppender.prototype.append = function(loggingEvent) {
		var appender = this;

		var getFormattedMessage = function() {
			var layout = appender.getLayout();
			var formattedMessage = layout.format(loggingEvent);
			if (layout.ignoresThrowable() && loggingEvent.exception) {
				formattedMessage += loggingEvent.getThrowableStrRep();
			}
			return formattedMessage;
		};

		appender._addToLogHistory(getFormattedMessage());
	};

	StringAppender.prototype.group = function(name) {
		this._addToLogHistory("=== " + name + " ===");
		this._increaseIndentLevel();
	};

	StringAppender.prototype.groupEnd = function() {
		this._decreaseIndentLevel();
	};

	StringAppender.prototype.toString = function() {
		return "StringAppender";
	};

	function ConsoleAppender() {}

	ConsoleAppender.prototype = new log4javascript.Appender();
	ConsoleAppender.prototype.layout = new log4javascript.NullLayout();
	ConsoleAppender.prototype.threshold = log4javascript.Level.DEBUG;

	ConsoleAppender.prototype.append = function(loggingEvent) {
		var appender = this;

		var getFormattedMessage = function() {
			var layout = appender.getLayout();
			var formattedMessage = layout.format(loggingEvent);
			if (layout.ignoresThrowable() && loggingEvent.exception) {
				formattedMessage += loggingEvent.getThrowableStrRep();
			}
			return formattedMessage;
		};

		console.log(getFormattedMessage());
	};

	ConsoleAppender.prototype.group = function(name) {
		if (console.group) {
			console.group(name);
		}
	};

	ConsoleAppender.prototype.groupEnd = function() {
		if (console.groupEnd) {
			console.groupEnd();
		}
	};

	ConsoleAppender.prototype.toString = function() {
		return "ConsoleAppender";
	};

	angular.module('cruisemonkey.Logging', ['cruisemonkey.Config'])
	.factory('LoggingService', ['config.logging.useStringAppender', function(useStringAppender) {
		console.log('initializing LoggingService');

		var logger = log4javascript.getLogger();
		logger.removeAllAppenders();

		var ret = {
			'getLogHistory': function() {
				return "";
			},
			'trace': function() {
				logger.trace(Array.prototype.slice.apply(arguments));
			},
			'debug': function() {
				logger.debug(Array.prototype.slice.apply(arguments));
			},
			'info': function() {
				logger.info(Array.prototype.slice.apply(arguments));
			},
			'warn': function() {
				logger.warn(Array.prototype.slice.apply(arguments));
			},
			'warning': function() {
				logger.warn(Array.prototype.slice.apply(arguments));
			},
			'error': function() {
				logger.error(Array.prototype.slice.apply(arguments));
			},
			'fatal': function() {
				logger.fatal(Array.prototype.slice.apply(arguments));
			}
		};

		var layout = new log4javascript.PatternLayout("%d{HH:mm:ss,SSS} [%-5p] %m");
		if (useStringAppender) {
			console.log('initializing StringAppender');
			var stringAppender = new StringAppender();
			stringAppender.setLayout(layout);
			logger.addAppender(stringAppender);

			ret.getLogHistory = function() {
				return stringAppender.getLogHistory();
			};
		} else {
			console.log('skipping StringAppender');
		}

		var appender = new ConsoleAppender();
		appender.setLayout(layout);
		logger.addAppender(appender);

		return ret;
	}]);

}());