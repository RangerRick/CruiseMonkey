(function() {
	'use strict';

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
	.controller('CMKaraokeSearchCtrl', ['storage', '$scope', '$http', '$timeout', '$cordovaSQLite', '$ionicScrollDelegate', '_database', 'SettingsService', function(storage, $scope, $http, $timeout, $cordovaSQLite, $ionicScrollDelegate, _database, SettingsService) {
		console.log('Initializing CMKaraokeSearchCtrl');

		storage.bind($scope, 'searchString', {
			'storeName': 'cruisemonkey.karaoke-search'
		});

		storage.bind($scope, 'lastUpdated', {
			'defaultValue': moment().valueOf(),
			'storeName': 'cruisemonkey.karaoke-last-updated'
		});

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
							$cordovaSQLite.execute(sqlitedb, 'SELECT id, artist, song FROM karaoke WHERE artist like ? OR song like ?', '%'+$scope.searchString+'%', '%'+$scope.searchString+'%').then(function(res) {
								console.log('Karaoke.updateEntries: got results: ' + res.rows.length);
								var results = [], entry;
								for (var i=0; i < res.rows.length; i++) {
									entry = res.rows.item(i);
									results.push([entry.id, entry.artist, entry.song]);
								}
								$scope.entries = results;
							}, function(err) {
								console.log('Karaoke.updateEntries: error selecting: ' + err);
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
			if (delegate.getScrollPosition().top != 0) {
				delegate.scrollTop(false);
			}
		};

		$scope.$on('cruisemonkey.database.change', function(ev, db, doc) {
			if (db.name.endsWith('karaoke')) {
				updateEntries();
			}
		});

		$scope.$on('$ionicView.loaded', function(ev, info) {
			console.log('Karaoke.loaded: initializing database');

			$http.get('scripts/cruisemonkey/karaoke-list.js').success(function(data, status, headers, config) {
				console.log('Karaoke.loaded: got karaoke list with ' + data.length + ' entries.');
				ionic.Platform.ready(function() {
					$scope.$evalAsync(function() {
						if (ionic.Platform.isWebView()) {
							// we're inside a cordova container, use SQLite
							console.log('Karaoke.loaded: loading data to sqlite');
							var db = $cordovaSQLite.openDB({ name: "karaoke", bgType: 0 });
							$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS karaoke (id INTEGER, artist TEXT, song TEXT, UNIQUE(artist, song) ON CONFLICT REPLACE);').then(function() {
								$cordovaSQLite.execute(db, 'PRAGMA case_sensitive_like=OFF;').then(function() {
									$cordovaSQLite.execute(db, 'SELECT COUNT(id) AS count FROM karaoke').then(function(res) {
										var count = res.rows.length === 1? res.rows.item(0).count : -1;
										console.log('Karaoke.loaded: There are ' + count + ' existing items in the database.');
										if (parseInt(data.length) === parseInt(count.length) {
											sqlitedb = db;
											updateEntries();
										} else {
											console.log('Karaoke.loaded: Document count does not match.');
											$cordovaSQLite.execute(db, 'DELETE FROM karaoke').then(function(res) {
												$cordovaSQLite.insertCollection(db, 'INSERT INTO karaoke (id, artist, song) values (?, ?, ?)', data).then(function(res) {
													sqlitedb = db;
													updateEntries();
												}, function(err) {
													console.log('Karaoke.loaded: failed to insert data: ' + err);
												});
											}, function(err) {
												console.log('Karaoke.loaded: failed to delete existing entries from the database: ' + err);
											});
										}
									}, function(err) {
										console.log('Karaoke.loaded: failed to get karaoke count:' + err);
									});
								}, function(err) {
									console.log('Karaoke.loaded: failed to set LIKE to case-insensitive: ' + err);
								});
							}, function(err) {
								console.log('failed to create (or replace) table: ' + err);
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
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			console.log('beforeEnter: getting karaoke list');
			updateEntries();
		});

		$scope.$on('$ionicView.afterLeave', function(ev, info) {
			console.log('afterLeave: destroying karaoke list');
			$scope.entries = [];
		});
	}])
	;
}());
