
// -----------------------------------------------------------------------------
// Main route
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/login', function(req, res) {
		res.render('./pages/login');
	});

	return router;
}