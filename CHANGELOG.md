<a name="5.9.0"></a>
## 5.9.0 (2015-01-21)

5.9.0 (CruiseMonkey 2016) is a major refactor of the CM codebase, with a streamlined UI and a lot of under-the-hood cleanup.

There are not (yet) any major new features over last year's release, but those will be coming now that the core is in good shape.

#### Changes

* build 40359
  * fix centering of event tab title

#### Known Issues

* amenities still lists amenities for Independence of the Seas
* deck list is missing
* images do not show any indication they are loading while they are loading (this is noticeable in the twit-arr view)
* probably more things I can't think of at the moment

<a name="5.0.8"></a>
## 5.0.8 (2015-01-25)


#### Bug Fixes


* **database**  clean out old databases on startup ((e8895399))
* **events**
  *  clean up "reset cache" a bit ((7f5a55ac))
  *  small tweak to the way initialization happens ((5af3fb0e))



<a name="5.0.7"></a>
## 5.0.7 (2015-01-25)


#### Bug Fixes


* **login**  fix more login corner cases ((f2cd350e))
* **twitarr**  do not keep separate copy of user status ((da5df311))
* **images**  properly clean cache on startup ((d5617745))
* **events**
  *  more attempts to fix the render bug ((f94d02d4))
  *  more event-loading tweaking ((f1b66ef7))
  *  do not refresh the events until entering the view ((da780bc8))
  *  abandon the tab UI, it was too flaky ((d8b3359e))
  *  abandon the tab UI, it was too flaky ((89ef5452))
  *  make sure refresh does not start until replication does ((b7772eb6))
  *  missing add-event button on some tabs ((bac6396d))
* **input**  turn off autocapitalize/autocomplete where relevant ((00114845))

#### Features


* **login**  link to password reset ((da47f82b))



<a name="5.0.6"></a>
## 5.0.6 (2015-01-25)


#### Bug Fixes


* **events**
  *  abandon the tab UI, it was too flaky ((89ef5452))
  *  make sure refresh does not start until replication does ((b7772eb6))
  *  missing add-event button on some tabs ((bac6396d))
* **twitarr**  do not keep separate copy of user status ((da5df311))
* **images**  properly clean cache on startup ((d5617745))
* **input**  turn off autocapitalize/autocomplete where relevant ((00114845))
* **login**  fix more login corner cases ((f2cd350e))



<a name="5.0.5"></a>
## 5.0.5 (2015-01-25)


#### Bug Fixes


* **events**  fix the "my" tab showing up ((e43dcd75))
* **twitarr**  track user login immediately ((10a603dc))



<a name="5.0.4"></a>
## 5.0.4 (2015-01-24)


#### Bug Fixes


* **twitarr**  only show reply/like/new-tweet when logged in ((facaeb7b))
* **login**  broadcast login failure ((fa0d8893))
* **seamail**  update indicator when seamails are viewed ((d5c63f0f))
* **database**  make sure we always use websql, also clean up logging ((e44dc2eb))
* **events**
  *  don't show favorites/edit/etc. when not logged in ((a0ade2c5))
  *  rework event refreshing to clean up nav issues ((b27dc9e9))
* **notifications**  clean up notification code and initialization ((51b45d5f))



<a name="5.0.3"></a>
## 5.0.3 (2015-01-24)


#### Bug Fixes


* **settings**  fix layout of slider bar ((807d7171))
* **events**
  *  refresh on change ((961db0d3))
  *  clean up hour format ((68b8aa2b))
* **twitarr**  reply should also @ the author of the replied tweet ;) ((283ed85b))
* **amenities**  fix exception when matching decks ((a2a01313))
* **navigation**  normalize menu navigation and back button usage ((50e01ee6))



<a name="5.0.2"></a>
## 5.0.2 (2015-01-20)


#### Bug Fixes


* **seamail**  wrap seamail message text ((c0d02579))



<a name="5.0.1"></a>
## 5.0.1 (2015-01-20)


#### Bug Fixes


* **events**  events with carriage returns display correctly ((365ea62d))
* **performance**  clean up navigation in event views ((1a130dcc))

#### Features


* **twitarr**  click an image in twitarr to view it ((d8a07bed))



<a name="5.0.0"></a>
## 5.0.0 (2015-01-19)


#### Bug Fixes


* **twitarr**  image upload works on Android now ((b72fc7a6))
* **images**  use xhr rather than native download ((29dd8337))
* **events**
  *  clean up layout of long summaries ((08590dc5))
  *  avoid round-trips, improve event-change responsiveness ((1ee487cf))
* **amenities**  search now shows deck headers properly ((1182b034))

#### Features


* **events**  make username clickable ((3f599400))
* **settings**  make refresh configurable ((0b24ee76))
* **search**  search highlights matches, other tweaks ((4a581bd5))



<a name="4.9.7"></a>
## 4.9.7 (2015-01-19)


#### Bug Fixes


* **menu**  fix seamail count, also change login to modal ((e73409bc))
* **images**  fix image cache on IOS ((f991d74f))
* **events**
  *  refactor event view, responsiveness should be MUCH better ((5f56729e))
  *  public icon is just an indicator ((0dda1735))
* ****
  *  too many to count ((de0666e5))
  *  tons of bug fixes thanks to feedback from the best tester ;) ((538d6250))
* **logging**  don't say 'Synchronizing Events' on startup ((4576be03))

#### Features


* **twitarr**  implemented image cache ((3fbbafcc))



<a name="4.9.6"></a>
## 4.9.6 (2015-01-16)


#### Bug Fixes


* **seamail**
  *  fix seamail layout; also new seamail from user detail ((52b7160f))
  *  fix layout so messages scroll but input does not ((5d535caf))
* **twitarr**
  *  don't scroll when repositioning ((61065ba3))
  *  add postSeamail, move Array prototypes to Twitarr ((94ea5785))
  *  make sure user popups open in the right place ((5a40cbf1))
* **ui**  lots of minor UI cleanups ((7b1c8a28))
* **http**  use a longer timeout for the slow server ((75baa048))

#### Features


* **announcements**  post announcement notifications ((477abe55))
* **twitarr**
  *  tweet posting and replying ((67dc1fbd))
  *  tweet posting and replying ((6af7d8de))
  *  tweet posting now works ((12ae4bbd))
  *  UI updates (user detail, refresh timeline updates) ((1a33e166))
* **ui**  add user detail view ((ab04a286))
* **seamail**
  *  put the header back in ((fa897817))
  *  create new seamail threads ((20ea182b))
  *  user detail when clicking avatar ((333622e2))



<a name="4.9.5"></a>
## 4.9.5 (2015-01-15)


#### Bug Fixes


* **seamail**
  *  refresh the view when a seamail is marked read ((23a1e651))
  *  show a loading dialog ((81b106cd))
* **validation**  make sure event summary is really set before submitting ((62719207))
* **performance**  sped up karaoke list on devices, reduced memory ((16507c48))
* **events**  update even when modified ((1025aafd))
* **notifications**
  *  keep background-check running on android ((13bb3766))
  *  do not mark messages as seen until they complete ((e0902ccb))
* **login**  make sure we re-login on startup to refresh keys ((5c0936ab))
* **layout**  tabs at bottom, also replace ion-nav-bar with ion-header-bar ((cec43e5d))
* **db**  karaoke list now working properly on iOS and Android ((22e0e083))
* **twitarr**  cache-bust the status check ((ae849dc1))
* **ui**  fix a bunch of nav issues reported by Chordash ((73f8902e))
* **initialization**  do not use isWebView() for Cordova detection ((ff08a292))

#### Features


* **twitarr**
  *  add date stamp to the tweet list ((4176fd98))
  *  check status when logged in ((cc9da1ac))
  *  show an error message if communication with twit-arr failed ((4731f215))
  *  added read-only twit-arr timeline support ((65d6db3f))
* **layout**  shrunk side menu to 180 pixels ((f85d4d78))
* **notifications**
  *  mention notifications, clear badge when foregrounded ((6504ea16))
  *  working background notifications ((75947fad))
* **seamail**
  *  incomplete support for posting seamail ((f525069d))
  *  local notifications on new seamail(s) ((14f0f444))
  *  view and respond to seamails ((c920d6bc))
* **ui**  handle keyboard input in search better ((f5d4e3e5))

