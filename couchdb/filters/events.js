function(doc, req) {
	if (doc._id.indexOf('event:2015:') === 0) {
		return true;
	} else if (doc._id.indexOf('_design/') === 0) {
		return true;
	}
	return false;
}
