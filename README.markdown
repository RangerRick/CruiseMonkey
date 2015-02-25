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

CruiseMonkey works just fine in read-only mode, but if you want to be able to create and favorite events, as well as use some of the other features for CruiseMonkey, you must log in with a twit-arr account [on the new Twit-Arr server first!](https://jccc5.rylath.net/)

If you have any issues with the twit-arr server, I can't really help you.  Please ask Kvort\_the\_Duck on the JoCo forums, or post to the [twit-arr beta thread][].  Or, feel free to join us on IRC in #twitarr on irc.freenode.net.

Beta Testing
============

* Android (Google Play): [join the CruiseMonkey Google Group](https://groups.google.com/forum/#!forum/cruisemonkey), and then once you're approved, [follow this link](https://play.google.com/apps/testing/com.raccoonfink.cruisemonkey) to opt-in to alpha/beta testing.
* iOS: [email me](mailto:cruisemonkey@raccoonfink.com) and I will send you an invite for iOS testing.  The limit for testers is now 1000 users, so there is no worry about having too many this year!

Bugs and Enhancement Requests
=============================

Opening an Issue (Bug or Enhancement)
-------------------------------------

* Twit-Arr: If you're having account issues or other general questions, please speak with Kvort\_the\_Duck on the JoCo forums, or post to his [twit-arr beta thread][].  If you have found a bug or have an enhancement request for twit-arr, report it at the [Twit-Arr github page](https://github.com/walkeriniraq/twitarr/issues).  You will need to create a GitHub account to do so.
* CruiseMonkey: Bugs and enhancement requests can be reported at the [CruiseMonkey github page](https://github.com/RangerRick/CruiseMonkey/issues).  You will need to create a GitHub account to do so.

Quick-Start Developing
==========

Pre-reqs
--------

1. [Node](http://nodejs.org/) / [NPM](https://www.npmjs.com/)  Node should now include NPM, so you probably don't need to download/install NPM seperately.
1. [Bower](http://bower.io/) -- You can run: `npm install -g bower` to install this -- Package manager
1. [Ionic](http://ionicframework.com/) -- This is what generates the build artifacts for iOS or Android for example.  iOS output requires a Mac with xcode install.  This should include cordova.
1. [Gulp](http://gulpjs.com/) -- The streaming build system
1. [Twit-arr](https://github.com/walkeriniraq/twitarr) -- The backing webservice for the platform for the JoCo Cruise

First time
----------
1. `npm install`
1. `bower install`
1. `cordova platform add browser` -- see `cordova platform` for all platforms you can add.  You will need to add any platforms to which you wish to target
1. `gulp`  -- this runs the unit tests

Starting a browser session for this project
--------------------------------------------
1. Ensure [Twit-arr](https://github.com/walkeriniraq/twitarr) is running as well as MongoDb for it
1. `ionic run browser`
  * you can exchange browser for the platform of your choice

App Configuration
------------------
Goto *Settings* and configure the database host, name, twit-arr URL etc.

Contact
=======

* E-Mail: You can reach me (Benjamin Reed) at [testflight@raccoonfink.com](mailto:testflight@raccoonfink.com).
* IRC: Join us on IRC in #twitarr on irc.freenode.net.
* Forums: You can also discuss CruiseMonkey on the [JoCo Forums](http://www.jonathancoulton.com/forums/index.php?p=/discussion/2381/cruisemonkey-5).

Licensing
=========

CruiseMonkey by Benjamin Reed is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
![](http://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png "Creative Commons by-nc-sa")

Release Notes
=============

The release notes can now be found [here](CHANGELOG.md).

[twit-arr beta thread]: http://www.jonathancoulton.com/forums/index.php?p=/discussion/2378/twitarr-beta
