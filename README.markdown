CruiseMonkey
============

CruiseMonkey is an HTML5 app for use on [JoCo Cruise Crazy](http://jococruisecrazy.com/).  It is designed to be used while on the cruise for viewing and organizing events, getting information about the ship, and more.

Requirements
============

* iOS: Any device supporting iOS 6 or 7
* Android: Any device supporting Android 2.3.3 or higher
* Web: A browser capable of modern HTML5

Download
========

The latest release version of CruiseMonkey is available in the following app stores:

* [iOS App Store](https://itunes.apple.com/us/app/cruisemonkey/id597303284?mt=8)
* [Amazon Apps for Android](http://www.amazon.com/Benjamin-Reed-CruiseMonkey/dp/B00BBOMRDW)
* [Google Play Store](https://play.google.com/store/apps/details?id=com.raccoonfink.cruisemonkey&hl=en_GB)

Twit-Arr Has Changed!
=====================

Please note that the Twit-Arr server is completely new this year, and user accounts from last year will no longer work with it.  Before you can log in to CruiseMonkey, you will have to make an account [on the new Twit-Arr server first!](https://twitarr.rylath.net/)

If you have any issues with the twit-arr server, I can't really help you.  Please ask Kvort\_the\_Duck on the JoCo forums, or post to his [twit-arr thread here](http://www.jonathancoulton.com/forums/index.php?p=/discussion/1940/twitt-arrrr).

Logging In to Twit-Arr
======================

Because Twit-Arr is using a self-signed certificate, you must import it into your device.  To do so, launch CruiseMonkey, go to "Advanced" and then click the "Import" button.

Beta Testing
============

Beta iOS and Android releases are available through [TestFlight](http://testflightapp.com).

To be notified of beta downloads, do the following:

1. Sign up at [testflightapp.com](http://testflightapp.com).
2. Register your device by browsing to [testflightapp.com](http://testflightapp.com) directly on your mobile device.  It will prompt for a login (if you haven't already) and then register a certificate profile with your device which allows pushing beta releases to your device.
3. Go to the [CruiseMonkey beta recruitment page](http://tflig.ht/ytVfRp) and apply as a tester.

Returning Beta Testers on iOS - ACTION REQUIRED!
------------------------------------------------

Apple only allows a certain number of approved devices to be built into test binaries.  This means that I have a limited number of test slots available.  Rather than adding to last year's beta list, I'm starting over this year, since it's possible that some of last year's testers have bought or gotten rid of devices or will not be attending JCCC4.

If you have beta tested previous CruiseMonkey releases, **please email me at [testflight@raccoonfink.com](mailto:testflight@raccoonfink.com)** to let me know your TestFlight account email address and which device(s) are still active and that you would like to test again this year.

**ALSO: Please PLEASE remove any old devices you might have put in TestFlight that you aren't using any more, and add your current devices.**

Bugs and Enhancement Requests
=============================

Opening an Issue (Bug or Enhancement)
-------------------------------------

* Twit-Arr: If you're having account issues, please speak with Kvort\_the\_Duck on the JoCo forums, or post to his [twit-arr thread here](http://www.jonathancoulton.com/forums/index.php?p=/discussion/1940/twitt-arrrr).  If you have found a bug or have an enhancement request for twit-arr, report it at the [Twit-Arr github page](https://github.com/walkeriniraq/twitarr/issues).  You will need to create a GitHub account to do so.
* CruiseMonkey: Bugs and enhancement requests can be reported at the [CruiseMonkey github page](https://github.com/RangerRick/CruiseMonkey/issues).  You will need to create a GitHub account to do so.

Contact
=======

* E-Mail: You can reach me (Benjamin Reed) at [testflight@raccoonfink.com](mailto:testflight@raccoonfink.com).
* IRC: Join me in #cruisemonkey on FreeNode: irc.freenode.net
* Forums: You can also discuss CruiseMonkey on the [JoCo Forums](http://www.jonathancoulton.com/forums/index.php?p=/discussion/2264/cruisemonkey-4)

Licensing
=========

CruiseMonkey by Benjamin Reed is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
![](http://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png "Creative Commons by-nc-sa")

Release Notes
=============

4.0.6
-----
* fix event search

4.0.5
-----

* fix a few object/memory leaks
* fix SSL certificate handling on Android (tested!)
* database optimization updates

4.0.4
-----
* more cleanup of scrolling in the UI
* fix "go to now" in the event list getting stuck
* fix an initialization error on old Android that could cause an exception
* fix event list date headers from disappearing when clicked

4.0.3
-----
* make the "on a boat" checker not trigger *after* the cruise ;)
* fix seamail check

4.0.2
-----

* fix scrolling on Android
* build system cleanups
* show the username in the log out menu entry
* fix "on a boat" detection to be date-based rather than a shifty call to the official HTTP url
* remove obsolete database refresh option since we do continuous sync
* more event view refactoring to reduce complexity
* modify favorites internal so that we don't keep creating and deleting new IDs in the remote DB for every change
* disable animation on Android < 4.3, this should hopefully speed up navigation
* smarter database sync filters to avoid extra data on round-trips
* make sure replication updates when logging in/out
* update everything to use twit-arr API version 2
* UI and template cleanups

4.0.1
-----

* fixed and reinstated the "go to next event" button
* updated to the latest Ionic (bug fixes)
* more cleanup to the event update code
* attempt to detect if we're on the ship and auto-configure if the right URL is found
* fix a race condition in database initialization that could cause the first event update to occasionally fail
* reworked event, favorite, and deck model to reduce memory usage
* improve database sync tracking to include the last time replication *to* the backend happened, in addition to *from*
* simplify the event-list template, this should reduce memory usage a little bit as well

4.0.0
-----

* 3.9.11 was uploaded to the App Store as 4.0.0.

3.9.11
------
* "About" page now lists the last time the database synced, as well as the last time an event was modified
* events views refactored to refresh faster and have cleaner data in the backend; search responds better now
* build system tweaks

3.9.10
------
* fix quick taps causing the menu to close when it shouldn't
* ask "Are you sure?" before deleting an event
* remove online/offline detection, it is likely to cause issues on the ship
* fix a bug in replication that could cause sync to deadlock when backgrounding then foregrounding the app
* add "x" icons to clear search inputs
* tweak the buttons a bit
* fix a bug where if a button is on the right of the title, it would stick around when switching views
* various wording fixes

3.9.9
-----
* temporarily remove problematic "now" code, it's broken in upstream Ionic
* change deck list to show a "page" indicator
* karaoke search will now search by individual keywords, so a search for "billy joel" will match "joel, billy"
* clean up the amenities list a bit

3.9.8
-----
* fix scrolling sticking if you hit the "now" button
* rework the karaoke list to be 2 different paths, a (much simpler) "by artist" browser, and a search screen
* close the menu if you click the main pane

3.9.7
-----
* don't allow sliding to open the menu, since it interferes with sliding in the deck plans and twit-arr pics
* you can now scroll to the next upcoming entry in the event list with a button
* the menu now fits without scrolling on low-res devices even when logged in
* remove the confusing "example" artists in the artist-first-letter karaoke list

3.9.6
-----

* Fixed database bug (re)introduced on some Samsung Android devices that would cause a blank screen on loading
* Open Seamail link in an external browser, rather than the in-app browser
* Add an option under "Advanced" to open in Chrome, rather than Safari, on iOS
* Fix a couple of other small UI bugs

3.9.5
-----

* Update to Ionic 0.9.23
* Update to AngularJS 1.2.11
* Change deck images to png for performance reasons
* Remove extraneous nav-buttons on deck plans
* Add karaoke list (testers, please let me know about performance!)
* Reset configuration to point to production CruiseMonkey database
* Add some ship navigation tips to the "Help" screen

3.9.4
-----

* Fix favorites
* Clean up unit tests

3.9.3
-----

* Fix Android icon
* Fix clicking menu items on Android
* Upgrade database and settings on start of a new version
* Update Ionic to 0.9.22
* Even *more* work on event synchronization; data should appear faster on first launch now
* Allow events to not have end dates
* Handle online/offline properly in mobile mode
* All menu items actually fit without scrolling on small screens

3.9.2+20140128222317
--------------------

* update to latest Ionic (fixes Android double-tap menu open/close)
* rework menu to indicate current selection
* change event loading to be more asynchronous (ie, don't freeze the UI while loading data)
* add Seamail indicator in the menu
* add Seamail link for viewing seamail
* add descriptions to amenities
* reset button in Advanced resets to "factory defaults" now
* add a Twit-Arr photo browser
* more cleanup of database initialization code
* optimizations to the event list, should be more responsive

3.9.1+20140122195945
--------------------

* update to the latest Ionic
* update to the latest AngularJS and angular-ui-router
* fix deck loading when the deck controller remembers the previous deck viewed
* remove a bunch of unused resources (smaller download)
* more refactoring of the event query subsystem, should reduce memory usage a bit
* tons of style cleanup and tweaking

3.9.1+20140119145636
--------------------

* reworked initialization
* handle mobile/desktop-browser differences better
* add a real API for performing actions only when on mobile
* update Ionic to 0.9.21 prerelease
* rewrite deck viewer to use less memory
* make database replication aware of running in the background on mobile devices
* replicate immediately when the user modifies a favorite or an event
* fix scrolling on touch devices to not allow dragging the
  UI to the left or right when dragging at an angle


3.9.1+20140116210008
--------------------

* add help page
* clean up replication some more


3.9.1+20140116181949
--------------------

* Android build fixes
* Turn optimization up on iOS compile
* Settings code cleanup
* Make database refresh configurable
* Replicate every 20 seconds by default
* Replicate whenever user updates data
* Don't allow time travel (event end must be greater than start)

3.9.1+20140115225334
--------------------

* update PouchDB

3.9.1+20140113123643
--------------------

* doc updates
* version number fix

3.9.1+20140113111748
--------------------

* remove landscape support
* add custom URL
* clean up logout controller

3.9.1+20140112220547
--------------------

* initial release to testflight for users

