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

