
var mongoose = require('mongoose');

var subjectSchema = mongoose.Schema({
	mturkId: String,
	clientId: String,
});

var Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
