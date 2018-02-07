'use strict';

/* eslint-disable quotes */

var model = require('../data/Model');

var CMDeck = model.CMDeck;
var CMAmenity = model.CMAmenity;

(function() {
	var _deckInfo = {
		1: new CMDeck(1, [
			new CMAmenity('deck-1-mainstage', 'The Mainstage', 'ion-music-note', 'Entertainment', 'The main stage is three levels.'),
			new CMAmenity('deck-1-atrium', 'The Atrium', 'ion-help-buoy', 'Ship Services', 'The grand atrium is adorned with glittering glass, brass accents, and a crystal chandelier.'),
			new CMAmenity('deck-1-future-cruises', 'Future Cruises', 'ion-help-buoy', 'Ship Services', 'Assistance in booking future cruises with Holland America.'),
			new CMAmenity('deck-1-guest-services', 'Guest Services', 'ion-help-buoy', 'Ship Services', 'The place to go for general ship information, to report lost or damaged goods, to exchange money or cash traveler\'s checks.'),
			new CMAmenity('deck-1-shore-excursions', 'Shore Excursions', 'ion-help-buoy', 'Ship Services', 'Stop by the shore excursions desk to book or get more details on available excursions.')
		]),
		2: new CMDeck(2, [
			new CMAmenity('deck-2-mainstage', 'The Mainstage', 'ion-music-note', 'Entertainment', 'The main stage is three levels.'),
			new CMAmenity('deck-2-billboard-onboard', 'Billboard Onboard', 'ion-music-node', 'Entertainment', 'A smaller live music stage themed around 50 years of rock and roll.'),
			/*
			new CMAmenity('deck-2-piano-bar', 'Piano Bar', 'ion-wineglass', 'Bar', 'Here, guests can sit at a counter surrounding the pianist or nearby, and have a drink.'),
			new CMAmenity('deck-2-sports-bar', 'Sports Bar', 'ion-ios-americanfootball', 'Bar', 'A meeting place for sports enthusiasts.  It features several television screens for game viewing.'),
			*/
			new CMAmenity('deck-2-casino', 'Casino', 'cm-dice', 'Casino', 'The Westerdam casino, featuring bingo, slots, blackjack, craps, roulette, and Texas Hold\'em.'),
			//new CMAmenity('deck-2-northern-lights', 'Northern Lights Nightclub', 'ion-music-note', 'Entertainment', 'Westerdam\'s disco nightclub.'),
			new CMAmenity('deck-2-gallery-bar', 'Gallery Bar', 'ion-wineglass', 'Bar', 'A cocktail bar with a menu created by Master Mixologist Dale DeGroff.'),
			//new CMAmenity('deck-2-queens-lounge', 'Queen\s Lounge and Culinary Arts Center', 'ion-fork', 'Entertainment', 'A multi-purpose entertainment venue for music and cooking demonstrations.'),
			new CMAmenity('deck-2-blues-club', 'B.B. King\'s Blues Club & America\'s Test Kitchen', 'ion-fork', 'Entertainment', 'A multi-purpose entertainment venue for music and cooking demonstrations.'),
			new CMAmenity('deck-2-atrium', 'The Atrium', 'ion-help-buoy', 'Ship Services', 'The grand atrium is adorned with glittering glass, brass accents, and a crystal chandelier.'),
			new CMAmenity('deck-2-pinnacle-grill', 'Pinnacle Grill', 'ion-fork', 'Dining', 'Refined and luxurious, the Pinnacle Grill represents the pinnacle of exceptional dining. Creative, innovative menus featuring choice sustainability raised beef and premium seafood delight the palate.'),
			new CMAmenity('deck-2-pinnacle-bar', 'Pinnacle Bar', 'ion-wineglass', 'Bar', 'Adjacent to the Pinnacle Grill, this is a convenient place to get pre-dinner drinks.'),
			new CMAmenity('deck-2-art-gallery', 'Art Gallery', 'ion-images', 'Shopping', 'The Westerdam has a dedicated art gallery in which pieces are displayed and guests can preview works prior to auctions.'),
			new CMAmenity('deck-2-lincoln-center-stage', 'Lincoln Center Stage', 'ion-music-note', 'Entertainment', 'In an exclusive partnership with the world\'s leading center for the performing arts, Lincoln Center Stage showcases outstanding live chamber music performances.'),
			new CMAmenity('deck-2-explorers-lounge', 'Explorer\'s Lounge', 'ion-wineglass', 'Bar', 'A convenient spot for before or after dinner cocktails.  There is often classical music being played by a trio or a pianist.'),
			new CMAmenity('deck-2-dining-room', 'The Dining Room', 'ion-fork', 'Dining', 'The main dining room.')
		]),
		3: new CMDeck(3, [
			new CMAmenity('deck-3-mainstage', 'The Mainstage', 'ion-music-note', 'Entertainment', 'The main stage is three levels.'),
			new CMAmenity('deck-3-screening-room', 'Screening Room', 'cm-icon-film', 'Entertainment', 'An ultra-plush 36-seat movie theater screening first-run films and special presentations.'),
			new CMAmenity('deck-3-shops', 'Shopping Arcade', 'ion-bag', 'Shopping', 'Occupying a large expanse on Deck 3 are the Shops. Looking more like a department store than a separate series of shops, this area houses a wide range of items including duty-free items, souvenirs, jewelry, watches and clothing.'),
			new CMAmenity('deck-3-merabella-shop', 'Merabella Luxury Collection', 'ion-bag', 'Shopping', 'Find one-of-a-kind treasures at Merabella, a luxury jewelry boutique featuring high-end watches and pieces from noted designers.'),
			new CMAmenity('deck-3-digital-workshop', 'Digital Workshop', 'ion-monitor', 'Ship Services', 'Learn how to display and share their vacation memories in free Digital Workshop classes.'),
			new CMAmenity('deck-3-ocean-bar', 'Ocean Bar', 'ion-wineglass', 'Bar', 'Surrounding the atrium on Promenade Deck, The Ocean Bar has a small stage and dance floor.'),
			new CMAmenity('deck-3-atrium', 'The Atrium', 'ion-help-buoy', 'Ship Services', 'The grand atrium is adorned with glittering glass, brass accents, and a crystal chandelier.'),
			new CMAmenity('deck-3-photo-gallery', 'Photo Gallery', 'ion-images', 'Shopping', 'In addition to offering souvenir photos taken by the ship\'s photographers, Westerdam has a portrait studio that seeks to create artistic photos of the sitters.'),
			new CMAmenity('deck-3-dining-room', 'The Dining Room', 'ion-fork', 'Dining', 'The main dining room.')
		]),
		7: new CMDeck(7, [
			new CMAmenity('deck-7-neptune-lounge', 'Neptune Lounge', 'ion-help-buoy', 'Ship Services', 'Guests choosing Pinnacle and Neptune suites enjoy access to a private lounge and the services of a personal concierge for organizing spa, dining and shore arrangements.')
		]),
		9: new CMDeck(9, [
			new CMAmenity('deck-9-fitness-center', 'Fitness Center', 'ion-android-bicycle', 'Fitness', 'Run on a treadmill overlooking the ship\'s bow, use the spinning machines and the resistance training machines or participate in classes in the aerobics area.'),
			new CMAmenity('deck-9-greenhouse-spa', 'The Greenhouse Spa and Salon', 'ion-leaf', 'Fitness', 'The Greenhouse Spa features beauty and wellness rituals including facials and hot stone massages. Amongst its features are a beautiful hyrdrotherapy pool and a thermal suite with ceramic heated chairs and steam rooms.'),
			new CMAmenity('deck-9-lido-pool', 'Lido Pool', 'ion-waterdrop', 'Pool', 'Westerdam\'s main swimming area, The Lido Pool, is protected by a retractable glass roof and has three whirlpools.'),
			new CMAmenity('deck-9-lido-bar', 'Lido Bar', 'ion-wineglass', 'Bar', 'A nice bar near the pool area.'),
			new CMAmenity('deck-9-dive-in', 'Dive In Burger Bar', 'ion-fork', 'Dining', 'The Dive In Burger Bar at the Terrace Grill is located in the Lido Pool area. It offers premium hamburgers and hot dogs.'),
			new CMAmenity('deck-9-canaletto', 'Canaletto Restaurant', 'ion-fork', 'Dining', 'Canaletto is Westerdam\'s informal Italian specialty restaurant.'),
			new CMAmenity('deck-9-lido-market', 'Lido Market', 'ion-fork', 'Dining', 'The Lido Restaurant at the top of the cruise ship offers relaxed dining with a variety of selections, all included in your cruise fare.'),
			new CMAmenity('deck-9-sea-view-bar', 'Sea View Bar', 'ion-wineglass', 'Bar', 'A bar near the sea view pool.'),
			new CMAmenity('deck-9-sea-view-pool', 'Sea View Pool', 'ion-waterdrop', 'Pool', 'A smaller pool near the aft of the ship.')
		]),
		10: new CMDeck(10, [
			new CMAmenity('deck-10-crows-nest', 'Crow\'s Nest', undefined, undefined, 'The Crow\'s Nest Lounge at the top of the ship offers 270 degree panoramic views.  In the evening, it has a small stage and a dance floor.'),
			new CMAmenity('deck-10-explorations-cafe', 'Explorations Café', 'ion-wineglass', 'Bar', 'The Explorations Café was designed with the sophisticated traveler in mind.  It combines a library, Internet center, game area and a specialty coffee bar.'),
			new CMAmenity('deck-10-the-loft', 'The Loft', 'ion-android-contacts', 'Ship Services', 'Designed exclusively for teens to have fun, socialize and hang out with people their own age. It includes a new video editing facility for teens.'),
			new CMAmenity('deck-10-club-hal', 'Club HAL', 'ion-android-contacts', 'Ship Services', 'Club HAL is an area devoted to the youngest passengers, with separate supervised sections for the 3-7 and 8-12 sets, and is open 8 a.m. to 4 p.m. on port days, lunch included.')
		]),
		11: new CMDeck(11, [
			new CMAmenity('deck-11-observation-deck', 'Observation Deck', undefined, undefined, 'The observation deck.'),
			new CMAmenity('deck-11-the-retreat', 'The Retreat', undefined, undefined, 'An outdoor area that is perfect for guests looking for a quieter, more luxurious place to rejuvenate during their cruise.  It includes private cabanas, lounge chairs, sun beds and an exclusive bar.'),
			new CMAmenity('deck-11-basketball-court', 'Basketball Court', 'ion-ios-basketball', 'Fitness', 'The basketball court.')
		])
	};

	angular.module('cruisemonkey.Decks', [])
	.factory('DeckService', function($log) {
		$log.info('DeckService: Initializing DeckService.');

		return {
			get: function() {
				return _deckInfo;
			},
			getAmenities: function() {
				var amenities = [];
				for (var key in _deckInfo) {
					var deck = _deckInfo[key];
					amenities.push(deck);
					amenities = amenities.concat(deck.getAmenities());
				}
				return amenities;
			},
			getAmenity: function(deck, id) {
				deck = parseInt(deck, 10);
				var amenities = _deckInfo[deck].getAmenities();
				for (var i=0, len=amenities.length; i < len; i++) {
					if (amenities[i].getId() === id) {
						return amenities[i];
					}
				}
				return null;
			}
		};
	});
}());

/* eslint-enable quotes */
