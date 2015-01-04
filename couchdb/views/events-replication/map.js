function(doc) {
	if (doc._id.indexOf('event:2015:') === 0) {
		emit(doc._id);
	} else if (doc._id.indexOf('_design/') === 0) {
		emit(doc._id);
	}
}
