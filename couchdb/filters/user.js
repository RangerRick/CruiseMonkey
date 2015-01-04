function(doc, req) {
	if (req && req.query && req.query.username) {
		// username defined, return matching documents

		if (doc.username && req.query.username === doc.username) {
			// my document
			return true;
		}
		if (doc._id && (doc._id.indexOf('favorite:' + req.query.username + ':') === 0 || doc._id.indexOf('favorite-' + req.query.username + '-'))) {
			// my favorite
			return true;
		}
	} else {
		// username not defined, return only official docs
		if (doc.isPublic) {
			return true;
		}
	}
	if (doc._deleted || doc.deleted) {
		// any deleted docs
		return true;
	}
	if (doc._id.indexOf('_design/') === 0) {
		// also sync the design doc
		return true;
	}
	return false;
}
