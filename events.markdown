Notifications
=============

cruisemonkey.notify.alert
-------------------------

Sent when a dialog alert message needs to be displayed.  Passed an Object with the following properties:

* message: the alert message (required)
* title: the title of the alert (optional)
* buttonName: the text on the alert button

cruisemonkey.notify.toast
-------------------------

Sent when a toast message needs to be displayed.  Passed an Object with the following properties:

* message: the toast message (required)
* timeout: how long to show the toast (optional)

User
====

cruisemonkey.user.settings-changed
----------------------------------

Sent whenever the user's settings have changed.  Passed an Object with the following properties:

* databaseRoot: the root URL for the remote database
* databaseName: the name of the database
* databaseReplicate: whether to replicate from the remote database
* openInChrome: whether to open URLs in Chrome
* twitarrRoot: the root URL for Twit-arr

cruisemonkey.user.updated
-------------------------

Sent when a user logs in or out.  Passed an Object representing the user with the following properties:

* username: the user's username
* password: the user's password
* loggedIn: whether or not the user is logged in

