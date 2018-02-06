
var future = require('./future.js');
var debug = require('./debug.js');
var subjs = require('../models/subjs.js');

module.exports = {

	/*==============================================================================
		SUBJECT Object
			Each client/worker has their own SUBJECT object
	*/
	SUBJ: function(_io,_clientId,_mturkId) {

		this.io = _io;
		this.clientId = _clientId;
		this.mturkId = _mturkId;

		this.DB = new subjs({ 
					mturkId: this.mturkId, 
					clientId: this.clientId,
					});
		this.DB.save();
	}
}
