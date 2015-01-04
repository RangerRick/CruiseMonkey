function(doc) {
	if (doc._id.indexOf('event:2015:') === 0 && doc.username !== 'official' && doc.isPublic) {
		emit(doc._id);
	}
}
