function(doc) {
	if (doc._id.indexOf('favorite:2015:') === 0) {
		emit(doc.username, doc._id);
	}
}
