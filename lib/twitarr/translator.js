const twitter = require('twitter-text');

const emoji = require('../emoji/utils');
//const emojiRE = new RegExp('(?::|.img src=..img.emoji.small.)(' + emoji.list().join('|') + ')(?:.png. class..emoji..|:)', 'g');
const emojiRE = new RegExp(':(' + emoji.list().join('|') + '):', 'g');
const usernameRE = new RegExp('[@＠]([\\w&-]{3,})', 'g');

const decodeHtml = (html) => {
	const txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
}

const extract = (text, options) => {
	const entities = twitter.extractUrlsWithIndices(text, options)
		.concat(twitter.extractHashtagsWithIndices(text, {checkUrlOverlap: false}));

	if (entities.length === 0) {
		return [];
	}

	twitter.removeOverlappingEntities(entities);
	return entities;
}

const format = (text) => {
	const decoded = decodeHtml(text)
		.replace(emojiRE, (match, sub) => {
			return '<cm-emoji type="' + sub + '"></cm-emoji>';
		});

	let result = '';
	let beginIndex = 0;

	const entities = extract(decoded, {extractUrlsWithoutProtocol: false});
	entities.sort((a,b) =>{ return a.indices[0] - b.indices[0]; });

	for (let i = 0, len = entities.length, entity; i < len; i++) {
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
			console.warn('Unhandled entity type: ' + JSON.stringify(entity));
			/* eslint-enable no-console */
		}
		beginIndex = entity.indices[1];
	}
	result += decoded.substring(beginIndex, decoded.length);

	result = result.replace(usernameRE, (search, match1) => {
		return '<cm-user username="' + match1.toLowerCase() + '"></cm-user>';
	});
	return result;
}

const formatText = (text) => {
	const decoded = decodeHtml(text)
		.replace(emojiRE, (match, sub) => {
			return `*${sub} emoji*`;
		});

	let result = '';
	let beginIndex = 0;

	const entities = extract(decoded, {extractUrlsWithoutProtocol: false});
	entities.sort((a,b) =>{ return a.indices[0] - b.indices[0]; });

	for (let i = 0, len = entities.length, entity; i < len; i++) {
		entity = entities[i];
		result += decoded.substring(beginIndex, entity.indices[0]);

		if (entity.url) {
			result += entity.url;
		} else if (entity.hashtag) {
			result += entity.hashtag;
		} else if (entity.screenName) {
			result += entity.screenName;
		} else {
			/* eslint-disable no-console */
			console.warn('Unhandled entity type: ' + JSON.stringify(entity));
			/* eslint-enable no-console */
		}
		beginIndex = entity.indices[1];
	}
	result += decoded.substring(beginIndex, decoded.length);

	return result;
}

const crRE = /<[Bb][Rr]\s*\/?>/g;

function removeCarriageReturns(text) {
	return text.replace(crRE, '\n');
}

module.exports = {
	decode: decodeHtml,
	format: format,
	formatText: formatText,
	removeCarriageReturns: removeCarriageReturns
};