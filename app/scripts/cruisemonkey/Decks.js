function CMDeck(floor, amenities) {
	'use strict';
	var self = this;

	var _floor = floor;
	var _amenities = [];

	self.getFloor = function() {
		return _floor;
	};
	
	self.getAmenities = function() {
		return _amenities;
	};

	self.toString = function() {
		var ret = 'CMDeck[floor=' + _floor + ',amenities=[';
		angular.forEach(_amenities, function(amenity, index) {
			ret += amenity.toString();
			if (index+1 !== _amenities.length) {
				ret += ',';
			}
		});
		ret += ']]';
		return ret;
	};

	angular.forEach(amenities, function(amenity, index) {
		amenity.setDeck(self);
		_amenities.push(amenity);
	});

}

function CMAmenity(id, summary, icon, category, description) {
	'use strict';
	var self = this;

	var _id = id;
	var _summary = summary;
	var _icon = icon;
	var _category = category;
	var _description = description;
	var _deck;

	self.getDeck = function() {
		return _deck;
	};
	self.setDeck = function(deck) {
		_deck = deck;
	};

	self.getUniqueId = function() {
		return _deck.getFloor() + '-' + _id;
	};

	self.getId = function() {
		return _id;
	};

	self.getSummary = function() {
		return _summary;
	};

	self.getIcon = function() {
		return _icon;
	};

	self.getCategory = function() {
		return _category;
	};

	self.getDescription = function() {
		return _description;
	};

	self.matches = function(searchString) {
		if (searchString === undefined || searchString === '') {
			return true;
		}

		if (self.getSummary() !== undefined && self.getSummary().contains(searchString)) {
			return true;
		} else if (self.getDescription() !== undefined && self.getDescription().contains(searchString)) {
			return true;
		} else {
			var asNumber = parseInt(searchString, 10);
			if (asNumber === self.getDeck().getFloor()) {
				return true;
			}
		}

		return false;
	};

	self.toString = function() {
		return 'CMAmenity[deck=' + _deck.getFloor() + ',id=' + _id + ',summary=' + _summary + ']';
	};
}

(function() {
	'use strict';

	var _deckInfo = {
		2: new CMDeck(2, [
			new CMAmenity('alhambra-theatre', 'Alhambra Theatre', 'ion-music-note', 'Entertainment'),
			new CMAmenity('conference-center', 'Conference Center', 'ion-printer', 'Business'),
			new CMAmenity('studio-b', 'Studio B and Ice Rink (Entrance on Deck 3)', 'ion-music-note', 'Entertainment')
		]),
		3: new CMDeck(3, [
			new CMAmenity('alhambra-theatre', 'Alhambra Theatre', 'ion-music-note', 'Entertainment'),
			new CMAmenity('centrum', 'Centrum'),
			new CMAmenity('studio-b', 'Studio B and Ice Rink (Entrance on Deck 3)', 'ion-music-note', 'Entertainment'),
			new CMAmenity('on-air-club', 'On Air Club', 'ion-mic-b', 'Entertainment'),
			new CMAmenity('rctv', 'RCTV'),
			new CMAmenity('art-gallery', 'Art Gallery', 'ion-images', 'Shopping'),
			new CMAmenity('anthony-and-cleopatra', 'Anthony and Cleopatra', 'ion-fork', 'Dining'),
			new CMAmenity('othello', 'Othello', 'ion-fork', 'Dining'),
			new CMAmenity('romeo-and-juliet-dining-room', 'Romeo and Juliet Dining Room', 'ion-fork', 'Dining')
		]),
		4: new CMDeck(4, [
			new CMAmenity('alhambra-theatre', 'Alhambra Theatre', 'ion-music-note', 'Entertainment'),
			new CMAmenity('schooner-bar', 'Schooner Bar', 'ion-wineglass', 'Bar'),
			new CMAmenity('the-raven', 'The Raven', 'ion-mic-c', 'Dancing'),
			new CMAmenity('casino-royale', 'Casino Royale', undefined, 'Casino'),
			new CMAmenity('photo-gallery-and-shop', 'Photo Gallery and Shop', 'ion-images', 'Shopping'),
			new CMAmenity('boleros-lounge', 'Boleros Lounge', 'ion-wineglass', 'Bar'),
			new CMAmenity('macbeth-dining-room', 'Macbeth Dining Room', 'ion-fork', 'Dining')
		]),
		5: new CMDeck(5, [
			new CMAmenity('pyramid-lounge', 'Pyramid Lounge', 'ion-wineglass', 'Bar'),
			new CMAmenity('connoisseur-club', 'Connoisseur Club', 'ion-wineglass', 'Bar'),
			new CMAmenity('sorrentos', "Sorrento's", 'ion-fork', 'Dining'),
			new CMAmenity('promenade-shops', 'Promenade Shops', 'ion-bag', 'Shopping'),
			new CMAmenity('dog-and-badger-pub', 'Dog and Badger Pub', 'ion-beer', 'Dining'),
			new CMAmenity('vintages', 'Vintages', 'ion-wineglass', 'Bar'),
			new CMAmenity('royal-promenade', 'Royal Promenade', 'ion-bag', 'Shopping'),
			new CMAmenity('ice-cream-parlor', 'Ice Cream Parlor', 'ion-icecream', 'Dining'),
			new CMAmenity('cupcake-cupboard', 'Cupcake Cupboard', 'ion-icecream', 'Dining'),
			new CMAmenity('cafe-promenade', 'Café Promenade', 'ion-coffee', 'Dining'),
			new CMAmenity('seasons', 'Seasons'),
			new CMAmenity('next-cruise', 'Next Cruise', 'ion-help-buoy', 'Ship Services'),
			new CMAmenity('shore-excursions', 'Shore Excursions', 'ion-help-buoy', 'Ship Services'),
			new CMAmenity('guest-services', 'Guest Services', 'ion-help-buoy', 'Ship Services'),
			new CMAmenity('champagne-bar', 'Champagne Bar', 'ion-wineglass', 'Bar'),
			new CMAmenity('king-lear-dining-room', 'King Lear Dining Room', 'ion-fork', 'Dining')
		]),
		6: new CMDeck(6, [
			new CMAmenity('royal-promenade', 'Royal Promenade (Overlook)', 'ion-bag', 'Shopping'),
			new CMAmenity('business-services', 'Business Services', 'ion-printer', 'Business')
		]),
		7: new CMDeck(7, [
			new CMAmenity('royal-promenade', 'Royal Promenade (Overlook)', 'ion-bag', 'Shopping'),
			new CMAmenity('library', 'Library', 'ion-android-book', 'Ship Services')
		]),
		8: new CMDeck(8, [
			new CMAmenity('royal-promenade', 'Royal Promenade (Overlook)', 'ion-bag', 'Shopping'),
			new CMAmenity('rc-online', 'RC Online', 'ion-printer', 'Business')
		]),
		10: new CMDeck(10, [
			new CMAmenity('concierge-club', 'Concierge Club', 'ion-help-buoy', 'Ship Services')
		]),
		11: new CMDeck(11, [
			new CMAmenity('vitality-at-sea', 'Vitality at Sea Spa and Fitness Center', undefined, 'Fitness'),
			new CMAmenity('solarium', 'Solarium', 'ion-waterdrop', 'Pool'),
			new CMAmenity('whirlpool-fore', 'Whirlpools (Fore)', 'ion-waterdrop', 'Pool'),
			new CMAmenity('pool-bar', 'Pool Bar', 'ion-wineglass', 'Bar'),
			new CMAmenity('whirlpools-main', 'Whirlpools (Main Pool)', 'ion-waterdrop', 'Pool'),
			new CMAmenity('sport-pool', 'Sport Pool', 'ion-waterdrop', 'Pool'),
			new CMAmenity('main-pool', 'Main Pool', 'ion-waterdrop', 'Pool'),
			new CMAmenity('movie-screen', 'Movie Screen', 'ion-ios7-film-outline', 'Entertainment'),
			new CMAmenity('h2o-zone', 'H2O Zone', 'ion-waterdrop', 'Pool'),
			new CMAmenity('whirlpools-h2o-zone', 'Whirlpools (H2O Zone)', 'ion-waterdrop', 'Pool'),
			new CMAmenity('squeeze', 'Squeeze', undefined, 'Dining'),
			new CMAmenity('seatrek-dive-shop', 'Seatrek Dive Shop', 'ion-earth', 'Ship Services'),
			new CMAmenity('chops-grille', 'Chops Grille', 'ion-fork', 'Dining'),
			new CMAmenity('giovannis-table', "Giovanni's Table", 'ion-fork', 'Dining'),
			new CMAmenity('the-plaza-bar', 'The Plaza Bar', 'ion-wineglass', 'Bar'),
			new CMAmenity('windjammer-cafe', 'Windjammer Café', 'ion-coffee', 'Dining')
		]),
		12: new CMDeck(12, [
			new CMAmenity('vitality-at-sea', 'Vitality at Sea Spa and Fitness Center', undefined, 'Fitness'),
			new CMAmenity('bar', 'Bar', 'ion-wineglass', 'Bar'),
			new CMAmenity('jogging-track', 'Jogging Track', undefined, 'Fitness'),
			new CMAmenity('nursery', 'Nursery', undefined, 'Ship Services'),
			new CMAmenity('the-living-room', 'The Living Room', undefined, 'Ship Services'),
			new CMAmenity('video-arcade', 'Video Arcade', 'ion-game-controller-b', 'Entertainment'),
			new CMAmenity('adventure-ocean', 'Adventure Ocean', undefined, 'Ship Services'),
			new CMAmenity('johnny-rockets', 'Johnny Rockets', 'ion-fork', 'Dining'),
			new CMAmenity('fuel-teen-club', 'Fuel Teen Club', undefined, 'Entertainment')
		]),
		13: new CMDeck(13, [
			new CMAmenity('rock-climbing-wall', 'Rock Climbing Wall', undefined, 'Fitness'),
			new CMAmenity('sports-court', 'Sports Court', undefined, 'Fitness'),
			new CMAmenity('golf-simulator', 'Golf Simulator', undefined, 'Fitness'),
			new CMAmenity('independence-dunes', 'Independence Dunes', undefined, 'Entertainment'),
			new CMAmenity('wipe-out', 'Wipe Out!', 'ion-wineglass', 'Bar'),
			new CMAmenity('flowrider', 'Flowrider', 'ion-waterdrop', 'Pool')
		]),
		14: new CMDeck(14, [
			new CMAmenity('olive-or-twist', 'Olive or Twist', 'ion-wineglass', 'Bar'),
			new CMAmenity('cloud-nine', 'Cloud Nine'),
			new CMAmenity('diamond-club', 'Diamond Club'),
			new CMAmenity('viking-crown-lounge', 'Viking Crown Lounge'),
			new CMAmenity('seven-hearts', 'Seven Hearts')
		]),
		15: new CMDeck(15, [
			new CMAmenity('skylight-chapel', 'Skylight Chapel')
		])
	};

	angular.module('cruisemonkey.Decks', ['cruisemonkey.Logging'])
	.factory('DeckService', ['LoggingService', function(log) {
		log.info('DeckService: Initializing DeckService.');

		return {
			'get': function() {
				return _deckInfo;
			},
			'getAmenities': function() {
				var amenities = [];
				angular.forEach(_deckInfo, function(deck, index) {
					angular.forEach(deck.getAmenities(), function(amenity, index) {
						amenities.push(amenity);
					});
				});
				return amenities;
			}
		};
	}]);
}());
