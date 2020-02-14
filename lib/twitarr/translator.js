'use strict';

var twitter = require('twitter-text');

var emoji = require('../emoji/utils');
//var emojiRE = new RegExp('(?::|.img src=..img.emoji.small.)(' + emoji.list().join('|') + ')(?:.png. class..emoji..|:)', 'g');
var emojiRE = new RegExp(':(' + emoji.list().join('|') + '):', 'g');
var usernameRE = new RegExp('[@＠]([\\w&-]{3,})', 'g');

function decodeHtml(html) {
	var txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
}

function extract(text, options) {
	var entities = twitter.extractUrlsWithIndices(text, options)
		.concat(twitter.extractHashtagsWithIndices(text, {checkUrlOverlap: false}));

	if (entities.length === 0) {
		return [];
	}

	twitter.removeOverlappingEntities(entities);
	return entities;
}

function format(text) {
	var decoded = decodeHtml(text)
		.replace(emojiRE, function(match, sub) {
			return '<cm-emoji type="' + sub + '"></cm-emoji>';
		});

	var result = '';
	var beginIndex = 0;

	var entities = extract(decoded, {extractUrlsWithoutProtocol: false});
	entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });

	for (var i = 0, len = entities.length, entity; i < len; i++) {
		entity = entities[i];
		result += decoded.substring(beginIndex, entity.indices[0]);

		if (entity.url) {
			result += '<cm-link href="' + entity.url + '"></cm-link>';
		} else if (entity.hashtag) {
			result += '<cm-hashtag tag="' + entity.hashtag + '"></cm-hashtag>';
		} else if (entity.screenName) {
			result += entity.screenName.toLowerCase();
		} else {
			/* eslint-disable no-console */
			console.log('Unhandled entity type: ' + JSON.stringify(entity));
			/* eslint-enable no-console */
		}
		beginIndex = entity.indices[1];
	}
	result += decoded.substring(beginIndex, decoded.length);

	result = result.replace(usernameRE, function(search, match1) {
		return '<cm-user username="' + match1.toLowerCase() + '"></cm-user>';
	});
	return result;
}

var crRE = /<[Bb][Rr]\s*\/?>/g;

function removeCarriageReturns(text) {
	return text.replace(crRE, '\n');
}

module.exports = {
	decode: decodeHtml,
	format: format,
	removeCarriageReturns: removeCarriageReturns
};