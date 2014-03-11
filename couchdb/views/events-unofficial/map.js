function(doc) {
	if (doc.type === 'event' && doc.username !== 'official' && doc.isPublic) {
		emit(doc._id);
	}
}