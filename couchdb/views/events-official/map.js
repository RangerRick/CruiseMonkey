function(doc) {
	if (doc._id.indexOf('event:2015:') === 0 && doc.username === 'official') {
		emit(doc._id);
	}
}
