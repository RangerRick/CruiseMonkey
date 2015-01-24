/*global jasmine: true */
/*global describe: true */
/*global expect: true */
/*global inject: true */
/*global beforeEach: true */
/*global afterEach: true */
/*global it: true */
/*global spyOn: true */
/*global xit: true */
/*global xdescribe: true */

describe('Twit-Arr', function() {
	'use strict';

	var twit,
		Cordova,
		LocalNotifications,
		SettingsService,
		UserService,
		$httpBackend,
		$rootScope,
		$timeout;

	beforeEach(function() {
		console.info('--------------------------------------------------------------------------------');
		jasmine.clock().install();
		angular.module('ngCordova', []);
		angular.module('angularFileUpload', []);
	});

	beforeEach(module('cruisemonkey.Twitarr', function($provide) {
		LocalNotifications = {
		};
		UserService = {
			get: function() {
				return {
				};
			}
		};
		SettingsService = {
			getTwitarrRoot: function() {
				return 'https://jccc5.rylath.net/';
			},
			getBackgroundInterval: function() {
				return 10000;
			}
		};
		$provide.value('$upload', {});
		$provide.value('$cordovaFile', {});
		$provide.value('$cordovaFileTransfer', {});
		$provide.value('LocalNotifications', {});
		$provide.value('Cordova', {});
		$provide.value('UserService', UserService);
		$provide.value('SettingsService', SettingsService);
		$provide.value('config.twitarr.enable-cachebusting', false);
	}));

	beforeEach(inject(function($injector) {
		$httpBackend = $injector.get('$httpBackend');
		$rootScope   = $injector.get('$rootScope');
		$timeout     = $injector.get('$timeout');

		twit         = $injector.get('Twitarr');
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	var mockPageOne = {
		"next_page": 1420848811355.0,
		"stream_posts": [
			{
				"author": "pneumatic",
				"display_name": "pneumatic",
				"entities": [],
				"hash_tags": [],
				"id": "54b1ab35dd8fc4fa74000067",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "Most of the reviews I've read recently talk about a long, steep set of stairs from the parking lot to the visitor's center.",
				"timestamp": "2015-01-10T22:44:05.919Z"
			},
			{
				"author": "glenraphael",
				"display_name": "glenraphael",
				"entities": [],
				"hash_tags": [],
				"id": "54b1a6dbdd8fc444d1000066",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "And just as I was trying to post &quot;hey, this all seems to work fine on an iPhone6!&quot; the app hung and I had to reload. Let's see if it takes this update now...",
				"timestamp": "2015-01-10T22:25:31.109Z"
			},
			{
				"author": "glenraphael",
				"display_name": "glenraphael",
				"entities": [],
				"hash_tags": [],
				"id": "54b1a5b4dd8fc4d42d000065",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "The Glen Raphael concert is tentatively scheduled for Thursday 5-6pm in Labyrinth. Since this is right before the 6pm formal dinner, attendees are encouraged to attend in formal wear! Those who watch from the balcony are further encouraged to heckle between songs in the manner of Statler and Waldorf.",
				"timestamp": "2015-01-10T22:20:36.975Z"
			},
			{
				"author": "glenraphael",
				"display_name": "glenraphael",
				"entities": [],
				"hash_tags": [],
				"id": "54b1a1b0dd8fc4b8b0000063",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "There's an elevator alternative for most of the places that involve stairs.",
				"timestamp": "2015-01-10T22:03:28.220Z"
			},
			{
				"author": "gbasden",
				"display_name": "gbasden",
				"entities": [],
				"hash_tags": [],
				"id": "54b0d0f5dd8fc4b0d900005f",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "As I recall there were quite a few. I think it depends on how much walking you want to do.",
				"timestamp": "2015-01-10T07:12:53.659Z"
			}
		]
	};
	var mockPageTwo = {
		"next_page": 0,
		"stream_posts": [
			{
				"author": "origamislayer",
				"display_name": "origamislayer",
				"entities": [],
				"hash_tags": [],
				"id": "54b06eabdd8fc40e03000058",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"photo": {
					"animated": false,
					"id": "54b06e9add8fc4b32d000057"
				},
				"text": "Iphone photo",
				"timestamp": "2015-01-10T00:13:31.355Z"
			},
			{
				"author": "jillwebb",
				"display_name": "jillwebb",
				"entities": [],
				"hash_tags": [],
				"id": "54b033fedd8fc49044000056",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "Testing from my android.",
				"timestamp": "2015-01-09T20:03:10.862Z"
			},
			{
				"author": "chordash",
				"display_name": "chordash",
				"entities": [],
				"hash_tags": [],
				"id": "54afaea9dd8fc489c5000051",
				"likes": null,
				"mentions": [],
				"parent_chain": [],
				"text": "Anticipation was growing for the cruise so I figured I'd check up on Cruise Monkey and Twit-arr. I am impressed to say the least!",
				"timestamp": "2015-01-09T10:34:17.403Z"
			},
		]
	};

	it('should return 5 posts', function() {
		$httpBackend.expectGET('https://jccc5.rylath.net/api/v2/stream').respond(200, mockPageOne);
		twit.getStream().then(function(res) {
			expect(res).toBeDefined();
			expect(res.next_page).toBeDefined();
			expect(res.stream_posts).toBeDefined();
			expect(res.stream_posts.length).toBe(5);
		});
		$httpBackend.flush();
	});

	xit('should return 3 posts', function() {
		$httpBackend.expectGET('https://jccc5.rylath.net/api/v2/stream').respond(200, mockPageOne);
		$httpBackend.expectGET('https://jccc5.rylath.net/api/v2/stream?start=1420848811355.0').respond(200, mockPageTwo);
		twit.getStream().then(function(res) {
			twit.moreStream().then(function(res) {
				expect(res).toBeDefined();
				expect(res.next_page).toBeDefined();
				expect(res.stream_posts).toBeDefined();
				expect(res.stream_posts.length).toBe(3);
			});
		});
		$httpBackend.flush();
	});
});
