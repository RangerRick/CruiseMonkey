function(doc, req) {
	var username;
	if (req && req.query && req.query.username) {
		username = req.query.username;
	}
	if (username && (doc._id.indexOf('favorite:' + username + ':') === 0 || doc._id.indexOf('favorite-' + username + '-') === 0)) {
		// my favorite, sync it
		return true;
	}
	if (doc._id.indexOf('_design/') === 0) {
		// also sync the design doc
		return true;
	}
	return false;
}
