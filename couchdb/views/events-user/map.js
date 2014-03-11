function(doc) {
	if (doc.type === 'event') {
		emit(doc.username, doc._id);
	}
}