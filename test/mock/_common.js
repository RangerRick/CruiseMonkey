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

var defaultEventDocs = [
	{
		'_id': 'event:official-event',
		'type': 'event',
		'username': 'official',
		'summary': 'official event',
		'start': '2012-01-01 00:00',
		'isPublic': true
	},
	{
		'_id': 'event:rangerrick-public',
		'type': 'event',
		'username': 'rangerrick',
		'summary': 'rangerrick public event',
		'start': '2013-01-01 00:00',
		'isPublic': true
	},
	{
		'_id': 'event:rangerrick-private',
		'type': 'event',
		'username': 'rangerrick',
		'summary': 'rangerrick private event',
		'start': '2013-01-02 00:00',
		'isPublic': false
	},
	{
		'_id': 'event:triluna-public',
		'type': 'event',
		'username': 'triluna',
		'summary': 'triluna public event',
		'start': '2013-02-01 00:00',
		'isPublic': true
	},
	{
		'_id': 'event:triluna-private',
		'type': 'event',
		'username': 'triluna',
		'summary': 'triluna private event',
		'start': '2013-02-02 00:00',
		'isPublic': false
	}
];

var defaultFavoriteDocs = [
	{
		'_id': 'favorite:triluna:event:rangerrick-public',
		'type': 'favorite',
		'username': 'triluna',
		'eventId': 'event:rangerrick-public'
	},
	{
		'_id': 'favorite:rangerrick:event:official-event',
		'type': 'favorite',
		'username': 'rangerrick',
		'eventId': 'event:official-event'
	}
];

var defaultDocs = defaultEventDocs.concat(defaultFavoriteDocs);

var eventsDb    = 'http://localhost:5984/test-events',
	favoritesDb = 'http://localhost:5984/test-favorites',
	pristineDb  = 'http://localhost:5984/test-pristine',
	remoteDb    = 'http://localhost:5984/test-db';

var doDbSetup = function(done) {
	var eventsDatabase    = new PouchDB(eventsDb);
	var favoritesDatabase = new PouchDB(favoritesDb);
	var pristineDatabase  = new PouchDB(pristineDb);
	var remoteDatabase    = new PouchDB(remoteDb);

	eventsDatabase.destroy(function(err,info) {
		if (err) {
			console.log(eventsDb + ' NOT destroyed:', err);
			done();
			return;
		}

		//console.log('eventsDatabase destroyed:',info);
		favoritesDatabase.destroy(function(err,info) {
			if (err) {
				console.log(favoritesDb + ' NOT destroyed:', err);
				done();
				return;
			}

			//console.log('favoritesDatabase destroyed:',info);
			remoteDatabase.destroy(function(err,info) {
				if (err) {
					console.log(remoteDb + ' NOT destroyed:', err);
					done();
					return;
				}
				
				//console.log('remoteDatabase destroyed:',info);

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
	});
};

var webroot = 'http://localhost:5984/';

var checkCouch = function() {
	var deferred = $q.defer();

	$http({method: 'GET', url: 'http://localhost:5984/test-pristine'}).success(function(data) {
		if (data['db_name'] === 'test-pristine') {
			deferred.resolve();
		} else {
			console.debug('received a "success" response, but could not get a db name');
			deferred.reject();
		}
	}).error(function() {
		deferred.reject();
	});

	return deferred.promise;
};