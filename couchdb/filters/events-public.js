function(doc, req) {
	if (doc.type === 'event' && doc.isPublic) {
		return true;
	} else if (doc._id.indexOf('_design/') === 0) {
		return true;
	} else if (doc._id.indexOf('favorite:') === 0) {
		// skip IDs we know are for favorites
		return false;
	} else if (doc._deleted || doc.deleted) {
		// any deleted doc
		return true;
	}
	return false;
}