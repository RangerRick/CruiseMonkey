function(doc) {
	if (doc.type === 'favorite' && doc._id.indexOf('favorite:') === 0) {
		emit(doc.username, doc._id);
	}
}
