function(doc) {
	if (doc.type === 'event' && doc.isPublic) {
		emit(doc._id);
	}
}