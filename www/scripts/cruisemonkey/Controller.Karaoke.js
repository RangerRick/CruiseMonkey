(function() {
	'use strict';

	/*global ionic: true*/
	/*global moment: true*/

	var spaces = /\s+/;
	var matchSong = function(artist, song, searchString) {
		var searchFor = searchString.split(spaces), match, s;

		match = true;
		for (s=0; s < searchFor.length; s++) {
			if (artist.contains(searchFor[s])) {
				continue;
			} else if (song.contains(searchFor[s])) {
				continue;
			} else {
				match = false;
				break;
			}
		}
		return match;
	};

	var searchFilter = function(karaokeList, searchString) {
		var entries = [],
			artist, song, matched,
			i, j, s;

		if (searchString === undefined || !searchString) {
			return karaokeList;
		}

		var searchFor = searchString.split(spaces), match;

		for (i=0; i < karaokeList.length; i++) {
			if (matchSong(karaokeList[i][1], karaokeList[i][2], searchString)) {
				entries.push(karaokeList[i]);
			}
		}

		//console.log('returning ' + entries.length + ' entries');
		return entries;
	};

	angular.module('cruisemonkey.controllers.Karaoke', [
		'angularLocalStorage',
		'pasvaz.bindonce'
	])
	.filter('karaokeFilter', function() {
		return searchFilter;
	})
	.controller('CMKaraokeSearchCtrl', ['storage', '$q', '$scope', '$http', '$timeout', '$interval', '$cordovaSQLite', '$ionicLoading', '$ionicScrollDelegate', '_database', 'SettingsService', function(storage, $q, $scope, $http, $timeout, $interval, $cordovaSQLite, $ionicLoading, $ionicScrollDelegate, _database, SettingsService) {
		console.log('Initializing CMKaraokeSearchCtrl');

		storage.bind($scope, 'searchString', {
			'storeName': 'cruisemonkey.karaoke-search'
		});

		storage.bind($scope, 'lastUpdated', {
			'defaultValue': moment().valueOf(),
			'storeName': 'cruisemonkey.karaoke-last-updated'
		});

		var getQuery = function(searchString) {
			var query = 'SELECT id, artist, song FROM karaoke';
			if (searchString) {
				var searchFor = searchString.split(spaces);
				if (searchFor.length > 0) {
					query += ' WHERE';
				}
				for (var i=0; i < searchFor.length; i++) {
					var escaped = searchFor[i].replace('\'', '\\\'').replace('%', '\\%');
					query += ' (artist LIKE \'%' + escaped + '%\' OR song LIKE \'%' + escaped + '%\') AND';
				}
				query = query.replace(/ AND$/, '');
			}
			query += ' ORDER BY artist, song';
			return query;
		};

		var sqlitedb = null;
		var entries = [];
		$scope.entries = [];

		var updateEntries = function() {
			ionic.Platform.ready(function() {
				$scope.$evalAsync(function() {
					if (ionic.Platform.isWebView()) {
						// use SQLite
						console.log('Karaoke.updateEntries: Using SQLite karaoke list.');
						if (sqlitedb) {
							var query = getQuery($scope.searchString);
							console.log('Karaoke.updateEntries: Search query is: ' + query);
							$cordovaSQLite.execute(sqlitedb, query).then(function(res) {
								console.log('Karaoke.updateEntries: got results: ' + res.rows.length);
								var results = [], entry;
								for (var i=0; i < res.rows.length; i++) {
									entry = res.rows.item(i);
									results.push([entry.id, entry.artist, entry.song]);
								}
								$scope.entries = results;
							}, function(err) {
								for (var prop in err) {
									console.log('Karaoke.updateEntries: error selecting: ' + prop + '=' + err[prop]);
								}
							});
						} else {
							console.log('Karaoke.updateEntries: Whups!  Sqlitedb is not set.');
						}
					} else {
						// just pull in the raw js list
						console.log('Karaoke.updateEntries: Using in-memory karaoke list.');
						$scope.entries = searchFilter(entries, $scope.searchString);
					}
				});
			});
		};

		$scope.onSearchChanged = function(searchString) {
			updateEntries();
			var delegate = $ionicScrollDelegate.$getByHandle('karaoke-scroll');
			if (delegate.getScrollPosition().top !== 0) {
				delegate.scrollTop(false);
			}
		};

		$scope.$on('cruisemonkey.database.change', function(ev, db, doc) {
			if (db.name.endsWith('karaoke')) {
				updateEntries();
			}
		});

		var printDbErr = function(message, err) {
			console.log(message);
			for (var prop in err) {
				console.log('  ' + prop + '=' + err[prop]);
			}
		};

		var executeCommands = function(db, c) {
			var commands = c.splice(0);
			var deferred = $q.defer();

			var doCommand = function() {
				if (commands.length === 0) {
					console.log('Karaoke.executeCommands: finished processing.');
					deferred.resolve(true);
				} else {
					var command = commands.shift();
					console.log('Karaoke.executeCommands: executing: ' + command);
					$cordovaSQLite.execute(db, command).then(function(res) {
						doCommand();
					}, function(err) {
						deferred.reject([command, err]);
					});
				}
			};

			doCommand();

			return deferred.promise;
		};

		console.log('Karaoke.loaded: initializing database');

		$http.get('scripts/cruisemonkey/karaoke-list.js').success(function(data, status, headers, config) {
			console.log('Karaoke.loaded: got karaoke list with ' + data.length + ' entries.');
			ionic.Platform.ready(function() {
				$scope.$evalAsync(function() {
					if (ionic.Platform.isWebView()) {
						// we're inside a cordova container, use SQLite
						console.log('Karaoke.loaded: Setting up SQLite database.');
						var db = $cordovaSQLite.openDB({ name: "karaoke", bgType: 0 });
						executeCommands(db, [
							'CREATE TABLE IF NOT EXISTS karaoke (id INTEGER, artist TEXT, song TEXT, UNIQUE(artist, song) ON CONFLICT REPLACE);',
							'PRAGMA case_sensitive_like=OFF;',
							//'PRAGMA synchronous = OFF;',
							'PRAGMA temp_store = MEMORY;',
							'PRAGMA auto_vacuum = NONE;'
						]).then(function() {
							console.log('Karaoke.loaded: Finished setting up database.');
							$cordovaSQLite.execute(db, 'SELECT COUNT(id) AS count FROM karaoke').then(function(res) {
								var count = res.rows.length === 1? res.rows.item(0).count : -1;
								console.log('Karaoke.loaded: There are ' + count + ' existing items in the database.');
								if (parseInt(data.length) === parseInt(count)) {
									executeCommands(db, [
										//'PRAGMA synchronous = NORMAL;',
										'PRAGMA journal_mode = DELETE;',
										'PRAGMA temp_store = DEFAULT;',
										//'VACUUM;',
									]).then(function() {
										console.log('Karaoke.loaded: Pragmas reset.  Ready.');
										$scope.$evalAsync(function() {
											sqlitedb = db;
											updateEntries();
										});
									}, function(err) {
										printDbErr('Karaoke.loaded: failed to reset pragmas.', err);
									});
								} else {
									console.log('Karaoke.loaded: Document count does not match.');
									$cordovaSQLite.execute(db, 'DELETE FROM karaoke').then(function() {
										console.log('Karaoke.loaded: deleted old entries.');

										$cordovaSQLite.insertCollection(db, 'INSERT INTO karaoke (id, artist, song) values (?, ?, ?)', data).then(function(res) {
											console.log('Karaoke.loaded: inserted new entries.');
											executeCommands(db, [
												//'PRAGMA synchronous = NORMAL;',
												'PRAGMA journal_mode = DELETE;',
												'PRAGMA temp_store = DEFAULT;',
												//'VACUUM;',
											]).then(function() {
												console.log('Karaoke.loaded: Pragmas reset.  Vacuuming database.');
												db.executeSql('VACUUM;', undefined, function() {
													console.log('Karaoke.loaded: finished vacuum.  Ready.');
													$scope.$evalAsync(function() {
														sqlitedb = db;
														updateEntries();
													});
												}, function(err) {
													printDbErr('Karaoke.loaded: Failed to VACUUM the database.', err);
													$scope.$evalAsync(function() {
														sqlitedb = db;
														updateEntries();
													});
												});
											}, function(err) {
												printDbErr('Karaoke.loaded: failed to reset pragmas.', err);
											});
										}, function(err) {
											printDbErr('Karaoke.loaded: failed to insert data.', err);
										});

									}, function(err) {
										printDbErr('Failed to delete existing entries from the database.', err);
									});
								}
							}, function(err) {
								printDbErr('Karaoke.loaded: failed to get document count:',err);
							});
						}, function(err) {
							printDbErr('Karaoke.loaded: failed command: ' + err[0], err[1]);
						});
					} else {
						entries = data;
					}
					updateEntries();
				});
			});
		}).error(function(data, status, headers, config) {
			console.log('Failed to get karaoke list: ' + status, data);
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			console.log('beforeEnter: getting karaoke list');
			if (sqlitedb) {
				updateEntries();
			} else {
				$ionicLoading.show({
					template: 'Creating Karaoke index. This may take a minute...',
					hideOnStateChange: true,
				});
				var inter = $interval(function() {
					if (sqlitedb) {
						$ionicLoading.hide();
						$interval.cancel(inter);
						updateEntries();
					}
				}, 1000);
			}
		});

		$scope.$on('$ionicView.afterLeave', function(ev, info) {
			console.log('afterLeave: destroying karaoke list');
			$scope.entries = [];
		});
	}])
	;
}());
