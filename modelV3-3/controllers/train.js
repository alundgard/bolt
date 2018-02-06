
// -----------------------------------------------------------------------------
// Train Route
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/train', function(req, res) {
		res.render('./pages/train');
	});

	return router;
}
