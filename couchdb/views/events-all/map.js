function(doc) {
	if (doc._id.indexOf('event:2015:') === 0) {
		emit(doc._id);
	}
}
