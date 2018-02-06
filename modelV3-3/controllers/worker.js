
// -----------------------------------------------------------------------------
// Worker Route
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/worker', function(req, res) {
		res.render('./pages/worker');
	});

	return router;
}
