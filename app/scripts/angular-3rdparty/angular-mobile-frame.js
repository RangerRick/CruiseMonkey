(function (angular, undefined) {

	var _$mobileFrame_ = '$mobileFrame',
		_directive_ = 'directive',
		_toggle_ = null,
		_navVisible_ = false;

	// @todo: Commenting all this crap!

	angular

		.module('ek.mobileFrame', ['ng'])

		.provider('$mobileFrame', function () {

			var headerHeight,
				footerHeight,
				navWidth;

			this.$get = function () {
				return {
					getHeaderHeight: function () {
						return headerHeight;
					},
					getFooterHeight: function () {
						return footerHeight;
					},
					getNavWidth: function () {
						return navWidth;
					},
					toggleNav: function () {
						if (_toggle_) {
							_toggle_();
						}
					},
					navVisible: function () {
						return _navVisible_;
					}
				};
			};

			this.setHeaderHeight = function (val) {
				headerHeight = val;
				return this;
			};

			this.setFooterHeight = function (val) {
				footerHeight = val;
				return this;
			};

			this.setNavWidth = function (val) {
				navWidth = val;
				return this;
			};

		})

		.controller('MobileFrameCtrl', function () {

			var that = this;

			this.toggleNav = function () {
				that.callback.call();
			};

			this.onNavToggle = function (callback) {
				that.callback = callback;
			};

			_toggle_ = this.toggleNav;
		})

		[_directive_]('mobileFrame', [_$mobileFrame_, '$location', function ($mobileFrame, $location) {

			var navWidth = $mobileFrame.getNavWidth(),
				$elem;

			function handleNav() {

				var val = _navVisible_ ? 0 : navWidth;

				if ( arguments.length && !_navVisible_ ) {
					return;
				}

				$elem.css({
					'-webkit-transform': 'translate3d(' + val + 'px, 0, 0)',
					'-moz-transform': 'translate3d(' + val + 'px, 0, 0)',
					'transform': 'translate3d(' + val + 'px, 0, 0)'
				});
				_navVisible_ = !_navVisible_;

			}

			return {
				restrict: 'E',
				transclude: true,
				scope: true,
				replace: true,
				controller: 'MobileFrameCtrl',
				template: '<section class="mobile-frame" ng-transclude></section>',
				link: function ($scope, _$elem_, $attrs, mobileFrameCtrl) {

					$elem = _$elem_.css({
						paddingLeft: navWidth + 'px',
						left: -navWidth + 'px'
					});
					mobileFrameCtrl.onNavToggle(handleNav);

					$scope.location = $location;
					$scope.$watch('location.path()', handleNav);

				}
			};
		}])

		[_directive_]('mobileHeader', [_$mobileFrame_, function ($mobileFrame) {
			return {
				restrict: 'E',
				require: '^mobileFrame',
				transclude: true,
				replace: true,
				template: [
					'<header class="mobile-header" role="banner">',
					'	<button type="button" class="mobile-nav-toggle" id="mobile-nav-toggle">&nbsp;</button>',
					'	<div class="mobile-header-inner" ng-transclude></div>',
					'</header>'
				].join(''),
				link: function ($scope, $elem, $attrs, mobileFrameCtrl) {
					$elem.css('height', $mobileFrame.getHeaderHeight() + 'px');
					angular.element(
						document.getElementById('mobile-nav-toggle')
					).bind('click', mobileFrameCtrl.toggleNav);
				}
			};
		}])

		[_directive_]('mobileNav', [_$mobileFrame_, function ($mobileFrame) {
			return {
				restrict: 'E',
				transclude: true,
				replace: true,
				template: [
					'<div class="mobile-nav">',
					'	<div class="mobile-nav-inner" ng-transclude></div>',
					'</div>'
				].join(''),
				link: function ($scope, $elem, $attrs) {

					var navWidth = $mobileFrame.getNavWidth();

					$elem.css('width', navWidth + 'px');

				}
			};
		}])

		[_directive_]('mobileContent', [_$mobileFrame_, '$window', '$compile', function ($mobileFrame, $window, $compile) {

			var tmpl = angular.element([
					'<div class="mobile-content" role="main">',
					'	<div class="mobile-content-inner"></div>',
					'</div>'
				].join('')),
				oldAttrs;

			function contentHeight() {
				return $window.innerHeight - ($mobileFrame.getHeaderHeight() + $mobileFrame.getFooterHeight());
			}

			function transferAttributes($elem) {

				var $inner = $elem.find('div');

				angular.forEach(oldAttrs, function (_val, _attr) {

					var val, attr;

					if ( !angular.isString(_val) ) {
						return;
					}

					attr = oldAttrs.$attr[_attr];
					val = attr === 'class' ?
						$inner.attr('class') + ' ' + _val :
						_val;
					$inner.attr(attr, val);
				});

				return $elem;

			}

			return {
				restrict: 'E',
				transclude: 'element',
				scope: true,
				compile: function (tElem, tAttrs, transclude) {

					oldAttrs = tAttrs;

					return function ($scope, $elem, $attrs) {
						transclude($scope, function ($clone) {

							var $newElem = transferAttributes(tmpl);

							$newElem.find('div').html($clone.html());
							$compile($newElem)($scope);
							$elem.replaceWith($newElem);
							$newElem.css('height', contentHeight() + 'px');
							angular.element($window).bind('resize', function () {
								$newElem.css('height', contentHeight() + 'px');
							});

						});
					};

				}
			};
		}])

		[_directive_]('mobileFooter', [_$mobileFrame_, function ($mobileFrame) {
			return {
				restrict: 'E',
				transclude: true,
				replace: true,
				template: [
					'<footer class="mobile-footer">',
					'	<div class="mobile-footer-inner" ng-transclude></div>',
					'</footer>'
				].join(''),
				link: function ($scope, $elem, $attrs) {
					$elem.css('height', $mobileFrame.getFooterHeight() + 'px');
				}
			};
		}]);

})(angular);