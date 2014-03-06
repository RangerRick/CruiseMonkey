var isMobile = false;

if (typeof String.prototype.capitalize !== 'function') {
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
	};
}
if (typeof String.prototype.startsWith !== 'function') {
	String.prototype.startsWith = function(str) {
		return this.lastIndexOf(str, 0) === 0;
	};
}
if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}
if (typeof String.prototype.contains !== 'function') {
	String.prototype.contains = function(comparator) {
		return comparator === undefined? true : (this.toLowerCase().indexOf(comparator.toLowerCase()) > -1);
	};
}

var LoggedInUserService = function() {
	var user = {
		loggedIn: true,
		'username': 'rangerrick',
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

var defaultDocs = [
	{
		'_id': 'official-event',
		'type': 'event',
		'username': 'official',
		'summary': 'official event',
		'start': '2012-01-01 00:00',
		'isPublic': true
	},
	{
		'_id': 'rangerrick-public',
		'type': 'event',
		'username': 'rangerrick',
		'summary': 'rangerrick public event',
		'start': '2013-01-01 00:00',
		'isPublic': true
	},
	{
		'_id': 'rangerrick-private',
		'type': 'event',
		'username': 'rangerrick',
		'summary': 'rangerrick private event',
		'start': '2013-01-02 00:00',
		'isPublic': false
	},
	{
		'_id': 'triluna-public',
		'type': 'event',
		'username': 'triluna',
		'summary': 'triluna public event',
		'start': '2013-02-01 00:00',
		'isPublic': true
	},
	{
		'_id': 'triluna-private',
		'type': 'event',
		'username': 'triluna',
		'summary': 'triluna private event',
		'start': '2013-02-02 00:00',
		'isPublic': false
	},
	{
		'_id': 'triluna:rangerrick-public',
		'type': 'favorite',
		'username': 'triluna',
		'eventId': 'rangerrick-public'
	},
	{
		'_id': 'rangerrick:official-event',
		'type': 'favorite',
		'username': 'rangerrick',
		'eventId': 'official-event'
	}
];

var userDb     = 'http://localhost:5984/test-userdb',
	pristineDb = 'http://localhost:5984/test-pristine',
	remoteDb   = 'http://localhost:5984/test-db';

var doDbSetup = function(userDb, pristineDb, remoteDb, done) {
	var userDatabase = new PouchDB(userDb);
	var pristineDatabase = new PouchDB(pristineDb);
	var remoteDatabase = new PouchDB(remoteDb);
	userDatabase.destroy(function(err, info) {
		if (err) {
			console.log(userDb + ' NOT destroyed:', err);
			return;
		}
		//console.log(userDb + ' destroyed');

		remoteDatabase.destroy(function(err, info) {
			if (err) {
				console.log(remoteDb + ' NOT destroyed:',err);
				return;
			}
			//console.log(remoteDb + ' destroyed');

			remoteDatabase = new PouchDB(remoteDb);
			remoteDatabase.replicate.from(pristineDatabase, {
				continuous: false,
				complete: function() {
					//console.log('finished replicating ' + pristineDb + ' to ' + remoteDb);
					remoteDatabase.bulkDocs({
						docs: defaultDocs
					}, function(err, res) {
						if (err) {
							console.log('error bulk-adding docs:',err);
						} else {
							//console.log('finished bulk-adding docs to ' + remoteDb);
							done();
						}
					});
				}
			});
		});
	});
};
