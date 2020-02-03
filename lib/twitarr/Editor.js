const editTweetTemplate = require('./edit.html');
const translator = require('./translator');

require('../util/Photo');

angular.module('cruisemonkey.twitarr.Editor', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.emoji.Emoji',
	'cruisemonkey.user.User',
	'cruisemonkey.util.Photo',
])
.factory('TweetEditor', ($ionicActionSheet, $ionicLoading, $ionicModal, $ionicPopup, $log, $q, $rootScope, $timeout, EmojiService, Photos, SettingsService, Twitarr, UserService) => {

	const $scope = $rootScope.$new();
	SettingsService.getTwitarrRoot().then((tr) => {
		$scope.twitarrRoot = tr;
	});
	$rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
			$scope.twitarrRoot = changed.new['twitarr.root'];
		}
	});

	let editTweetModal;
	$ionicModal.fromTemplateUrl(editTweetTemplate, {
		animation: 'slide-in-up',
		focusFirstInput: false,
		scope: $scope
	}).then((modal) => {
		modal.scope.removePhoto = (ev) => {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			delete modal.scope.tweet.photo;
		};

		modal.scope.showEmoji = (ev) => {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			EmojiService.show(ev).then((selected) => {
				if (modal.scope.tweet.text.length === 0) {
					modal.scope.tweet.text += ':' + selected + ':';
				} else {
					modal.scope.tweet.text += ' :' + selected + ':';
				}
				modal.scope.resetCursor();
			});
		};

		modal.scope.closeModal = (ev) => {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			modal.hide();
		};

		modal.scope.isModified = (tweet) => {
			return modal.scope.originalTweet === undefined ||
				tweet.id !== modal.scope.originalTweet.id ||
				tweet.text !== modal.scope.originalTweet.text ||
				tweet.photo !== modal.scope.originalTweet.photo;
		};

		modal.scope.postTweet = (ev, tweet, originalTweet) => {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}

			$ionicLoading.show({
				template: 'Sending...',
				duration: 10000,
				noBackdrop: true
			});

			let changed = false;
			let newTweet = {};

			if (originalTweet === undefined) {
				newTweet = angular.copy(tweet);
				changed = true;
			} else {
				if (tweet.id) {
					newTweet.id = tweet.id;
				}
				if (tweet.text !== originalTweet.text) {
					$log.debug('Tweet text has changed.');
					newTweet.text = tweet.text || null;
					changed = true;
				}
				if (tweet.photo !== originalTweet.photo) {
					$log.debug('Tweet photo has changed: ' + originalTweet.photo + ' -> ' + newTweet.photo);
					newTweet.photo = tweet.photo || null;
					changed = true;
				}
			}

			let tweetCmd = Twitarr.addTweet;
			if (newTweet.id) {
				tweetCmd = Twitarr.updateTweet;
			}

			if (!changed) {
				$ionicPopup.alert({
					title: 'Failed',
					template: 'Failed to post Tweet. Tweet was not modified.'
				});
				$ionicLoading.hide();
				return;
			}

			tweetCmd(newTweet).then((updatedTweet) => {
				if (updatedTweet && updatedTweet.stream_post) {
					$log.debug('tweet posted: ' + updatedTweet.stream_post.text);
					modal.hide().then(() => {
						$rootScope.$broadcast('cruisemonkey.notify.tweetPosted', updatedTweet.stream_post.id);
					});
				} else {
					$log.error('unknown response: ' + angular.toJson(updatedTweet));
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to post Tweet.  An unknown error occurred.'
					});
				}
			}, (err) => {
				$ionicPopup.alert({
					title: 'Failed',
					template: 'Failed to post Tweet: ' + err[0]
				});
			}).finally(() => {
				$ionicLoading.hide();
			});
		};

		const doneUploading = () => {
			$timeout(() => {
				delete $scope.photoUploading;
			}, 1000);
		};

		modal.scope.p = Photos;
		modal.scope.getPhoto = (ev) => {
			return Photos.activate(ev, false).then((photo) => {
				$log.debug('cmTweet.editTweet.getPhoto: photo=' + angular.toJson(photo));
				modal.scope.tweet.photo = photo;
				doneUploading();
				return photo;
			}, (err) => {
				if (err) {
					$log.debug('cmTweet.editTweet.getPhoto: error: ' + angular.toJson(err));
				} else {
					$log.debug('cmTweet.editTweet.getPhoto: no photo.');
				}
				doneUploading();
				return $q.reject(err);
			}, (progress) => {
				//$log.debug('progress: ' + angular.toJson(progress));
				$scope.photoUploading = progress;
			}).finally(() => {
				doneUploading();
			});
		};

		modal.scope.resetCursor = () => {
			modal.scope.$evalAsync(() => {
				const el = document.getElementById('tweet-text');
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
		}).then((res) => {
			if (res) {
				$rootScope.$broadcast('cruisemonkey.tweet.deleted', tweet.id);
				return Twitarr.removeTweet(tweet).then(() => {
					return true;
				}, (err) => {
					$log.error('Failed to remove tweet: ' + angular.toJson(err));
					return $q.reject(err);
				}).finally(() => {
					$rootScope.$broadcast('cruisemonkey.tweet.refresh', true);
				});
			} else {
				return false;
			}
		});
	}

	function editTweet(options, ev) {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}

		editTweetModal.scope.type = options.type;
		if (options.tweet && options.tweet.text) {
			options.tweet.text = translator.decode(options.tweet.text);
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
			const user = UserService.get();
			const tweet = {
				text: '@' + options.tweet.author.username + ' ',
				parent: options.tweet.id
			};
			if (options.tweet.mentions) {
				for (let i=0, len=options.tweet.mentions.length, mention; i < len; i++) {
					mention = options.tweet.mentions[i];
					if (mention !== user.username) {
						tweet.text += '@' + mention + ' ';
					}
				}
			}
			editTweetModal.scope.tweet = tweet;
		} else if (options.type === 'edit' && options.tweet) {
			editTweetModal.scope.title = 'Edit Tweet';
			const tweet = {
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

			if (tweet && tweet.text) {
				tweet.text = translator.removeCarriageReturns(tweet.text);
			}
			editTweetModal.scope.originalTweet = angular.copy(tweet);
			editTweetModal.scope.tweet = tweet;
		} else {
			$log.warn('cmTweet.editTweet: unsure how to handle type: ' + options.type);
		}
		$log.info('Editing tweet: ' + angular.toJson(editTweetModal.scope.tweet));
		editTweetModal.show().then(() => {
			editTweetModal.scope.resetCursor();
		});
	}

	function toggleLike(tweet, ev) {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$log.debug('cmTweet.toggleLike(' + tweet.id + ')');
		const user = UserService.get();

		if (tweet.all_likes && (tweet.all_likes.indexOf(user.username) >= 0 || tweet.all_likes.indexOf('You') >= 0)) {
			// we have already liked it, unlike it
			tweet.all_likes.splice(tweet.all_likes.indexOf(user.username), 1);
			tweet.likes.splice(tweet.likes.indexOf(user.username), 1);
			return Twitarr.unlike(tweet.id).then((/* res */) => {
				return tweet;
			}, (err) => {
				$log.error('Unable to toggle like on ' + tweet.id + ':' + err[0]);
				return $q.reject(err);
			}).finally(() => {
				$rootScope.$broadcast('cruisemonkey.tweet.refresh', true);
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
			return Twitarr.like(tweet.id).then((/* res */) => {
				return tweet;
			}, (err) => {
				$log.error('Unable to toggle like on ' + tweet.id + ':' + err[0]);
				return $q.reject(err);
			}).finally(() => {
				$rootScope.$broadcast('cruisemonkey.tweet.refresh', true);
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
			buttonClicked: (index) => {
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
			destructiveButtonClicked: () => {
				deleteTweet(tweet);
				return true;
			}
		});
	}

	return {
		new: (ev) => {
			return editTweet({ type:'create' }, ev);
		},
		edit: (tweet, ev) => {
			return editTweet({
				tweet:tweet,
				type:'edit'
			}, ev);
		},
		reply: (tweet, ev) => {
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