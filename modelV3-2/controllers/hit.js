
// -----------------------------------------------------------------------------
// Hit Route
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/hit', function(req, res) {
		res.render('./pages/hit');
	});

	return router;
}
