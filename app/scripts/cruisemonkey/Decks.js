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
			new CMAmenity('alhambra-theatre', 'Alhambra Theatre', 'ion-music-note', 'Entertainment', 'Spanning three decks, the Alhambra Theatre holds 1,320 people.'),
			new CMAmenity('conference-center', 'Conference Center', 'ion-printer', 'Business', 'Comfortable conference center featuring state-of-the-art presentation equipment and a variety of meeting rooms.'),
			new CMAmenity('studio-b', 'Studio B and Ice Rink (Entrance on Deck 3)', 'ion-music-note', 'Entertainment', 'Features open skating for guests throughout each cruise, plus excellent ice shows featuring professional skaters from all over the world.')
		]),
		3: new CMDeck(3, [
			new CMAmenity('alhambra-theatre', 'Alhambra Theatre', 'ion-music-note', 'Entertainment', 'Spanning three decks, the Alhambra Theatre holds 1,320 people.'),
			new CMAmenity('centrum', 'Centrum', undefined, undefined, 'A seven-story atrium surrounded by bars, lounges, and unique shops. Best compared to the lobby of a grand hotel.'),
			new CMAmenity('studio-b', 'Studio B and Ice Rink (Entrance on Deck 3)', 'ion-music-note', 'Entertainment', 'Features open skating for guests throughout each cruise, plus excellent ice shows featuring professional skaters from all over the world.'),
			new CMAmenity('on-air-club', 'On Air Club', 'ion-mic-b', 'Entertainment', 'Just outside of the Studio B ice rink complex is the On the Air Club. Equipped with television screens, this venue shows sports games and events.'),
			new CMAmenity('rctv', 'RCTV', 'ion-ios7-videocam', 'Entertainment', "RCTV is the ship's television production operation. The television control can be seen outside of Studio B. The entertainment staff make use of the television facilities producing shows and recording events that are seen on the in-cabin television."),
			new CMAmenity('art-gallery', 'Art Gallery', 'ion-images', 'Shopping', 'Original art is displayed in the onboard art gallery as well as throughout the ship. To purchase something for your own collection, visit an onboard art auction.'),
			new CMAmenity('anthony-and-cleopatra', 'Anthony and Cleopatra', 'ion-fork', 'Dining', 'The main dining room.'),
			new CMAmenity('othello', 'Othello', 'ion-fork', 'Dining', 'The main dining room.'),
			new CMAmenity('romeo-and-juliet-dining-room', 'Romeo and Juliet Dining Room', 'ion-fork', 'Dining', 'The main dining room.')
		]),
		4: new CMDeck(4, [
			new CMAmenity('alhambra-theatre', 'Alhambra Theatre', 'ion-music-note', 'Entertainment', 'Spanning three decks, the Alhambra Theatre holds 1,320 people.'),
			new CMAmenity('schooner-bar', 'Schooner Bar', 'ion-wineglass', 'Bar', 'During the day and early evening, it is the scene for trivia contests and similar activities.  In the evenings, it becomes a piano bar.'),
			new CMAmenity('the-raven', 'The Labyrinth (a.k.a The Raven)', 'ion-mic-c', 'Dancing', 'The Labyrinth is a Gothic inspired disco.  It occupies portions of decks three and four and has a bar on each level.  Guests on Deck Four can look down to see the dance floor on Deck Three. At the door, guests are greeted by two stained glass works by Harry Cardcross, "The Raven of the Tower" and "The Raven of the Battle" (left).  Carrying on the Tower of London theme,by the dance floor, there are nearly life size figures of a Beefeater (by Orest Kormashov) and of a mod Beefeaterette.'),
			new CMAmenity('casino-royale', 'Casino Royale', undefined, 'Casino', 'Casino Royale can accommodate about 450 people and is equipped with gaming tables, slot machines, electronic gaming and its own bar.  Named after the Ian Fleming novel that began the James Bond series, two murals of the stars of the James Bond movies in character flank  the main entrance to the casino.'),
			new CMAmenity('photo-gallery-and-shop', 'Photo Gallery and Shop', 'ion-images', 'Shopping', 'The Photo Gallery and Shop on deck 4 by the atrium is where guests can visit to view professional photographs of their experiences onboard. In addition the latest cameras and accessories are available to purchase along with a digital studio allowing passengers to download and print images from their digital cameras.'),
			new CMAmenity('boleros-lounge', 'Boleros Lounge', 'ion-wineglass', 'Bar', 'The 77-seat Boleros Lounge on deck 4 is situated around the atrium and is Independence’s Latin Bar. With windows overlooking the promenade deck and its own stage and dance floor, entertainment ranges from live bands playing salsa music making it the ideal night time hotspot to dance the night away in with a refreshing mango mojito or caipirinha.  Classical music is also played at this venue and it is ideally situated for pre dinner drinks before heading off to the main dining rooms.'),
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
