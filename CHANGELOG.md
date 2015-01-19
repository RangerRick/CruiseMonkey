<a name="4.9.7"</a>
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



<a name="4.9.6"</a>
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



<a name="4.9.5"</a>
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

