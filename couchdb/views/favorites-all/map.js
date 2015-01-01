function(doc) {
	if (doc.type === 'favorite') {
		emit(doc.username, doc._id);
	}
}