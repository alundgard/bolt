
// -----------------------------------------------------------------------------
// Test Route
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/test', function(req, res) {
		res.render('./pages/test');
	});

	return router;
}
