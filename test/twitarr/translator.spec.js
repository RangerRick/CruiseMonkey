/* global describe: true */
/* global it: true */

const assert = require('assert-plus');
// require('jsdom-global')();

describe('Twit-Arr Translator', () => {
	const translator = require('../../lib/twitarr/translator');

	describe('HTML handling', () => {
		test('return the same text when there are no entities or links', () => {
			[
				'This has no HTML.',
				'Here is a big long thing with a " symbol and maybe some unicode: \u25CF'
			].forEach((entry) => {
				assert.equal(translator.decode(entry), entry);
				assert.equal(translator.format(entry), entry);
			});
		});

		test('turn &amp; into an ampersand', () => {
			assert.equal(translator.decode('foo &amp; bar'), 'foo & bar');
			assert.equal(translator.format('foo &amp; bar'), 'foo & bar');
		});

		test('turn &#39; into \'', () => {
			assert.equal(translator.decode('this is &#39;stupid&#39; isn&#39;t it?'), 'this is \'stupid\' isn\'t it?');
			assert.equal(translator.format('this is &#39;stupid&#39; isn&#39;t it?'), 'this is \'stupid\' isn\'t it?');
		});

		test('turn &amp;amp; into &amp;', () => {
			assert.equal(translator.decode('this &amp;amp; that'), 'this &amp; that');
			assert.equal(translator.format('this &amp;amp; that'), 'this &amp; that');
		});

		test('handles <br> properly', () => {
			assert.equal(translator.decode('this \'quoted\' thing<br><br />yeah'), 'this \'quoted\' thing<br><br />yeah');
			assert.equal(translator.format('this \'quoted\' thing<br><br />yeah'), 'this \'quoted\' thing<br><br />yeah');
		});
	});

	describe('emoji handling', () => {
		test('turn :emoji: into a link', () => {
			assert.equal(translator.format('I am a :pirate:!  Yarr!'), 'I am a <cm-emoji type="pirate"></cm-emoji>!  Yarr!');
		});
		test('turn :multiple: :emoji: into a link', () => {
			assert.equal(translator.format('I am a :pirate: with a :towel-monkey:!'), 'I am a <cm-emoji type="pirate"></cm-emoji> with a <cm-emoji type="towel-monkey"></cm-emoji>!');
		});
		test('don\'t translate :invalid: emoji', () => {
			assert.equal(translator.format('I am a :pirate: with a :monkey-towel:!'), 'I am a <cm-emoji type="pirate"></cm-emoji> with a :monkey-towel:!');
		});
	});

	describe('hashtag handling', () => {
		test('turn #hashtag into a hashtag', () => {
			assert.equal(translator.format('I am a #hashtag.'), 'I am a <cm-hashtag tag="hashtag"></cm-hashtag>.');
		});
		test('turn multiple #hashtags into hashtags', () => {
			assert.equal(translator.format('I am a #hashtag. #yolo'), 'I am a <cm-hashtag tag="hashtag"></cm-hashtag>. <cm-hashtag tag="yolo"></cm-hashtag>');
		});
		test('handle invalid hashtags', () => {
			assert.equal(translator.format('I am a #hashtag.  This is a #weird-hashtag.'), 'I am a <cm-hashtag tag="hashtag"></cm-hashtag>.  This is a <cm-hashtag tag="weird"></cm-hashtag>-hashtag.');
		})
	});

	describe('mention handling', () => {
		test('turn @mention into a <user /> tag', () => {
			assert.equal(translator.format('@rangerrick that is crazy!'), '<cm-user username="rangerrick"></cm-user> that is crazy!');
		});
		test('turn @multiple @mentions into <user /> tags', () => {
			assert.equal(translator.format('@rangerrick @ranger that is STILL crazy!'), '<cm-user username="rangerrick"></cm-user> <cm-user username="ranger"></cm-user> that is STILL crazy!');
		});
		test('handle usernames with traditionally problematic characters', () => {
			assert.equal(translator.format('@john-r-s you are supported!'), '<cm-user username="john-r-s"></cm-user> you are supported!');
		});
	});

	describe('mixed content', () => {
		test('handle @mentions and #hashtags cleanly', () => {
			assert.equal(translator.format('Hello @james #hashtag #butts'), 'Hello <cm-user username="james"></cm-user> <cm-hashtag tag="hashtag"></cm-hashtag> <cm-hashtag tag="butts"></cm-hashtag>');
		});
	});
});
