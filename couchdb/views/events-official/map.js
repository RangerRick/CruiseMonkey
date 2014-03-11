function(doc) {
	if (doc.type === 'event' && doc.username === 'official') {
		emit(doc._id);
	}
}