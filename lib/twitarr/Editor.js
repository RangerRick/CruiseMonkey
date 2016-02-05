'use strict';

var editTweetTemplate = require('ngtemplate!html!./edit.html');
var translator = require('./translator');

require('../util/Photo');

angular.module('cruisemonkey.twitarr.Editor', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.emoji.Emoji',
	'cruisemonkey.user.User'
])
.factory('TweetEditor', function($ionicActionSheet, $ionicLoading, $ionicModal, $ionicPopup, $log, $q, $rootScope, $timeout, EmojiService, Photos, SettingsService, Twitarr, UserService) {

	var $scope = $rootScope.$new();
	SettingsService.getTwitarrRoot().then(function(tr) {
		$scope.twitarrRoot = tr;
	});
	$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
			$scope.twitarrRoot = changed.new.twitarrRoot;
		}
	});

	var editTweetModal;
	$ionicModal.fromTemplateUrl(editTweetTemplate, {
		animation: 'slide-in-up',
		focusFirstInput: false,
		scope: $scope
	}).then(function(modal) {
		if (navigator.camera) {
			var cameraOptions = {
				correctOrientation: true,
				encodingType: Camera.EncodingType.JPEG,
				destinationType: Camera.DestinationType.FILE_URI,
				mediaType: Camera.MediaType.PICTURE,
				quality: 80,
				saveToPhotoAlbum: true
			};
		}

		modal.scope.canCamera = navigator.camera? true:false;

		modal.scope.showEmoji = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			EmojiService.show(ev).then(function(selected) {
				if (modal.scope.tweet.text.length === 0) {
					modal.scope.tweet.text += ':' + selected + ':';
				} else {
					modal.scope.tweet.text += ' :' + selected + ':';
				}
				modal.scope.resetCursor();
			});
		};

		modal.scope.closeModal = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			modal.hide();
		};

		modal.scope.postTweet = function(ev, tweet, originalTweet) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}

			$ionicLoading.show({
				template: 'Sending...',
				duration: 10000,
				noBackdrop: true
			});

			var newTweet = angular.copy(tweet);

			var tweetCmd = Twitarr.addTweet;
			if (tweet.id) {
				tweetCmd = Twitarr.updateTweet;
				if (tweet.text === originalTweet.text) {
					delete newTweet.text;
				}
				if (angular.toJson(tweet.photo) === angular.toJson(originalTweet.photo)) {
					delete newTweet.photo;
				}
			}

			if (!newTweet.text && !newTweet.photo) {
				$ionicPopup.alert({
					title: 'Failed',
					template: 'Failed to post Tweet. Tweet was not modified.'
				});
				return;
			}

			tweetCmd(newTweet).then(function(updatedTweet) {
				if (updatedTweet && updatedTweet.stream_post) {
					$log.debug('tweet posted: ' + updatedTweet.stream_post.text);
					modal.hide().then(function() {
						$rootScope.$broadcast('cruisemonkey.notify.tweetPosted', updatedTweet.stream_post.id);
					});
				} else {
					$log.error('unknown response: ' + angular.toJson(updatedTweet));
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to post Tweet.  An unknown error occurred.'
					});
				}
			}, function(err) {
				$ionicPopup.alert({
					title: 'Failed',
					template: 'Failed to post Tweet: ' + err[0]
				});
			}).finally(function() {
				$ionicLoading.hide();
			});
		};

		var doneUploading = function() {
			$timeout(function() {
				delete $scope.photoUploading;
			}, 1000);
		};

		modal.scope.p = Photos;
		modal.scope.getPhoto = function(ev) {
			return Photos.activate(ev, false).then(function(photo) {
				$log.debug('cmTweet.editTweet.getPhoto: photo=' + photo);
				modal.scope.tweet.photo = photo;
				doneUploading();
				return photo;
			}, function(err) {
				if (err) {
					$log.debug('cmTweet.editTweet.getPhoto: error: ' + angular.toJson(err));
				} else {
					$log.debug('cmTweet.editTweet.getPhoto: no photo.');
				}
				doneUploading();
				return $q.reject(err);
			}, function(progress) {
				//$log.debug('progress: ' + angular.toJson(progress));
				$scope.photoUploading = progress;
			}).finally(function() {
				doneUploading();
			});
		};

		modal.scope.resetCursor = function() {
			modal.scope.$evalAsync(function() {
				var el = document.getElementById('tweet-text');
				el.focus();
				el.setSelectionRange(modal.scope.tweet.text.length+1, modal.scope.tweet.text.length+1);
			});
		}

		editTweetModal = modal;
	});

	function deleteTweet(tweet, ev) {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		return $ionicPopup.confirm({
			title: 'Delete tweet?',
			template: 'Are you sure you want to delete this tweet?'
		}).then(function(res) {
			if (res) {
				$rootScope.$broadcast('cruisemonkey.tweet.deleted', tweet.id);
				return Twitarr.removeTweet(tweet).then(function() {
					return true;
				}, function(err) {
					$log.error('Failed to remove tweet: ' + angular.toJson(err));
					return $q.reject(err);
				}).finally(function() {
					$rootScope.$broadcast('cruisemonkey.tweet.refresh', true);
				});
			} else {
				return false;
			}
		});
	}

	function editTweet (options, ev) {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}

		editTweetModal.scope.type = options.type;
		if (options.tweet && options.tweet.text) {
			editTweetModal.scope.referencedTweet = options.tweet;
		} else {
			delete editTweetModal.scope.referencedTweet;
		}
		$log.debug('referenced tweet: ' + angular.toJson(editTweetModal.scope.referencedTweet));

		if (options.type === 'create') {
			editTweetModal.scope.title = 'New Tweet';
			editTweetModal.scope.type = 'create';
			editTweetModal.scope.tweet = { text: '' };
		} else if (options.type === 'reply' && options.tweet) {
			editTweetModal.scope.title = 'Tweet Reply';
			var user = UserService.get();
			var tweet = {
				text: '@' + options.tweet.author + ' ',
				parent: options.tweet.id
			};
			if (options.tweet.mentions) {
				for (var i=0, len=options.tweet.mentions.length, mention; i < len; i++) {
					mention = options.tweet.mentions[i];
					if (mention !== user.username) {
						tweet.text += '@' + mention + ' ';
					}
				}
			}
			editTweetModal.scope.tweet = tweet;
		} else if (options.type === 'edit' && options.tweet) {
			editTweetModal.scope.title = 'Edit Tweet';
			var tweet = {
				text: options.tweet.text,
				id: options.tweet.id
			};
			if (options.tweet.photo) {
				if (options.tweet.photo.id) {
					tweet.photo = options.tweet.photo.id;
				} else {
					tweet.photo = options.tweet.photo;
				}
			}
			editTweetModal.scope.originalTweet = angular.copy(tweet);
			editTweetModal.scope.tweet = tweet;
		} else {
			$log.warn('cmTweet.editTweet: unsure how to handle type: ' + options.type);
		}
		$log.info('Editing tweet: ' + angular.toJson(editTweetModal.scope.tweet));
		editTweetModal.show().then(function() {
			editTweetModal.scope.resetCursor();
		});
	}

	function toggleLike(tweet, ev) {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$log.debug('cmTweet.toggleLike(' + tweet.id + ')');
		var user = UserService.get();

		if (tweet.all_likes && (tweet.all_likes.indexOf(user.username) >= 0 || tweet.all_likes.indexOf('You') >= 0)) {
			// we have already liked it, unlike it
			tweet.all_likes.splice(tweet.all_likes.indexOf(user.username), 1);
			tweet.likes.splice(tweet.likes.indexOf(user.username), 1);
			Twitarr.unlike(tweet.id).then(function(res) {
			}, function(err) {
				$log.error('Unable to toggle like on ' + tweet.id + ':' + err[0]);
			});
		} else {
			if (!tweet.likes) {
				tweet.likes = [];
			}
			if (!tweet.all_likes) {
				tweet.all_likes = [];
			}
			tweet.likes.push(user.username);
			tweet.all_likes.push(user.username);
			Twitarr.like(tweet.id).then(function(res) {
			}, function(err) {
				$log.error('Unable to toggle like on ' + tweet.id + ':' + err[0]);
			});
		}
	}

	function showTweetOptions(tweet, ev) {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$ionicActionSheet.show({
			buttons: [
				{ text: 'Reply' },
				{ text: 'Edit' }
			],
			destructiveText: 'Delete',
			cancelText: 'Cancel',
			buttonClicked: function(index) {
				switch(index) {
					case 0:
						editTweet({
							tweet:tweet,
							type:'reply'
						});
						break;
					case 1:
						editTweet({
							tweet:tweet,
							type:'edit'
						});
						break;
				}
				return true;
			},
			destructiveButtonClicked: function() {
				deleteTweet(tweet);
				return true;
			}
		});
	}

	return {
		new: function(ev) {
			return editTweet({
				type:'create'
			}, ev);
		},
		edit: function(tweet, ev) {
			return editTweet({
				tweet:tweet,
				type:'edit'
			}, ev);
		},
		reply: function(tweet, ev) {
			return editTweet({
				tweet:tweet,
				type:'reply'
			}, ev);
		},
		del: deleteTweet,
		showOptions: showTweetOptions,
		toggleLike: toggleLike
	}
});