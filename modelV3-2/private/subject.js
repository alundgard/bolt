
var future = require('./future.js');
var debug = require('./debug.js');
var db = require('../models/db.js');

module.exports = {

	/*==============================================================================
		SUBJECT Object
			Each client/worker has their own SUBJECT object
	*/
	SUBJ: function(_io,_clientId,_mturkId,_phaseType,_pathType,_pfTime,_roundTime) {

		this.io = _io;
		this.clientId = _clientId;
		this.mturkId = _mturkId;
		this.phaseType = _phaseType;

		this.pathType = _pathType;
		this.pfTime = _pfTime;
		this.roundTime = _roundTime;

		this.GAME_EXISTS = false;
		this.GAME_STATE = {};

		// Hardcoded params
		this.N = 2; // Num time steps to look ahead
		this.A = 4; // Num acts to execute per round
		this.G = 4; // Grid dimension 
		this.B = 4; // Num lightning bolts

		this.POSSIBLE_FUTURES = new future.PF(
					this.pathType,
					this.io,
					this.clientId,
					this.N, 
					this.G,
					this.B);

		this.DB = new db({ 
					mturkId: this.mturkId, 
					clientId: this.clientId,
					phaseType: this.phaseType,
					pathType: this.pathType,
					pfTiime: this.pfTime,
					roundTime: this.roundTime
					});
		this.DB.save();
	}
}
