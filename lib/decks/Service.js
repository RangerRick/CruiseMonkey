'use strict';

/* eslint-disable quotes */

var model = require('../data/Model');

var CMDeck = model.CMDeck;
var CMAmenity = model.CMAmenity;

(function() {
	var _deckInfo = {
		2: new CMDeck(2, [
			new CMAmenity('arcadia-theatre', 'Arcadia Theatre', 'ion-music-note', 'Entertainment', 'Spanning three decks, the Arcadia Theatre holds 1,320 people.'),
			new CMAmenity('conference-center', 'Conference Center', 'ion-printer', 'Business', 'Comfortable conference center featuring state-of-the-art presentation equipment and a variety of meeting rooms.'),
			new CMAmenity('studio-b', 'Studio B and Ice Rink (Entrance on Deck 3)', 'ion-music-note', 'Entertainment', 'Features open skating for guests throughout each cruise, plus excellent ice shows featuring professional skaters from all over the world.')
		]),
		3: new CMDeck(3, [
			new CMAmenity('arcadia-theatre', 'Arcadia Theatre', 'ion-music-note', 'Entertainment', 'Spanning three decks, the Arcadia Theatre holds 1,320 people.'),
			new CMAmenity('studio-b', 'Studio B and Ice Rink (Entrance on Deck 3)', 'ion-music-note', 'Entertainment', 'Features open skating for guests throughout each cruise, plus excellent ice shows featuring professional skaters from all over the world.'),
			new CMAmenity('on-air-club', 'On Air Club', 'ion-mic-b', 'Entertainment', 'Just outside of the Studio B ice rink complex is the On the Air Club. Equipped with television screens, this venue shows sports games and events.'),
			//new CMAmenity('centrum', 'Centrum', 'ion-help-buoy', 'Ship Services', 'A seven-story atrium surrounded by bars, lounges, and unique shops. Best compared to the lobby of a grand hotel.'),
			new CMAmenity('rctv', 'RCTV', 'ion-ios-videocam', 'Entertainment', "RCTV is the ship's television production operation. The television control can be seen outside of Studio B. The entertainment staff make use of the television facilities producing shows and recording events that are seen on the in-cabin television."),
			new CMAmenity('art-gallery', 'Art Gallery', 'ion-images', 'Shopping', 'Original art is displayed in the onboard art gallery as well as throughout the ship. To purchase something for your own collection, visit an onboard art auction.'),
			//new CMAmenity('anthony-and-cleopatra', 'Anthony and Cleopatra', 'ion-fork', 'Dining', 'The main dining room.'),
			//new CMAmenity('othello', 'Othello', 'ion-fork', 'Dining', 'The main dining room.'),
			new CMAmenity('leonardo-dining-room', 'Leonardo Dining Room', 'ion-fork', 'Dining', 'The main dining room.')
		]),
		4: new CMDeck(4, [
			new CMAmenity('arcadia-theatre', 'Arcadia Theatre', 'ion-music-note', 'Entertainment', 'Spanning three decks, the Arcadia Theatre holds 1,320 people.'),
			new CMAmenity('schooner-bar', 'Schooner Bar', 'ion-wineglass', 'Bar', 'During the day and early evening, it is the scene for trivia contests and similar activities.  In the evenings, it becomes a piano bar.'),
			new CMAmenity('sabor', 'Sabor Modern Mexican', 'ion-fork', 'Dining', 'Sabor: in Spanish, it means flavor, but here, it\'s that and so much more.  A feast &mdash; <i>or shall we say fiesta</i> &mdash; for the eyes.  A vibrant dance across the plate and palate.  A long heritage of fresh, simple ingredients, reimagined in full bloom.'),
			new CMAmenity('casino-royale', 'Casino Royale', 'cm-dice', 'Casino', 'Casino Royale can accommodate about 450 people and is equipped with gaming tables, slot machines, electronic gaming and its own bar.  Named after the Ian Fleming novel that began the James Bond series, two murals of the stars of the James Bond movies in character flank  the main entrance to the casino.'),
			new CMAmenity('photo-gallery-and-shop', 'Photo Gallery and Shop', 'ion-images', 'Shopping', 'The Photo Gallery and Shop on deck 4 by the atrium is where guests can visit to view professional photographs of their experiences onboard. In addition the latest cameras and accessories are available to purchase along with a digital studio allowing passengers to download and print images from their digital cameras.'),
			new CMAmenity('centrum', 'Centrum', 'ion-help-buoy', 'Ship Services', 'A seven-story atrium surrounded by bars, lounges, and unique shops. Best compared to the lobby of a grand hotel.'),
			new CMAmenity('boleros-lounge', 'Boleros Lounge', 'ion-wineglass', 'Bar', 'The 77-seat Boleros Lounge on deck 4 is situated around the atrium and is Freedom\'s Latin Bar. With windows overlooking the promenade deck and its own stage and dance floor, entertainment ranges from live bands playing salsa music making it the ideal night time hotspot to dance the night away in with a refreshing mango mojito or caipirinha.  Classical music is also played at this venue and it is ideally situated for pre dinner drinks before heading off to the main dining rooms.'),
			new CMAmenity('isaac-dining-room', 'Isaac Dining Room', 'ion-fork', 'Dining', 'The main dining room.')
		]),
		5: new CMDeck(5, [
			new CMAmenity('star-lounge', 'Star Lounge', 'ion-wineglass', 'Bar', 'At the forward end of Deck Five is the Star Lounge.  It has a bar, a stage and a dance floor.  In addition to music and dancing, it is used in the evening for seagoing versions of television game shows and for similar activities.'),
			new CMAmenity('connoisseur-club', 'Connoisseur Club', 'ion-wineglass', 'Bar', 'Just past the forward atrium on Deck Five is The Connoisseur Cigar Club where guests can light up with a cognac or other drink.'),
			new CMAmenity('sorrentos', "Sorrento's", 'ion-fork', 'Dining', 'When you find yourself craving pizza, drop by Sorrento\'s for a piping hot slice.'),
			new CMAmenity('promenade-shops', 'Royal Promenade', 'ion-bag', 'Shopping', 'This mall, a naturally lighted four-story area lined with bars and shops, is the heartbeat of the ship.'),
			new CMAmenity('bull-and-bear-pub', 'Bull and Bear Pub', 'ion-beer', 'Dining', 'An English-themed pub that serves various imported beers and ales.'),
			new CMAmenity('vintages', 'Vintages', 'ion-wineglass', 'Bar', 'Further forward on the Royal Promenade is Vintages Wine Bar. It not only functions as a wine bar but is also the scene of wine tasting classes.'),
			new CMAmenity('ice-cream-parlor', 'Ice Cream Parlor', 'ion-icecream', 'Dining', 'Stop by Ben & Jerry\'s Ice Cream Parlor for cool treats in a rotating selection of fabulous flavors.'),
			new CMAmenity('cupcake-cupboard', 'Cupcake Cupboard', 'ion-icecream', 'Dining', 'Sprinkle some sweetness into your cruise at this adorable 1940s style shop featuring fresh-baked gourmet cupcakes.'),
			new CMAmenity('cafe-promenade', 'Café Promenade', 'ion-coffee', 'Dining', 'Café Promenade perhaps not surprisingly is on the Royal Promenade and is open 24 hours for snacks including sandwiches and cookies.'),
			new CMAmenity('next-cruise', 'Next Cruise', 'ion-help-buoy', 'Ship Services', 'The spirited works of iconic pop artist Romero Britto saturate this engaging and interactive space, where shoppers may peruse a wide array of artwork, giftware, collectibles and luggage, including limited edition custom works created by Britto exclusively for Royal Caribbean guests.'),
			new CMAmenity('shore-excursions', 'Shore Excursions', 'ion-help-buoy', 'Ship Services', 'Explore every port-of-call with Explorations!&reg; shore excursions, the best way to have fun outside the ship. Stop by the Shore Excursions desk to book or for more details.'),
			new CMAmenity('guest-services', 'Guest Services', 'ion-help-buoy', 'Ship Services', 'The place to go for general ship information, to report lost or damaged goods, to exchange money or cash traveler\'s checks.'),
			new CMAmenity('r-bar', 'R Bar', 'ion-wineglass', 'Bar', 'Experience a 1960s vibe at the all-new R Bar, featuring iconic furnishings and classic cocktails &mdash; gimlet, martini, gin, whiskeys and more &mdash; all served by the ship\'s resident mixologist.'),
			new CMAmenity('galileo-dining-room', 'Galileo Dining Room', 'ion-fork', 'Dining', 'The main dining room.')
		]),
		6: new CMDeck(6, [
			new CMAmenity('royal-promenade', 'Royal Promenade (Overlook)', 'ion-bag', 'Shopping', 'This mall, a naturally lighted four-story area lined with bars and shops, is the heartbeat of the ship.'),
			new CMAmenity('loyalty-ambassador-desk', 'Loyalty Ambassador Desk', 'ion-printer', 'Business', 'Crown & Anchor Society loyalty program information.')
		]),
		7: new CMDeck(7, [
			new CMAmenity('royal-promenade', 'Royal Promenade (Overlook)', 'ion-bag', 'Shopping', 'This mall, a naturally lighted four-story area lined with bars and shops, is the heartbeat of the ship.'),
			new CMAmenity('library', 'Library', 'ion-ios-book', 'Ship Services', 'Our onboard library features comfortable reading chairs as well as an impressive selection of books and guidebooks.')
		]),
		8: new CMDeck(8, [
			new CMAmenity('royal-promenade', 'Royal Promenade (Overlook)', 'ion-bag', 'Shopping', 'This mall, a naturally lighted four-story area lined with bars and shops, is the heartbeat of the ship.'),
			new CMAmenity('rc-online', 'RC Online', 'ion-printer', 'Business', 'It\'s high tech on the high seas! With royalcaribbean online, for a small fee you can access the Internet, send e-mails or send your family an e-postcard with your picture in it.')
		]),
		10: new CMDeck(10, [
			new CMAmenity('concierge-club', 'Concierge Club', 'ion-help-buoy', 'Ship Services', 'Guests staying in Grand Suite-level rooms and higher, Diamond Plus and Pinnacle Club Crown and Anchor Socierty members enjoy access to this lounge serving complimentary breakfast and evening drinks.')
		]),
		11: new CMDeck(11, [
			new CMAmenity('vitality-at-sea', 'Vitality at Sea Spa and Fitness Center', 'ion-leaf', 'Fitness', 'Seaside fitness center featuring modern exercise equipment. The full-service spa offers a beauty salon and spa treatments, including massage, manicures and seaweed body wraps.'),
			new CMAmenity('solarium', 'Solarium', 'ion-waterdrop', 'Pool', 'This is an adults-only area with a serene atmosphere.  In addition to the pool, it features better quality loungers and furniture.'),
			new CMAmenity('whirlpools-fore', 'Whirlpools (Fore)', 'ion-waterdrop', 'Pool', 'Two large whirlpools that are cantelevered over the sides of the ship.'),
			new CMAmenity('pool-bar', 'Pool Bar', 'ion-wineglass', 'Bar'),
			new CMAmenity('whirlpools-main', 'Whirlpools (Main Pool)', 'ion-waterdrop', 'Pool'),
			new CMAmenity('main-pool', 'Main Pool', 'ion-waterdrop', 'Pool', 'Full of water, the main pool is describable.'),
			new CMAmenity('sports-pool', 'Sports Pool', 'ion-waterdrop', 'Pool', 'Challenge yourself, or other guests, in a variety of water sports, from pool volleyball and floating golf to pole jousting. And when the sports pool isn\'t being used for organized activities, get your blood pumping by swimming laps.'),
			new CMAmenity('movie-screen', 'Movie Screen', 'ion-ios-film-outline', 'Entertainment', 'Watch first-run movies and big time sporting events the way they were meant to be seen - poolside, under the stars. A screen hoisted above the main pool area will showcase all the larger-than-life action.'),
			new CMAmenity('h2o-zone', 'H2O Zone', 'ion-waterdrop', 'Pool', 'Geared toward children, the H2O features water spray cannons, umbrella jets, ground gushers, waterfalls and brightly colored sculptures.'),
			new CMAmenity('whirlpools-h2o-zone', 'Whirlpools (H2O Zone)', 'ion-waterdrop', 'Pool'),
			new CMAmenity('squeeze', 'Squeeze', undefined, 'Dining', 'Squeeze features smoothies and juice drinks.'),
			new CMAmenity('seatrek-dive-shop', 'Seatrek Dive Shop', 'ion-earth', 'Ship Services', 'Visit the SeaTrek emporium for water gear and souvenirs.'),
			new CMAmenity('chops-grille', 'Chops Grille', 'ion-fork', 'Dining', 'Elegant and upscale, this "reservation-only" restaurant is the place to go when you\'re hungry for the perfect steak.'),
			new CMAmenity('giovannis-table', "Giovanni's Table", 'ion-fork', 'Dining', 'Your very first bite at this classic Italian restaurant will instantly transport you to the Tuscan coastline.'),
			new CMAmenity('the-plaza-bar', 'The Plaza Bar', 'ion-wineglass', 'Bar', 'The Plaza Bar opens from 7.00am in the morning for Speciality Coffee and Fresh Juice (normal bar charges apply). Located aft of deck 11 it also specialises in Sake and different types of tea and seats 50 guests.'),
			new CMAmenity('windjammer-cafe', 'Windjammer Café', 'ion-fork', 'Dining', 'The Windjammer Café buffet is located on deck eleven to the aft of the ship and offers panoramic views over the ships stern. This is also where you can find Jade, an Asian-inspired buffet venue.')
		]),
		12: new CMDeck(12, [
			new CMAmenity('vitality-at-sea', 'Vitality at Sea Spa and Fitness Center', 'ion-leaf', 'Fitness', 'Seaside fitness center featuring modern exercise equipment. The full-service spa offers a beauty salon and spa treatments, including massage, manicures and seaweed body wraps.'),
			new CMAmenity('sky-bar', 'Bar', 'ion-wineglass', 'Sky Bar'),
			new CMAmenity('running-track', 'Running Track', undefined, 'Fitness', 'Run laps while taking in the view. Our tracks are open to anyone and proper shoes are recommended.'),
			new CMAmenity('nursery', 'Royal Babies and Tots&reg; Nursery', 'ion-android-contacts', 'Ship Services', 'Parents love our new colorful nursery where our littlest guests can be left in the care of our trained professionals, to enjoy specially-designed programming and playgroups.'),
			new CMAmenity('the-living-room', 'The Living Room', 'ion-android-contacts', 'Ship Services', 'A laid-back place for teens to hang out with new friends.'),
			new CMAmenity('video-arcade', 'Video Arcade', 'ion-ios-game-controller-b', 'Entertainment', 'Filled with video games for kids and adults.'),
			new CMAmenity('adventure-ocean', 'Adventure Ocean&reg;', 'ion-android-contacts', 'Ship Services', 'Adventure Ocean&reg; is a play area with specially designed activities for kids ages 3-17. It is run by exceptional, energetic, college-educated staff.'),
			new CMAmenity('johnny-rockets', 'Johnny Rockets', 'ion-fork', 'Dining', 'Johnny Rockets has become famous for its simple menu of burgers, fries and milk shakes combined with a 1950s décor and for many years now, Royal Caribbean has offered passengers the chance to experience Johnny Rockets at sea aboard a few of their cruise ships.'),
			new CMAmenity('fuel-teen-disco', 'Fuel Teen Disco', 'ion-android-contacts', 'Entertainment', 'A teens-only club where they can hang out, make new friends, and dance to the latest music.')
		]),
		13: new CMDeck(13, [
			new CMAmenity('rock-climbing-wall', 'Rock Climbing Wall', undefined, 'Fitness', 'This is the largest of the Royal Caribbean rock-climbing walls: a 43-foot-tall by 44-foot-wide freestanding wall with a central spire. Plus, with eleven different routes to choose from, this rock-climbing wall offers skill combinations for all levels.'),
			new CMAmenity('sports-court', 'Sports Court', undefined, 'Fitness', 'The outdoor sports deck includes an outdoor full-size court for sports, including basketball and volleyball.'),
			new CMAmenity('golf-simulator', 'Golf Simulator', undefined, 'Fitness', 'Not so fast, it says "Simulator", not "Stimulator".'),
			new CMAmenity('freedom-fairways', 'Freedom Fairways', undefined, 'Entertainment', 'This 9-hole miniature golf course will challenge and entertain adults and children alike.'),
			new CMAmenity('wipe-out', 'Wipe Out!', 'ion-wineglass', 'Bar', 'Adjacent to the FlowRider is the Wipe Out! bar where guests can pick up refreshments or just sit and people watch.'),
			new CMAmenity('flowrider', 'Flowrider', 'ion-waterdrop', 'Pool', 'The FlowRider throws out perfect six foot waves at thirty five miles per hour in a completely controlled, man made environment.')
		]),
		14: new CMDeck(14, [
			new CMAmenity('olive-or-twist', 'Olive or Twist', 'ion-wineglass', 'Bar', 'The majority of the Viking Crown Lounge is dedicated to the 45 guest capacity Olive or Twist, an ideal venue for sweeping views and live music and dancing.'),
			new CMAmenity('cloud-nine', 'Cloud Nine', undefined, undefined, 'Port side forward are the 24 guest capacity Cloud Nine, which is a multi function private meeting or party room.'),
			new CMAmenity('diamond-club', 'Diamond Club', undefined, undefined, 'A private concierge lounge only accessible by key card.'),
			new CMAmenity('viking-crown-lounge', 'Viking Crown Lounge', undefined, undefined, 'The Viking Crown Lounge made its debut in 1970 on Royal Caribbean\'s first new ship, Song of Norway, dramatically clinging to the exterior of the smokestack.  To this day, the Viking Crown Lounge still occupies one of the topmost decks of Royal Caribbean ships and continues to be one of many trademarks.'),
			new CMAmenity('seven-hearts', 'Seven Hearts', undefined, undefined, 'A 33-guest capacity card room.')
		]),
		15: new CMDeck(15, [
			new CMAmenity('skylight-chapel', 'Skylight Chapel', undefined, undefined, 'The wedding chapel, which can accommodate 40 people, is located on top of the Viking Crown Lounge® (the highest point on the ship) and is the perfect place to say "I do."')
		])
	};

	var angular = require('angular');

	angular.module('cruisemonkey.Decks', [])
	.factory('DeckService', function($log) {
		$log.info('DeckService: Initializing DeckService.');

		return {
			get: function() {
				return _deckInfo;
			},
			getAmenities: function() {
				var amenities = [];
				angular.forEach(_deckInfo, function(deck, index) {
					amenities.push(deck);
					angular.forEach(deck.getAmenities(), function(amenity, index) {
						amenities.push(amenity);
					});
				});
				return amenities;
			}
		};
	});
}());

/* eslint-enable quotes */