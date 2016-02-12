'use strict';

var assert = require('assert-plus');
var jsdom = require('jsdom').jsdom;
document = jsdom( '<html/>' );

describe('Twit-Arr Translator', function() {
	var translator = require('../../lib/twitarr/translator');

	describe('HTML handling', function() {
		it('return the same text when there are no entities or links', function() {
			[
				'This has no HTML.',
				'Here is a big long thing with a " symbol and maybe some unicode: \u25CF'
			].forEach(function(entry) {
				assert.equal(translator.decode(entry), entry);
				assert.equal(translator.format(entry), entry);
			});
		});

		it('turn &amp; into an ampersand', function() {
			assert.equal(translator.decode('foo &amp; bar'), 'foo & bar');
			assert.equal(translator.format('foo &amp; bar'), 'foo & bar');
		});

		it('turn &#39; into \'', function() {
			assert.equal(translator.decode('this is &#39;stupid&#39; isn&#39;t it?'), 'this is \'stupid\' isn\'t it?');
			assert.equal(translator.format('this is &#39;stupid&#39; isn&#39;t it?'), 'this is \'stupid\' isn\'t it?');
		});

		it('turn &amp;amp; into &amp;', function() {
			assert.equal(translator.decode('this &amp;amp; that'), 'this &amp; that');
			assert.equal(translator.format('this &amp;amp; that'), 'this &amp; that');
		});

		it('handles <br> properly', function() {
			assert.equal(translator.decode('this \'quoted\' thing<br><br />yeah'), 'this \'quoted\' thing<br><br />yeah');
			assert.equal(translator.format('this \'quoted\' thing<br><br />yeah'), 'this \'quoted\' thing<br><br />yeah');
		});
	});

	describe('emoji handling', function() {
		it('turn :emoji: into a link', function() {
			assert.equal(translator.format('I am a :pirate:!  Yarr!'), 'I am a <cm-emoji type="pirate"></cm-emoji>!  Yarr!');
		});
		it('turn :multiple: :emoji: into a link', function() {
			assert.equal(translator.format('I am a :pirate: with a :towel-monkey:!'), 'I am a <cm-emoji type="pirate"></cm-emoji> with a <cm-emoji type="towel-monkey"></cm-emoji>!');
		});
		it('don\'t translate :invalid: emoji', function() {
			assert.equal(translator.format('I am a :pirate: with a :monkey-towel:!'), 'I am a <cm-emoji type="pirate"></cm-emoji> with a :monkey-towel:!');
		});
	});

	describe('hashtag handling', function() {
		it('turn #hashtag into a hashtag', function() {
			assert.equal(translator.format('I am a #hashtag.'), 'I am a <cm-hashtag tag="hashtag"></cm-hashtag>.');
		});
		it('turn multiple #hashtags into hashtags', function() {
			assert.equal(translator.format('I am a #hashtag. #yolo'), 'I am a <cm-hashtag tag="hashtag"></cm-hashtag>. <cm-hashtag tag="yolo"></cm-hashtag>');
		});
		it('handle invalid hashtags', function() {
			assert.equal(translator.format('I am a #hashtag.  This is a #weird-hashtag.'), 'I am a <cm-hashtag tag="hashtag"></cm-hashtag>.  This is a <cm-hashtag tag="weird"></cm-hashtag>-hashtag.');
		})
	});

	describe('mention handling', function() {
		it('turn @mention into a <user /> tag', function() {
			assert.equal(translator.format('@rangerrick that is crazy!'), '<cm-user username="rangerrick"></cm-user> that is crazy!');
		});
		it('turn @multiple @mentions into <user /> tags', function() {
			assert.equal(translator.format('@rangerrick @ranger that is STILL crazy!'), '<cm-user username="rangerrick"></cm-user> <cm-user username="ranger"></cm-user> that is STILL crazy!');
		});
		it('handle usernames with traditionally problematic characters', function() {
			assert.equal(translator.format('@john-r-s you are supported!'), '<cm-user username="john-r-s"></cm-user> you are supported!');
		});
	});

	describe('mixed content', function() {
		it('handle @mentions and #hashtags cleanly', function() {
			assert.equal(translator.format('Hello @james #hashtag #butts'), 'Hello <cm-user username="james"></cm-user> <cm-hashtag tag="hashtag"></cm-hashtag> <cm-hashtag tag="butts"></cm-hashtag>');
		});
	});
});
