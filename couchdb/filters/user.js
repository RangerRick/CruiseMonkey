function(doc, req) {
	var isEvent = (doc._id.indexOf('event:2015:') === 0),
		isFavorite = (doc._id.indexOf('favorite:2015:') === 0),
		isDesign = (doc._id.indexOf('_design/') === 0);

	if (req && req.query && req.query.username) {
		// username defined, return matching documents
		if (doc.username && req.query.username === doc.username) {
			// my document
			return true;
		}
		if (doc._id.indexOf('favorite:2015:' + req.query.username + ':') === 0) {
			// my favorite
			return true;
		}
	} else {
		// username not defined, return only official/public docs
		if (isEvent && doc.isPublic) {
			return true;
		}
	}
	if ((isEvent || isFavorite) && (doc._deleted || doc.deleted)) {
		// any deleted docs
		return true;
	}
	if (isDesign) {
		// also sync the design doc
		return true;
	}
	return false;
}
