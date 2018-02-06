
// -----------------------------------------------------------------------------
// Index Route
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/', function(req, res) {
		res.render('./pages/index');
	});

	return router;
}
