var LoggedInUserService = function() {
	var user = {
		loggedIn: true,
		'username': 'ranger',
		'password': 'secret'
	};
	
	this.$get = function() {
		return {
			isLoggedIn: function() {
				return user.loggedIn;
			},
			get: function() {
				return angular.copy(user);
			},
			save: function(newUser) {
				user = angular.copy(newUser);
			}
		};
	};
};

var MockPouchWrapper = function() {
	var events = [
		{
			'_id': '1',
			'type': 'event',
			'createdBy': 'official',
			'summary': 'Murder',
			'description': 'You will be murdered.'
		},
		{
			'_id': '2',
			'type': 'event',
			'createdBy': 'ranger',
			'summary': 'Dying',
			'description': 'I will be dying.'
		},
		{
			'_id': '3',
			'type': 'event',
			'createdBy': 'bob',
			'summary': 'Living',
			'description': 'I am totally going to continue living.'
		}
	];
	
	var favorites = [ '1' ];

	this.$get = function() {
		return {
			getEvents: function() {
				return events;
			},
			getFavorites: function() {
				return favorites;
			},
			getEventList: function() {
				var e = [];
				angular.forEach(events, function(event) {
					var userEvent = {
						'event': event,
						'isFavorite': (favorites !== undefined && favorites.indexOf(event._id) != -1)
					};
				});
			}
		}
	};
};