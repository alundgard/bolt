
// -----------------------------------------------------------------------------
// Waiting Page Route for Retainer Model
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/wait', function(req, res) {
		res.render('./pages/wait');
	});

	return router;
}
