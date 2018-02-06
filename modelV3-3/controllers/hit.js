
// -----------------------------------------------------------------------------
// Instruction Page Route for Retainer Model
// -----------------------------------------------------------------------------

module.exports = function(router) {

	router.get('/instr', function(req, res) {
		res.render('./pages/instr');
	});

	return router;
}
