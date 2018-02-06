var mongoose = require('mongoose');

var paramsSchema = mongoose.Schema({
    roundTime: Number,
	pathType: String,
	numResp: Number
});

paramsSchema.statics.findLeast = function(callback) {
	// Look at the params in db
	this.findOne()
	.sort({'numResp':'ascending'})// ascending
	.exec(function(err, member) {
		member.numResp++;
		console.log('least member found: ',member);
		member.save();
		// Call back to get member variables
		callback(member);
	});
}

var Params = mongoose.model('Params', paramsSchema);
module.exports = Params;
