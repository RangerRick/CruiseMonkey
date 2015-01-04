function(doc, req) {
	if (doc._id.indexOf('event:2015:') === 0) {
		if (doc._deleted || doc.deleted) {
			return true;
		}
		if (doc.isPublic) {
			return true;
		}
	} else if (doc._id.indexOf('_design/') === 0) {
		return true;
	}
	return false;
}
