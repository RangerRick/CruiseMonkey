[![Stories in Ready](https://badge.waffle.io/RangerRick/CruiseMonkey.png?label=ready&title=Ready)](https://waffle.io/RangerRick/CruiseMonkey)
[![Build Status](https://travis-ci.org/RangerRick/CruiseMonkey.png)](https://travis-ci.org/RangerRick/CruiseMonkey)

CruiseMonkey
============

CruiseMonkey is an HTML5 app for use on [JoCo Cruise Crazy](http://jococruisecrazy.com/).  It is designed to be used while on the cruise for viewing and organizing events, getting information about the ship, and more.

Requirements
============

* iOS: Any device supporting iOS 6 or higher
* Android: Any device supporting Android 4.0.3 or higher
* Web: A browser capable of modern HTML5

Download
========

The latest release version of CruiseMonkey is available in the following app stores:

* [iOS App Store](https://itunes.apple.com/us/app/cruisemonkey/id597303284?mt=8)
* [Amazon Apps for Android](http://www.amazon.com/Benjamin-Reed-CruiseMonkey/dp/B00BBOMRDW)
* [Google Play Store](https://play.google.com/store/apps/details?id=com.raccoonfink.cruisemonkey&hl=en_GB)

Twit-Arr
========

CruiseMonkey works just fine in read-only mode, but if you want to be able to create and favorite events, as well as use some of the other features for CruiseMonkey, you must log in with a twit-arr account [on my test Twit-Arr server first!](https://cm.raccoonfink.com/)

Beta Testing
============

* Android (Google Play): Just follow [this link to opt-in to betas](https://play.google.com/apps/testing/com.raccoonfink.cruisemonkey) on the Google Play store.
* iOS: [email me](mailto:cruisemonkey@raccoonfink.com) and I will send you an invite for iOS testing.  The limit for testers is now 2000 users, so there is no worry about having too many this year!

Bugs and Enhancement Requests
=============================

Opening an Issue (Bug or Enhancement)
-------------------------------------

* Twit-Arr: If you have found a bug or have an enhancement request for twit-arr, report it at the [Twit-Arr github page](https://github.com/walkeriniraq/twitarr/issues).  You will need to create a GitHub account to do so.
* CruiseMonkey: Bugs and enhancement requests can be reported at the [CruiseMonkey github page](https://github.com/RangerRick/CruiseMonkey/issues).  You will need to create a GitHub account to do so.

Quick-Start Developing
==========

Pre-reqs
--------

Before you can build CruiseMonkey, you must first install [Node.JS](http://nodejs.org/).  Once you have done that, run the following commands to set up your environment:

1. Install "global" commands through NPM: `npm install -g ionic cordova bower webpack webpack-cli`
1. Install local node requirements through NPM: `npm install`
1. Install JavaScript browser requirements through Bower: `bower install`
1. Set up one or more platforms: `cordova platform add browser` -- see `cordova platform` for all platforms you can add.  You will need to add any platforms to which you wish to target

Compiling the Javascript
------------------------

* To compile the JavaScript once, run: `npm run build`
* To continuously compile the JavaScript as you edit: `npm run watch`

Starting a browser session for this project
--------------------------------------------
1. Ensure [Twit-arr](https://github.com/walkeriniraq/twitarr) is running as well as MongoDb for it
1. `ionic run browser`
  * you can exchange browser for the platform of your choice

Starting an Emulator
--------------------

* Android: `npm run android`
* iOS: `npm run ios`

Note that if you run `npm run watch` in one window and then start the emulator in another, you can live-edit code and it will auto-refresh in the emulator.

Other Commands
--------------

* `npm run verbose-build`: Do a "verbose" webpack build, which can give more information on what is being done during compilation.
* `npm run genymotion`: Run the Android build in the Genymotion emulator rather than the (slower) Android emulator.  (Requires a Genymotion installation.)
* `npm run release`: Run webpack and build in release mode.  This makes a smaller, faster build with unreadable JavaScript.

Contact
=======

* E-Mail: You can reach me (Benjamin Reed) at [cruisemonkey@raccoonfink.com](mailto:cruisemonkey@raccoonfink.com).
* Slack: Join us in #twitarr and #cruisemonkey on [Slack](http://cm.raccoonfink.com/slack/).
* Forums: You can also discuss CruiseMonkey on the [JoCo Forums](http://www.jonathancoulton.com/forums/index.php?p=/discussion/2448/twit-arr-and-cruisemonkey-2016).

Licensing
=========

CruiseMonkey by Benjamin Reed is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
![](http://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png "Creative Commons by-nc-sa")

Release Notes
=============

The release notes can now be found [here](CHANGELOG.md).
