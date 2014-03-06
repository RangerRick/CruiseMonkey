function(doc, req) {
	return req && req.query && req.query.username && doc && doc.username && req.query.username === doc.username;
}