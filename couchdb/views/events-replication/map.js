function(doc) {
	if (doc.type === 'event') {
		emit(doc._id);
	} else if (doc._id.indexOf('_design') === 0) {
		emit(doc._id);
	}
}
