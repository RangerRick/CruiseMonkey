describe('cruisemonkey.controllers.Events', function() {
	var orderByEvent = null;
	
	beforeEach(function() {
		module('cruisemonkey.controllers.Events', function($provide) {
			
		});
		inject(['orderByEventFilter', function(o) {
			orderByEvent = o;
		}]);
	});

	describe('orderByEvent', function() {
		it('should sort complex objects with multiple arguments properly', function() {
			var a = {
				'start':   '2013-04-14 00:00',
				'end':     '2013-04-14 02:00',
				'summary': 'This is a thing.'
			};
			var b = {
				'start':   '2013-04-14 01:00',
				'end':     '2013-04-14 01:30',
				'summary': 'A thing is happening.'
			};
			var c = {
				'start':   '2012-01-01 00:00',
				'end':     '2012-01-01 00:01',
				'summary': 'It is a new year!'
			};
			var d = {
				'start':   '2013-04-14 00:00',
				'end':     '2013-04-14 02:00',
				'summary': 'Not a thing.'
			};

			expect(orderByEvent([a,b,c,d])).toEqual([c,d,a,b]);
		});
	});

});