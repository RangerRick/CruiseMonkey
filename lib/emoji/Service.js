const emojiTemplate = require('./emoji.html');
const utils = require('./utils');

angular.module('cruisemonkey.emoji.Emoji', [
	'ionic'
])
// eslint-disable-next-line @typescript-eslint/no-empty-function
.controller('EmojiPopupCtrl', () => {
})
.factory('EmojiService', ($ionicPopover, $log, $q, $rootScope) => {
	const scope = $rootScope.$new();
	let popover;

	$ionicPopover.fromTemplateUrl(emojiTemplate, { scope: scope }).then((p) => {
		popover = p;
	});

	scope.getSmall = (type) => {
		return utils.small(type);
	};
	scope.getLarge = (type) => {
		return utils.large(type);
	};
	scope.getTokens = () => {
		return utils.tokens();
	};
	scope.getTypes = () => {
		return utils.list();
	};

	scope.chooseEmoji = (emoji) => {
		$rootScope.$broadcast('cruisemonkey.emoji.selected', emoji);
	};

	const showEmoji = (ev) => {
		const deferred = $q.defer();
		// eslint-disable-next-line prefer-const
		let canceled;
		const selected = scope.$on('cruisemonkey.emoji.selected', (ev, emoji) => {
			$log.debug('Emoji selected: ' + emoji);
			if (selected) {
				selected();
			}
			if (canceled) {
				canceled();
			}
			popover.hide().then(() => {
				deferred.resolve(emoji);
			});
		});
		canceled = scope.$on('popover.hidden', () => {
			$log.debug('Emoji canceled');
			if (selected) {
				selected();
			}
			if (canceled) {
				canceled();
			}
			popover.hide().then(() => {
				deferred.reject();
			});
		});
		popover.show(ev);
		return deferred.promise;
	};

	return {
		small: scope.getSmall,
		large: scope.getLarge,
		tokens: scope.getTokens,
		types: scope.getTypes,
		show: showEmoji
	};
});

